-- Reparación puntual para proyectos donde el panel financiero ya existe
-- pero public.app_settings todavía no fue creada o no figura en PostgREST.
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

-- La aplicación usa la secret key únicamente en el servidor. Los permisos
-- authenticated siguen sujetos a las políticas RLS anteriores.
grant select, insert, update on public.app_settings to authenticated, service_role;

commit;

notify pgrst, 'reload schema';

-- Verificación:
-- select key, value from public.app_settings where key = 'finance';
