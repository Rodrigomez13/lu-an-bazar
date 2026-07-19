begin;

create or replace function private.has_any_role(required_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.active = true
      and p.role = any(required_roles)
  );
$$;

revoke all on function private.has_any_role(public.app_role[]) from public;
grant usage on schema private to authenticated;
grant execute on function private.has_any_role(public.app_role[]) to authenticated;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.bazar_customers enable row level security;
alter table public.customer_interactions enable row level security;
alter table public.loan_customers enable row level security;
alter table public.loans enable row level security;
alter table public.loan_installments enable row level security;
alter table public.loan_payments enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or (select private.has_any_role(array['admin']::public.app_role[]))
  );

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
  for all to authenticated
  using ((select private.has_any_role(array['admin']::public.app_role[])))
  with check ((select private.has_any_role(array['admin']::public.app_role[])));

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon, authenticated
  using (published = true and archived_at is null);

drop policy if exists products_staff_read on public.products;
create policy products_staff_read on public.products
  for select to authenticated
  using ((select private.has_any_role(array['admin','catalog_manager','seller']::public.app_role[])));

drop policy if exists products_staff_insert on public.products;
create policy products_staff_insert on public.products
  for insert to authenticated
  with check ((select private.has_any_role(array['admin','catalog_manager']::public.app_role[])));

drop policy if exists products_staff_update on public.products;
create policy products_staff_update on public.products
  for update to authenticated
  using ((select private.has_any_role(array['admin','catalog_manager']::public.app_role[])))
  with check ((select private.has_any_role(array['admin','catalog_manager']::public.app_role[])));

drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete on public.products
  for delete to authenticated
  using ((select private.has_any_role(array['admin']::public.app_role[])));

drop policy if exists bazar_customers_staff_all on public.bazar_customers;
create policy bazar_customers_staff_all on public.bazar_customers
  for all to authenticated
  using ((select private.has_any_role(array['admin','catalog_manager','seller']::public.app_role[])))
  with check ((select private.has_any_role(array['admin','catalog_manager','seller']::public.app_role[])));

drop policy if exists customer_interactions_staff_all on public.customer_interactions;
create policy customer_interactions_staff_all on public.customer_interactions
  for all to authenticated
  using ((select private.has_any_role(array['admin','catalog_manager','seller']::public.app_role[])))
  with check ((select private.has_any_role(array['admin','catalog_manager','seller']::public.app_role[])));

drop policy if exists loan_customers_finance_all on public.loan_customers;
create policy loan_customers_finance_all on public.loan_customers
  for all to authenticated
  using ((select private.has_any_role(array['admin','finance_manager','collections']::public.app_role[])))
  with check ((select private.has_any_role(array['admin','finance_manager','collections']::public.app_role[])));

drop policy if exists loans_finance_all on public.loans;
create policy loans_finance_all on public.loans
  for all to authenticated
  using ((select private.has_any_role(array['admin','finance_manager','collections']::public.app_role[])))
  with check ((select private.has_any_role(array['admin','finance_manager']::public.app_role[])));

drop policy if exists loan_installments_finance_all on public.loan_installments;
create policy loan_installments_finance_all on public.loan_installments
  for all to authenticated
  using ((select private.has_any_role(array['admin','finance_manager','collections']::public.app_role[])))
  with check ((select private.has_any_role(array['admin','finance_manager','collections']::public.app_role[])));

drop policy if exists loan_payments_finance_all on public.loan_payments;
create policy loan_payments_finance_all on public.loan_payments
  for all to authenticated
  using ((select private.has_any_role(array['admin','finance_manager','collections']::public.app_role[])))
  with check ((select private.has_any_role(array['admin','finance_manager','collections']::public.app_role[])));

drop policy if exists audit_admin_read on public.audit_log;
create policy audit_admin_read on public.audit_log
  for select to authenticated
  using ((select private.has_any_role(array['admin']::public.app_role[])));

revoke all on all tables in schema public from anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.bazar_customers to authenticated;
grant select, insert, update, delete on public.customer_interactions to authenticated;
grant select, insert, update on public.loan_customers to authenticated;
grant select, insert, update on public.loans to authenticated;
grant select, insert, update on public.loan_installments to authenticated;
grant select, insert on public.loan_payments to authenticated;
grant select on public.audit_log to authenticated;
grant usage, select on all sequences in schema public to authenticated;

commit;
