-- Car Service Portal — database schema
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)

-- 1. Profiles (extends Supabase auth.users with a role + contact info)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Vehicles belonging to a customer
create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  make text not null,
  model text not null,
  year int,
  plate text,
  created_at timestamptz not null default now()
);

-- 3. Services the shop offers
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null default 60,
  price_cents int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. Bookings
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  service_id uuid not null references services(id),
  scheduled_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','in_progress','completed','cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

-- Helpful index for admin calendar / listing views
create index if not exists bookings_scheduled_at_idx on bookings (scheduled_at);
create index if not exists bookings_customer_idx on bookings (customer_id);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table profiles enable row level security;
alter table vehicles enable row level security;
alter table services enable row level security;
alter table bookings enable row level security;

-- profiles: a user can read/update their own profile; admins can read all
create policy "profiles_select_own_or_admin"
  on profiles for select
  using (auth.uid() = id or exists (
    select 1 from profiles p where p.id = auth.uid() and p.is_admin
  ));

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = id);

-- vehicles: owner can manage their own; admins can read all
create policy "vehicles_select_own_or_admin"
  on vehicles for select
  using (auth.uid() = owner_id or exists (
    select 1 from profiles p where p.id = auth.uid() and p.is_admin
  ));

create policy "vehicles_insert_own"
  on vehicles for insert
  with check (auth.uid() = owner_id);

create policy "vehicles_update_own"
  on vehicles for update
  using (auth.uid() = owner_id);

create policy "vehicles_delete_own"
  on vehicles for delete
  using (auth.uid() = owner_id);

-- services: everyone (incl. anonymous) can read active services; only admins write
create policy "services_select_all"
  on services for select
  using (true);

create policy "services_admin_write"
  on services for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- bookings: customer sees/manages their own; admin sees/manages all
create policy "bookings_select_own_or_admin"
  on bookings for select
  using (auth.uid() = customer_id or exists (
    select 1 from profiles p where p.id = auth.uid() and p.is_admin
  ));

create policy "bookings_insert_own"
  on bookings for insert
  with check (auth.uid() = customer_id);

create policy "bookings_update_own_or_admin"
  on bookings for update
  using (auth.uid() = customer_id or exists (
    select 1 from profiles p where p.id = auth.uid() and p.is_admin
  ));

-- ---------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user signs up
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- Seed data — starter services (edit freely, or manage from /admin/services)
-- ---------------------------------------------------------------------
insert into services (name, description, duration_minutes, price_cents) values
  ('Oil Change', 'Full synthetic oil & filter replacement', 30, 6500),
  ('Brake Inspection', 'Pad, rotor and fluid check', 45, 4500),
  ('Tire Rotation', 'Rotate and balance all four tires', 30, 3500),
  ('Full Inspection', 'Multi-point vehicle health check', 60, 8900)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- To make yourself an admin after signing up once through the app:
--   update profiles set is_admin = true where id = 'YOUR_USER_UUID';
-- (find your UUID in Authentication -> Users in the Supabase dashboard)
-- ---------------------------------------------------------------------
