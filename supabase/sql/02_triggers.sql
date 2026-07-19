begin;

create schema if not exists private;
revoke all on schema private from public;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.slugify(value text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(
    translate(lower(coalesce(value, '')),
      'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

create or replace function private.prepare_product()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  prefix text;
  base_slug text;
begin
  prefix := case new.category
    when 'Cocina y bebidas' then 'COC'
    when 'Electrodomésticos' then 'ELE'
    when 'Cuidado personal' then 'CUI'
    when 'Salud y bienestar' then 'SAL'
    when 'Tecnología' then 'TEC'
    when 'Hogar' then 'HOG'
    else 'PRO'
  end;

  if new.code is null or trim(new.code) = '' then
    new.code := prefix || '-' || lpad(nextval('public.product_code_seq')::text, 5, '0');
  end if;

  if new.slug is null or trim(new.slug) = '' then
    base_slug := private.slugify(new.name);
    new.slug := base_slug;
    if exists (select 1 from public.products p where p.slug = new.slug and p.id <> new.id) then
      new.slug := base_slug || '-' || lower(substr(replace(new.id::text, '-', ''), 1, 6));
    end if;
  end if;

  new.offer := coalesce(new.offer, false) or new.previous_price is not null;
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function private.apply_installment_payment()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  installment public.loan_installments%rowtype;
begin
  if new.installment_id is null then
    return new;
  end if;

  select * into installment
  from public.loan_installments
  where id = new.installment_id and loan_id = new.loan_id
  for update;

  if not found then
    raise exception 'La cuota no pertenece al préstamo indicado';
  end if;
  if installment.paid_amount + new.amount > installment.amount then
    raise exception 'El pago supera el saldo de la cuota';
  end if;

  update public.loan_installments
  set
    paid_amount = paid_amount + new.amount,
    status = case
      when paid_amount + new.amount = amount then 'paid'::public.installment_status
      else 'partial'::public.installment_status
    end
  where id = new.installment_id;
  return new;
end;
$$;

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
    else 'loans'
  end;
  row_id := coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id');

  insert into public.audit_log (
    actor_id, area, action, entity_table, entity_id, old_data, new_data
  ) values (
    (select auth.uid()),
    area_name,
    lower(tg_op),
    tg_table_name,
    row_id,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

drop trigger if exists products_prepare on public.products;
create trigger products_prepare
  before insert or update of name, category, code, slug, previous_price, offer
  on public.products
  for each row execute function private.prepare_product();

drop trigger if exists apply_installment_payment on public.loan_payments;
create trigger apply_installment_payment
  after insert on public.loan_payments
  for each row execute function private.apply_installment_payment();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'products', 'bazar_customers', 'loan_customers',
    'loans', 'loan_installments'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()',
      table_name
    );
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'products', 'bazar_customers', 'customer_interactions',
    'loan_customers', 'loans', 'loan_installments', 'loan_payments'
  ] loop
    execute format('drop trigger if exists audit_row_change on public.%I', table_name);
    execute format(
      'create trigger audit_row_change after insert or update or delete on public.%I for each row execute function private.audit_row_change()',
      table_name
    );
  end loop;
end $$;

revoke execute on all functions in schema private from public;

commit;
