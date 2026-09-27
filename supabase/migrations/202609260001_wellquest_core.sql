create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  birth_date date,
  age_range text not null default '65-74',
  goals text[] not null default '{}',
  categories text[] not null default '{}',
  interests text[] not null default '{}',
  difficulty text not null default 'gentle',
  avatar_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.quests (
  id text primary key,
  name text not null,
  activity_id text,
  category text not null check (category in ('fitness', 'sport', 'outdoor', 'other')),
  intensity text not null check (intensity in ('gentle', 'moderate', 'active')),
  event_date date not null,
  event_time time not null,
  location text not null,
  baseline_participants integer not null default 0 check (baseline_participants >= 0),
  booked_count integer not null default 0 check (booked_count >= 0),
  capacity integer check (capacity is null or capacity >= 1),
  created_by uuid references public.profiles(id) on delete set null,
  created_by_name text not null default 'WellQuest community',
  description text,
  venue_name text,
  venue_link text,
  trainer text,
  partner_preview boolean not null default false,
  lat double precision,
  lng double precision,
  image_url text,
  image_credit text,
  image_credit_url text,
  is_seed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  quest_id text not null references public.quests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (quest_id, user_id)
);

create index if not exists quests_event_date_time_idx on public.quests(event_date, event_time);
create index if not exists bookings_user_id_idx on public.bookings(user_id);

alter table public.profiles enable row level security;
alter table public.quests enable row level security;
alter table public.bookings enable row level security;
grant select, insert, update on public.profiles to authenticated;
grant select on public.quests to anon, authenticated;
grant insert on public.quests to authenticated;
grant select on public.bookings to authenticated;
revoke update, delete on public.quests from authenticated;

create policy "Authenticated users can read community profiles" on public.profiles
  for select to authenticated using (true);
create policy "Users can create their own profile" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "Users can update their own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Quests are readable by everyone" on public.quests
  for select to anon, authenticated using (true);
create policy "Users can create their own quests" on public.quests
  for insert to authenticated with check (created_by = (select auth.uid()) and not is_seed);
create policy "Owners can update their own quests" on public.quests
  for update to authenticated using (created_by = (select auth.uid()) and not is_seed)
  with check (created_by = (select auth.uid()) and not is_seed);
create policy "Owners can delete their own quests" on public.quests
  for delete to authenticated using (created_by = (select auth.uid()) and not is_seed);

create policy "Users can read their own bookings" on public.bookings
  for select to authenticated using (user_id = (select auth.uid()));
revoke insert, update, delete on public.bookings from anon, authenticated;

create or replace function public.create_profile_for_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, first_name, last_name, birth_date, age_range, goals, categories, interests, difficulty)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    coalesce(new.raw_user_meta_data ->> 'age_range', '65-74'),
    coalesce(array(select jsonb_array_elements_text(coalesce(new.raw_user_meta_data -> 'goals', '[]'::jsonb))), '{}'),
    coalesce(array(select jsonb_array_elements_text(coalesce(new.raw_user_meta_data -> 'categories', '[]'::jsonb))), '{}'),
    coalesce(array(select jsonb_array_elements_text(coalesce(new.raw_user_meta_data -> 'interests', '[]'::jsonb))), '{}'),
    coalesce(new.raw_user_meta_data ->> 'difficulty', 'gentle')
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users
  for each row execute procedure public.create_profile_for_auth_user();

