-- GETUPP Waitlist — Supabase setup
-- Run this in the Supabase SQL editor for your project.
-- Safe to run multiple times (uses IF NOT EXISTS / DROP IF EXISTS guards).

-- Create the waitlist table
create table if not exists waitlist (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null unique,
  source     text        not null default 'landing',
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table waitlist enable row level security;

-- Drop existing policy if it exists (so re-running this script is safe)
drop policy if exists "anon can insert waitlist" on waitlist;

-- Insert-only policy for the anonymous role.
-- The public anon key can INSERT but CANNOT select, update, or delete.
-- This means the email list is never exposed through the client-side key.
create policy "anon can insert waitlist"
  on waitlist
  for insert
  to anon
  with check (true);

-- Verify: check RLS is on and the policy exists
-- (you can run this separately to confirm)
-- select tablename, rowsecurity from pg_tables where tablename = 'waitlist';
-- select policyname, cmd, roles from pg_policies where tablename = 'waitlist';
