-- SpendLens Database Schema
-- Run this in your Supabase SQL editor

-- Audits table
create table if not exists audits (
  id text primary key,
  share_slug text unique not null,
  input jsonb not null,
  recommendations jsonb not null,
  total_monthly_spend numeric(10,2) not null default 0,
  total_monthly_savings numeric(10,2) not null default 0,
  total_annual_savings numeric(10,2) not null default 0,
  ai_summary text,
  created_at timestamptz not null default now()
);

-- Leads table
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company text,
  role text,
  team_size integer,
  audit_id text references audits(id),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists audits_share_slug_idx on audits(share_slug);
create index if not exists audits_created_at_idx on audits(created_at desc);
create index if not exists leads_email_idx on leads(email);
create index if not exists leads_created_at_idx on leads(created_at desc);

-- RLS: audits are publicly readable (for share links)
alter table audits enable row level security;
create policy "Audits are publicly readable" on audits for select using (true);
create policy "Service role can insert audits" on audits for insert with check (true);

-- RLS: leads are private
alter table leads enable row level security;
create policy "Service role only" on leads for all using (false);
