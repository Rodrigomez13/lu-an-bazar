begin;

create table if not exists public.meta_posts (
  id uuid primary key default gen_random_uuid(),
  direction text not null check (direction in ('outbound', 'inbound')),
  platform text not null default 'facebook' check (platform in ('facebook', 'instagram')),
  source text not null default 'manual' check (source in ('manual', 'product', 'facebook_post', 'instagram_post')),
  status text not null default 'draft' check (
    status in ('draft', 'pending_review', 'publishing', 'published', 'failed', 'approved', 'rejected', 'archived')
  ),
  product_id uuid references public.products(id) on delete set null,
  external_post_id text unique,
  message text not null default '',
  draft_title text,
  draft_description text,
  draft_price numeric(12,2) check (draft_price is null or draft_price >= 0),
  draft_category text,
  image_url text,
  link_url text,
  permalink_url text,
  scheduled_for timestamptz,
  published_at timestamptz,
  last_error text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meta_posts_status_updated_idx
  on public.meta_posts (status, updated_at desc);
create index if not exists meta_posts_product_id_idx
  on public.meta_posts (product_id, created_at desc)
  where product_id is not null;
create index if not exists meta_posts_direction_created_idx
  on public.meta_posts (direction, created_at desc);

alter table public.meta_posts enable row level security;

drop policy if exists meta_posts_staff_read on public.meta_posts;
create policy meta_posts_staff_read on public.meta_posts
  for select to authenticated
  using ((select private.has_any_role(array['admin','catalog_manager']::public.app_role[])));

drop policy if exists meta_posts_staff_insert on public.meta_posts;
create policy meta_posts_staff_insert on public.meta_posts
  for insert to authenticated
  with check ((select private.has_any_role(array['admin','catalog_manager']::public.app_role[])));

drop policy if exists meta_posts_staff_update on public.meta_posts;
create policy meta_posts_staff_update on public.meta_posts
  for update to authenticated
  using ((select private.has_any_role(array['admin','catalog_manager']::public.app_role[])))
  with check ((select private.has_any_role(array['admin','catalog_manager']::public.app_role[])));

drop policy if exists meta_posts_admin_delete on public.meta_posts;
create policy meta_posts_admin_delete on public.meta_posts
  for delete to authenticated
  using ((select private.has_any_role(array['admin']::public.app_role[])));

revoke all on public.meta_posts from public, anon, authenticated;
grant select, insert, update, delete on public.meta_posts to authenticated;
grant select, insert, update, delete on public.meta_posts to service_role;

drop trigger if exists set_updated_at on public.meta_posts;
create trigger set_updated_at
  before update on public.meta_posts
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
    when tg_table_name in ('products', 'meta_posts') then 'catalog'
    when tg_table_name in ('bazar_customers','customer_interactions') then 'customers'
    else 'loans'
  end;
  row_id := coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id');

  insert into public.audit_log (
    actor_id, area, action, entity_table, entity_id, old_data, new_data
  ) values (
    (select auth.uid()), area_name, lower(tg_op), tg_table_name, row_id,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function private.audit_row_change() from public;

drop trigger if exists audit_row_change on public.meta_posts;
create trigger audit_row_change
  after insert or update or delete on public.meta_posts
  for each row execute function private.audit_row_change();

commit;
