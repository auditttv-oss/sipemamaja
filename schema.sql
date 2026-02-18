-- SIPEMA Enterprise - Supabase Schema + RLS
create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum ('SUPER_ADMIN', 'ADMIN_CLUSTER', 'TECHNICIAN', 'RESIDENT');
create type public.unit_status as enum ('Available', 'Booked', 'Sold', 'Handover');
create type public.complaint_status as enum ('Pending', 'Proses', 'Selesai', 'Ditolak');

-- Core profile linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role public.user_role not null default 'RESIDENT',
  cluster text,
  unit text,
  bast_date date,
  resident_id uuid,
  unit_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clusters (
  id text primary key,
  name text not null,
  manager_name text,
  total_units integer not null default 0,
  occupied_units integer not null default 0,
  cash_balance bigint not null default 0,
  security_status text not null default 'Aman',
  last_audit_date date
);

create table if not exists public.units (
  id text primary key,
  cluster_id text not null references public.clusters(id) on delete restrict,
  cluster text not null,
  block text not null,
  number text not null,
  type text not null,
  status public.unit_status not null default 'Available',
  land_area integer,
  owner_name text,
  resident_status text,
  phone_number text,
  family_members integer default 0,
  bast_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.residents (
  id uuid primary key default gen_random_uuid(),
  unit_id text not null references public.units(id) on delete restrict,
  name text not null,
  phone text,
  status text not null default 'Active',
  join_date date,
  created_at timestamptz not null default now()
);

alter table public.profiles
  drop constraint if exists profiles_resident_id_fkey;
alter table public.profiles
  add constraint profiles_resident_id_fkey
  foreign key (resident_id) references public.residents(id) on delete set null;

alter table public.profiles
  drop constraint if exists profiles_unit_id_fkey;
alter table public.profiles
  add constraint profiles_unit_id_fkey
  foreign key (unit_id) references public.units(id) on delete set null;

create table if not exists public.invoices (
  id text primary key,
  resident_id uuid not null references public.residents(id) on delete cascade,
  unit_id text references public.units(id) on delete set null,
  month text not null,
  year integer not null,
  amount bigint not null,
  status text not null default 'Unpaid',
  due_date date not null,
  category text not null,
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id text primary key default ('CP-' || floor(extract(epoch from now()) * 1000)::text),
  resident_id uuid not null references public.residents(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  category text not null,
  sub_category text,
  subject text,
  description text not null,
  photo_url text,
  status public.complaint_status not null default 'Pending',
  priority text default 'Medium',
  is_warranty boolean default false,
  created_at timestamptz not null default now(),
  upvotes integer not null default 0
);

create table if not exists public.leads (
  id text primary key,
  name text not null,
  phone text not null,
  interest text,
  budget text,
  source text,
  status text,
  notes text,
  assigned_agent text,
  created_at date not null default current_date
);

create table if not exists public.vendors (
  id text primary key,
  name text not null,
  service_type text,
  contact_person text,
  phone text,
  email text,
  status text,
  contract_start date,
  contract_end date,
  monthly_cost bigint default 0
);

create table if not exists public.ledger_entries (
  id text primary key,
  cluster_id text references public.clusters(id) on delete set null,
  date date not null,
  category text,
  description text not null,
  amount bigint not null,
  proof_url text
);

create table if not exists public.marketplace_items (
  id text primary key,
  title text not null,
  seller_name text not null,
  price bigint not null,
  category text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id text primary key,
  user_id text,
  rekening_ipl text,
  nominal bigint,
  referensi text,
  nama text,
  blok text,
  nomor_rumah text,
  status text default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.house_types (
  id text primary key,
  name text not null,
  description text
);

-- Helper function for role checks
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Trigger to auto create profile from auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), 'RESIDENT')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.clusters enable row level security;
alter table public.units enable row level security;
alter table public.residents enable row level security;
alter table public.invoices enable row level security;
alter table public.complaints enable row level security;
alter table public.leads enable row level security;
alter table public.vendors enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.marketplace_items enable row level security;
alter table public.payments enable row level security;
alter table public.house_types enable row level security;

-- Admin full access all tables
create policy "admin_full_profiles" on public.profiles for all using (public.current_user_role() = 'SUPER_ADMIN') with check (public.current_user_role() = 'SUPER_ADMIN');
create policy "admin_full_clusters" on public.clusters for all using (public.current_user_role() = 'SUPER_ADMIN') with check (public.current_user_role() = 'SUPER_ADMIN');
create policy "admin_full_units" on public.units for all using (public.current_user_role() = 'SUPER_ADMIN') with check (public.current_user_role() = 'SUPER_ADMIN');
create policy "admin_full_residents" on public.residents for all using (public.current_user_role() = 'SUPER_ADMIN') with check (public.current_user_role() = 'SUPER_ADMIN');
create policy "admin_full_invoices" on public.invoices for all using (public.current_user_role() = 'SUPER_ADMIN') with check (public.current_user_role() = 'SUPER_ADMIN');
create policy "admin_full_complaints" on public.complaints for all using (public.current_user_role() = 'SUPER_ADMIN') with check (public.current_user_role() = 'SUPER_ADMIN');
create policy "admin_full_leads" on public.leads for all using (public.current_user_role() = 'SUPER_ADMIN') with check (public.current_user_role() = 'SUPER_ADMIN');
create policy "admin_full_vendors" on public.vendors for all using (public.current_user_role() = 'SUPER_ADMIN') with check (public.current_user_role() = 'SUPER_ADMIN');
create policy "admin_full_ledger_entries" on public.ledger_entries for all using (public.current_user_role() = 'SUPER_ADMIN') with check (public.current_user_role() = 'SUPER_ADMIN');
create policy "admin_full_payments" on public.payments for all using (public.current_user_role() = 'SUPER_ADMIN') with check (public.current_user_role() = 'SUPER_ADMIN');
create policy "admin_full_house_types" on public.house_types for all using (public.current_user_role() = 'SUPER_ADMIN') with check (public.current_user_role() = 'SUPER_ADMIN');

-- Residents: see own unit + invoices, create complaints
create policy "resident_select_own_unit" on public.units
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'RESIDENT'
      and p.unit_id = units.id
  )
);

create policy "resident_select_own_invoice" on public.invoices
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'RESIDENT'
      and p.resident_id = invoices.resident_id
  )
);

create policy "resident_create_complaint" on public.complaints
for insert
with check (
  auth.uid() is not null
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'RESIDENT'
      and p.resident_id = complaints.resident_id
  )
);

create policy "resident_view_own_complaint" on public.complaints
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.resident_id = complaints.resident_id
  )
);

-- Public marketplace read-only
create policy "public_read_marketplace" on public.marketplace_items
for select
to public
using (true);
