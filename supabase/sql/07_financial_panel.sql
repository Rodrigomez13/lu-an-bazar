begin;

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(key)) >= 2)
);

insert into public.app_settings (key, value, description)
values (
  'finance',
  jsonb_build_object(
    'defaultInterestRate', 30,
    'defaultInstallments', 6,
    'defaultFrequency', 'monthly',
    'graceDays', 3,
    'lateFeeRate', 0,
    'reminderTemplate', 'Hola {nombre}, te recordamos que la cuota #{cuota} del préstamo #{prestamo} tiene un saldo de {saldo} y venció el {vencimiento}. Por favor comunicate con nosotros para regularizarla.'
  ),
  'Parámetros privados del módulo financiero'
)
on conflict (key) do nothing;

drop trigger if exists set_updated_at on public.app_settings;
create trigger set_updated_at
  before update on public.app_settings
  for each row execute function private.set_updated_at();

create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  area_name text;
  row_id text;
begin
  area_name := case
    when tg_table_name = 'products' then 'catalog'
    when tg_table_name in ('bazar_customers','customer_interactions') then 'customers'
    when tg_table_name in ('profiles','app_settings') then 'security'
    else 'loans'
  end;
  row_id := coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id', to_jsonb(new) ->> 'key', to_jsonb(old) ->> 'key');

  insert into public.audit_log (
    actor_id, area, action, entity_table, entity_id, old_data, new_data
  ) values (
    coalesce(
      (select auth.uid()),
      nullif(to_jsonb(new) ->> 'updated_by', '')::uuid,
      nullif(to_jsonb(new) ->> 'received_by', '')::uuid,
      nullif(to_jsonb(new) ->> 'created_by', '')::uuid,
      nullif(to_jsonb(old) ->> 'updated_by', '')::uuid,
      nullif(to_jsonb(old) ->> 'created_by', '')::uuid
    ),
    area_name,
    lower(tg_op),
    tg_table_name,
    row_id,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke execute on function private.audit_row_change() from public, anon, authenticated, service_role;

-- Los cambios de perfiles se registran desde la API para atribuir correctamente
-- al administrador que modifica a otro usuario.
drop trigger if exists audit_row_change on public.profiles;

drop trigger if exists audit_row_change on public.app_settings;
create trigger audit_row_change
  after insert or update or delete on public.app_settings
  for each row execute function private.audit_row_change();

alter table public.app_settings enable row level security;

drop policy if exists app_settings_finance_read on public.app_settings;
create policy app_settings_finance_read on public.app_settings
  for select to authenticated
  using ((select private.has_any_role(array['admin','finance_manager','collections']::public.app_role[])));

drop policy if exists app_settings_admin_write on public.app_settings;
create policy app_settings_admin_write on public.app_settings
  for all to authenticated
  using ((select private.has_any_role(array['admin']::public.app_role[])))
  with check ((select private.has_any_role(array['admin']::public.app_role[])));

create or replace function public.create_loan_with_installments(
  p_customer_id uuid,
  p_principal numeric,
  p_interest_rate numeric,
  p_installment_count integer,
  p_frequency text,
  p_first_due_date date,
  p_notes text default null,
  p_actor_id uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_loan_id uuid;
  v_total numeric(14,2);
  v_regular_amount numeric(14,2);
  v_amount numeric(14,2);
  v_due_date date;
  v_number integer;
begin
  if p_principal is null or p_principal <= 0 then
    raise exception 'El capital debe ser mayor que cero';
  end if;
  if p_interest_rate is null or p_interest_rate < 0 or p_interest_rate > 1000 then
    raise exception 'La tasa de interés no es válida';
  end if;
  if p_installment_count is null or p_installment_count < 1 or p_installment_count > 120 then
    raise exception 'La cantidad de cuotas debe estar entre 1 y 120';
  end if;
  if p_frequency not in ('weekly','biweekly','monthly') then
    raise exception 'La frecuencia no es válida';
  end if;
  if not exists (
    select 1 from public.loan_customers
    where id = p_customer_id and active = true and archived_at is null
  ) then
    raise exception 'El cliente no existe o está inactivo';
  end if;

  v_total := round(p_principal * (1 + p_interest_rate / 100), 2);
  if v_total < p_installment_count * 0.01 then
    raise exception 'El total es insuficiente para la cantidad de cuotas';
  end if;
  v_regular_amount := round(v_total / p_installment_count, 2);

  insert into public.loans (
    customer_id, principal, interest_rate, total_amount,
    installment_count, frequency, first_due_date, status, notes, created_by, approved_by
  ) values (
    p_customer_id, round(p_principal, 2), p_interest_rate, v_total,
    p_installment_count, p_frequency, p_first_due_date, 'active', nullif(trim(p_notes), ''), p_actor_id, p_actor_id
  ) returning id into v_loan_id;

  for v_number in 1..p_installment_count loop
    v_amount := case
      when v_number = p_installment_count then v_total - (v_regular_amount * (p_installment_count - 1))
      else v_regular_amount
    end;
    v_due_date := case p_frequency
      when 'weekly' then p_first_due_date + ((v_number - 1) * 7)
      when 'biweekly' then p_first_due_date + ((v_number - 1) * 14)
      else (p_first_due_date + make_interval(months => v_number - 1))::date
    end;
    insert into public.loan_installments (
      loan_id, installment_number, due_date, amount, status
    ) values (
      v_loan_id, v_number, v_due_date, v_amount, 'pending'
    );
  end loop;

  return v_loan_id;
end;
$$;

revoke all on function public.create_loan_with_installments(uuid,numeric,numeric,integer,text,date,text,uuid) from public, anon, authenticated;
grant execute on function public.create_loan_with_installments(uuid,numeric,numeric,integer,text,date,text,uuid) to service_role;

-- Los proyectos creados desde mayo de 2026 requieren permisos explícitos
-- para que las tablas se expongan a la Data API, incluso para service_role.
grant select, insert, update on public.profiles to service_role;
grant select, insert, update on public.products to service_role;
grant select, insert, update on public.bazar_customers to service_role;
grant select, insert, update on public.customer_interactions to service_role;
grant select, insert, update on public.loan_customers to service_role;
grant select, insert, update on public.loans to service_role;
grant select, insert, update on public.loan_installments to service_role;
grant select, insert on public.loan_payments to service_role;
grant select, insert on public.audit_log to service_role;
grant select, insert, update on public.app_settings to authenticated, service_role;
grant usage, select on all sequences in schema public to service_role;
grant select on public.catalog_products, public.loan_portfolio_summary to service_role;

commit;

-- Verificación sugerida después de ejecutar el archivo:
-- select key, value from public.app_settings where key = 'finance';
-- select has_function_privilege('service_role',
--   'public.create_loan_with_installments(uuid,numeric,numeric,integer,text,date,text,uuid)',
--   'execute');
