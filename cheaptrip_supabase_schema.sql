-- CheapTrip AI Scanner mock-first Supabase schema
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  full_name text,
  telegram_chat_id text,
  created_at timestamptz default now()
);

create table if not exists searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  origin text not null,
  destination text not null,
  departure_date date,
  return_date date,
  flexible_dates boolean default false,
  travelers integer default 1,
  max_budget numeric,
  stay_type text,
  language text default 'English',
  created_at timestamptz default now()
);

create table if not exists flight_results (
  id uuid primary key default gen_random_uuid(),
  search_id uuid references searches(id) on delete cascade,
  airline text,
  price numeric,
  stops integer,
  duration_hours numeric,
  flexible_savings numeric,
  score integer,
  affiliate_url text,
  created_at timestamptz default now()
);

create table if not exists hotel_results (
  id uuid primary key default gen_random_uuid(),
  search_id uuid references searches(id) on delete cascade,
  name text,
  nightly_rate numeric,
  total_price numeric,
  rating numeric,
  free_cancellation boolean default false,
  location_quality integer,
  score integer,
  affiliate_url text,
  created_at timestamptz default now()
);

create table if not exists stay_results (
  id uuid primary key default gen_random_uuid(),
  search_id uuid references searches(id) on delete cascade,
  name text,
  inventory_label text,
  nightly_rate numeric,
  cleaning_fee numeric,
  total_price numeric,
  rating numeric,
  free_cancellation boolean default false,
  location_quality integer,
  score integer,
  affiliate_url text,
  created_at timestamptz default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  origin text not null,
  destination text not null,
  departure_date date,
  return_date date,
  travelers integer default 1,
  stay_type text,
  target_price numeric not null,
  language text default 'English',
  enabled boolean default true,
  last_triggered_at timestamptz,
  created_at timestamptz default now()
);
