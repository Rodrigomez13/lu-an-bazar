begin;

create or replace view public.catalog_products
with (security_invoker = true)
as
select
  id, code, slug, name, category, brand, price, previous_price,
  description, stock, featured, offer, is_new, color, material,
  dimensions, features, keywords, image_url, created_at, updated_at
from public.products
where published = true and archived_at is null;

create or replace view public.loan_portfolio_summary
with (security_invoker = true)
as
select
  l.id,
  l.loan_number,
  l.customer_id,
  c.full_name as customer_name,
  l.principal,
  l.total_amount,
  l.status,
  coalesce(sum(i.amount - i.paid_amount) filter (
    where i.status in ('pending','partial','overdue')
  ), 0) as outstanding_amount,
  count(*) filter (where i.status = 'overdue') as overdue_installments,
  min(i.due_date) filter (where i.status in ('pending','partial','overdue')) as next_due_date
from public.loans l
join public.loan_customers c on c.id = l.customer_id
left join public.loan_installments i on i.loan_id = l.id
group by l.id, c.full_name;

revoke all on public.catalog_products from anon, authenticated;
grant select on public.catalog_products to anon, authenticated;
revoke all on public.loan_portfolio_summary from anon;
grant select on public.loan_portfolio_summary to authenticated;

commit;

-- Consultas operativas de ejemplo. Se dejan comentadas para no modificar datos.

-- Productos publicados y destacados:
-- select * from public.catalog_products order by featured desc, created_at desc;

-- Stock bajo:
-- select code, name, stock from public.products
-- where archived_at is null and stock is not null and stock <= 5
-- order by stock, name;

-- Cuotas vencidas (sólo desde una sesión financiera autorizada):
-- select i.*, c.full_name, c.phone
-- from public.loan_installments i
-- join public.loans l on l.id = i.loan_id
-- join public.loan_customers c on c.id = l.customer_id
-- where i.status in ('pending','partial','overdue') and i.due_date < current_date
-- order by i.due_date;
