create table if not exists demos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  idea text not null,
  vibe text,
  demo_html text not null,
  brief jsonb not null,
  is_public boolean default true,
  created_at timestamptz default now()
);

alter table demos enable row level security;

create policy if not exists "Users manage own demos" on demos
  for all using (auth.uid() = user_id);

create policy if not exists "Public read" on demos
  for select using (is_public = true);


-- Credits tracking (1 free demo per new user)
create table if not exists user_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  credits integer not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_credits enable row level security;

create policy "Users read own credits" on user_credits
  for select using (auth.uid() = user_id);

-- Auto-create credits row when a new user signs up
create or replace function handle_new_user_credits()
returns trigger as $$
begin
  insert into user_credits (user_id, credits)
  values (new.id, 1)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_credits
  after insert on auth.users
  for each row execute function handle_new_user_credits();

-- Payments log
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  paystack_reference text unique not null,
  amount_pesewas integer not null,
  credits_purchased integer not null default 1,
  status text not null default 'pending',
  created_at timestamptz default now()
);

alter table payments enable row level security;

create policy "Users read own payments" on payments
  for select using (auth.uid() = user_id);

-- User profiles (mirrors auth.users with queryable public data)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users read own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users update own profile" on profiles
  for update using (auth.uid() = id);

-- Auto-create profile when a new user signs up
create or replace function handle_new_user_profile()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function handle_new_user_profile();

-- Atomic credit deduction: returns true if deducted, false if insufficient
create or replace function deduct_credit(uid uuid)
returns boolean as $$
declare
  rows_affected integer;
begin
  update user_credits
  set credits = credits - 1, updated_at = now()
  where user_id = uid and credits > 0;

  get diagnostics rows_affected = row_count;
  return rows_affected > 0;
end;
$$ language plpgsql security definer;

-- Refund a credit (e.g. when generation fails after deduction)
create or replace function refund_credit(uid uuid)
returns void as $$
begin
  update user_credits
  set credits = credits + 1, updated_at = now()
  where user_id = uid;
end;
$$ language plpgsql security definer;
