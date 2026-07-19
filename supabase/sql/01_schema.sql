begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum (
    'admin',
    'catalog_manager',
    'seller',
    'finance_manager',
    'collections'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.customer_status as enum ('active', 'inactive', 'prospect');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.loan_status as enum (
    'draft', 'active', 'paid', 'overdue', 'cancelled', 'written_off'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.installment_status as enum (
    'pending', 'partial', 'paid', 'overdue', 'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create sequence if not exists public.product_code_seq start 1000;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.app_role not null default 'seller',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slug text not null unique,
  name text not null check (char_length(trim(name)) >= 3),
  category text not null check (char_length(trim(category)) >= 2),
  brand text not null default 'Genérica',
  price numeric(12,2) check (price is null or price >= 0),
  previous_price numeric(12,2) check (
    previous_price is null or (previous_price >= 0 and previous_price > coalesce(price, 0))
  ),
  description text not null default '',
  stock integer check (stock is null or stock >= 0),
  featured boolean not null default false,
  offer boolean not null default false,
  is_new boolean not null default true,
  published boolean not null default false,
  color text not null default 'A confirmar',
  material text not null default 'A confirmar',
  dimensions text not null default 'A confirmar',
  features text[] not null default '{}',
  keywords text[] not null default '{}',
  image_url text not null,
  image_path text,
  original_image_path text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.bazar_customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) >= 3),
  phone text,
  email text,
  address text,
  notes text,
  status public.customer_status not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (phone is not null or email is not null)
);

create table if not exists public.customer_interactions (
  id bigint generated always as identity primary key,
  customer_id uuid not null references public.bazar_customers(id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'phone', 'facebook', 'instagram', 'store', 'other')),
  summary text not null,
  occurred_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.loan_customers (
  id uuid primary key default gen_random_uuid(),
  file_number bigint generated always as identity unique,
  full_name text not null,
  document_type text not null default 'DNI',
  document_number text not null unique,
  tax_id text,
  birth_date date,
  phone text not null,
  email text,
  address text not null,
  employment_notes text,
  private_notes text,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.loan_customers(id) on delete restrict,
  loan_number bigint generated always as identity unique,
  principal numeric(14,2) not null check (principal > 0),
  interest_rate numeric(7,4) not null check (interest_rate >= 0),
  total_amount numeric(14,2) not null check (total_amount >= principal),
  installment_count integer not null check (installment_count > 0 and installment_count <= 120),
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly')),
  first_due_date date not null,
  status public.loan_status not null default 'draft',
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.loan_installments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete restrict,
  installment_number integer not null check (installment_number > 0),
  due_date date not null,
  amount numeric(14,2) not null check (amount > 0),
  paid_amount numeric(14,2) not null default 0 check (paid_amount >= 0),
  status public.installment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (loan_id, installment_number)
);

create table if not exists public.loan_payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete restrict,
  installment_id uuid references public.loan_installments(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  paid_at timestamptz not null default now(),
  method text not null check (method in ('cash', 'transfer', 'other')),
  reference text,
  notes text,
  received_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  area text not null check (area in ('catalog', 'customers', 'loans', 'security')),
  action text not null,
  entity_table text not null,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists products_public_catalog_idx
  on public.products (featured desc, created_at desc)
  where published = true and archived_at is null;
create index if not exists products_category_idx
  on public.products (category, created_at desc)
  where archived_at is null;
create index if not exists products_search_idx
  on public.products using gin (
    to_tsvector('spanish', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(brand, ''))
  );
create index if not exists bazar_customers_active_name_idx
  on public.bazar_customers (status, full_name)
  where archived_at is null;
create index if not exists customer_interactions_customer_id_idx
  on public.customer_interactions (customer_id, occurred_at desc);
create index if not exists loans_customer_id_idx on public.loans (customer_id);
create index if not exists loans_status_created_idx on public.loans (status, created_at desc);
create index if not exists loan_installments_loan_id_idx on public.loan_installments (loan_id);
create index if not exists loan_installments_due_pending_idx
  on public.loan_installments (due_date)
  where status in ('pending', 'partial', 'overdue');
create index if not exists loan_payments_loan_id_idx on public.loan_payments (loan_id, paid_at desc);
create index if not exists loan_payments_installment_id_idx on public.loan_payments (installment_id);
create index if not exists audit_log_actor_id_idx on public.audit_log (actor_id, created_at desc);
create index if not exists audit_log_entity_idx on public.audit_log (entity_table, entity_id);

commit;
