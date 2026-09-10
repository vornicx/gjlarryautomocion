-- Applied to the dedicated GJ Larry project sqniuavyijyrfigwyipw.
-- Run once in a transaction after project selection, then verify RLS with
-- anonymous, non-operator and operator sessions before connecting the website.
begin;

create schema if not exists larry_private;
revoke all on schema larry_private from public, anon, authenticated;
grant usage on schema larry_private to authenticated;

create table larry_private.operators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table larry_private.operators enable row level security;
revoke all on larry_private.operators from public, anon, authenticated;
grant select on larry_private.operators to authenticated;
create policy operator_self on larry_private.operators
  for select to authenticated using (user_id = (select auth.uid()));

-- SECURITY INVOKER: authorization comes from the protected membership table.
create function larry_private.is_operator() returns boolean
language sql stable security invoker set search_path = '' as $$
  select exists(select 1 from larry_private.operators where user_id = auth.uid());
$$;
revoke all on function larry_private.is_operator() from public, anon;
grant execute on function larry_private.is_operator() to authenticated;

create table public.fleet_vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 160),
  brand text not null check (length(trim(brand)) between 1 and 80),
  model text not null check (length(trim(model)) between 1 and 160),
  year integer check (year between 1900 and 2100),
  km integer check (km between 0 and 10000000),
  price numeric(12,2) check (price between 0 and 10000000),
  fuel text check (length(fuel) <= 60),
  gear text check (length(gear) <= 60),
  body text check (length(body) <= 80),
  color text check (length(color) <= 80),
  power text check (length(power) <= 60),
  drive text check (length(drive) <= 80),
  description text not null default '' check (length(description) <= 10000),
  equipment text[] not null default '{}' check (cardinality(equipment) <= 100),
  status text not null default 'draft' check (status in ('draft','published','reserved','sold','archived')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.fleet_vehicles enable row level security;
revoke all on public.fleet_vehicles from public, anon, authenticated;
grant select on public.fleet_vehicles to anon, authenticated;
grant insert (slug,brand,model,year,km,price,fuel,gear,body,color,power,drive,description,equipment,status)
  on public.fleet_vehicles to authenticated;
grant update (brand,model,year,km,price,fuel,gear,body,color,power,drive,description,equipment,status)
  on public.fleet_vehicles to authenticated;
create policy public_inventory on public.fleet_vehicles for select to anon, authenticated
  using (status in ('published','reserved'));
create policy operator_inventory on public.fleet_vehicles for select to authenticated
  using ((select larry_private.is_operator()));
create policy operator_create on public.fleet_vehicles for insert to authenticated
  with check ((select larry_private.is_operator()));
create policy operator_update on public.fleet_vehicles for update to authenticated
  using ((select larry_private.is_operator())) with check ((select larry_private.is_operator()));

-- Client updates must filter by id AND their last-read version; no returned
-- row means a conflict. System columns cannot be supplied by the client.
create function larry_private.bump_vehicle_version() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.version := old.version + 1;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function larry_private.bump_vehicle_version() from public, anon, authenticated;
create trigger fleet_version before update on public.fleet_vehicles
  for each row execute function larry_private.bump_vehicle_version();
create index fleet_public_listing on public.fleet_vehicles(created_at desc)
  where status in ('published','reserved');

-- No DELETE privilege: removing a vehicle archives it, preserving recovery.
-- Photo storage/policies and an atomic gallery update API are deliberately
-- not enabled until the dedicated project is available for integration tests.
commit;