create or replace function public.join_quest(p_quest_id text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  quest_row public.quests%rowtype;
  starts_at timestamptz;
begin
  if (select auth.uid()) is null then raise exception 'Sign in to book a quest.'; end if;
  select * into quest_row from public.quests where id = p_quest_id for update;
  if not found then raise exception 'Quest not found.'; end if;
  starts_at := (quest_row.event_date + quest_row.event_time) at time zone 'America/Vancouver';
  if starts_at <= now() then raise exception 'This quest has already started.'; end if;
  if exists (select 1 from public.bookings where quest_id = p_quest_id and user_id = (select auth.uid())) then return; end if;
  if quest_row.capacity is not null and quest_row.baseline_participants + quest_row.booked_count >= quest_row.capacity then
    raise exception 'This quest is full.';
  end if;
  insert into public.bookings (quest_id, user_id) values (p_quest_id, (select auth.uid()));
  update public.quests set booked_count = booked_count + 1 where id = p_quest_id;
end;
$$;

create or replace function public.cancel_quest(p_quest_id text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  quest_row public.quests%rowtype;
  starts_at timestamptz;
begin
  if (select auth.uid()) is null then raise exception 'Sign in to manage a booking.'; end if;
  select * into quest_row from public.quests where id = p_quest_id for update;
  if not found then raise exception 'Quest not found.'; end if;
  starts_at := (quest_row.event_date + quest_row.event_time) at time zone 'America/Vancouver';
  if starts_at - now() < interval '1 hour' then raise exception 'Bookings can only be cancelled at least one hour before the quest.'; end if;
  delete from public.bookings where quest_id = p_quest_id and user_id = (select auth.uid());
  if found then update public.quests set booked_count = greatest(0, booked_count - 1) where id = p_quest_id; end if;
end;
$$;

grant execute on function public.join_quest(text) to authenticated;
grant execute on function public.cancel_quest(text) to authenticated;
revoke execute on function public.join_quest(text) from public, anon;
revoke execute on function public.cancel_quest(text) from public, anon;

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;
drop policy if exists "Avatar photos are publicly viewable" on storage.objects;
create policy "Avatar photos are publicly viewable" on storage.objects
  for select using (bucket_id = 'avatars');
drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar" on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar" on storage.objects
  for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'quests') then
    alter publication supabase_realtime add table public.quests;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bookings') then
    alter publication supabase_realtime add table public.bookings;
  end if;
end $$;

insert into public.quests (id, name, activity_id, category, intensity, event_date, event_time, location, baseline_participants, capacity, created_by_name, description, lat, lng, image_url, image_credit, image_credit_url, is_seed)
values
('starter-walk', 'Morning seawall walk', 'seawall-walk', 'outdoor', 'gentle', current_date + 1, '09:00', 'Jericho Beach Park, Vancouver', 5, 8, 'WellQuest community', 'A relaxed, flat waterfront stroll with time to pause, chat, and enjoy the view.', 49.2722, -123.1978, 'https://images.unsplash.com/photo-1752560090014-01b60274fd02?auto=format&fit=crop&w=1800&q=82', 'Valerie', 'https://unsplash.com/photos/city-skyline-overlooks-water-and-a-beach-lGRHKVAHodE', true),
('starter-tennis', 'Friendly doubles tennis', 'tennis', 'sport', 'moderate', current_date + 2, '10:00', 'Jericho Beach Tennis Courts, Vancouver', 3, 6, 'WellQuest community', 'A friendly doubles game with warm-up time and a social pace.', 49.2722, -123.1978, null, null, null, true),
('starter-pickleball', 'Pickleball for all levels', 'pickleball', 'sport', 'gentle', current_date + 3, '11:00', 'West Point Grey Community Centre, Vancouver', 4, 8, 'WellQuest community', 'Meet a few neighbours for easygoing games. Equipment can be shared.', 49.2719, -123.2034, null, null, null, true),
('starter-stretch', 'Easy stretch in the garden', 'mobility-studio', 'outdoor', 'gentle', current_date + 4, '09:30', 'Vanier Park, Vancouver', 2, 6, 'WellQuest community', 'A gentle outdoor mobility session. Bring a mat or use a park bench.', 49.2767, -123.1324, null, null, null, true),
('preview-k-strength', 'K-Strength foundations', null, 'fitness', 'moderate', current_date + 1, '10:00', '1296 Homer St, Vancouver, BC', 4, 8, 'WellQuest partner preview', 'A coach-led strength session with room to work at your own pace. Class details and instructor are demo placeholders.', 49.274, -123.123, null, null, null, true),
('preview-k-mobility', 'Balance & mobility', null, 'fitness', 'gentle', current_date + 2, '09:30', '2020 Arbutus St, Vancouver, BC', 3, 7, 'WellQuest partner preview', 'A gentle movement class with balance and mobility practice. Class details and instructor are demo placeholders.', 49.268, -123.152, null, null, null, true),
('preview-af-coordination', 'Coordination & strength', null, 'fitness', 'moderate', current_date + 3, '17:30', '103-2180 Dollarton Hwy, North Vancouver, BC', 5, 9, 'WellQuest partner preview', 'A small-group coordination and strength session. Class details and instructor are demo placeholders.', 49.326, -123.073, null, null, null, true),
('preview-af-mindbody', 'Mind-body reset', null, 'fitness', 'gentle', current_date + 4, '11:00', '503 15th St, West Vancouver, BC', 2, 6, 'WellQuest partner preview', 'A slower-paced class focused on breathing, balance, and mindful movement. Class details and instructor are demo placeholders.', 49.328, -123.14, null, null, null, true)
on conflict (id) do nothing;
