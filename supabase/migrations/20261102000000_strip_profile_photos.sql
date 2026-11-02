-- Don't keep the profile-photo URLs that 카카오/Google send at login. The app never shows
-- them, and the privacy policy (lib/legal.ts §2) says they are dropped as soon as they
-- arrive. Supabase Auth always asks 카카오 for profile_image (it can't be removed from the
-- request), so the photo has to be stripped here instead.
--
-- Since 2025-04-21 functions can't be created in the auth schema, but triggers on
-- auth.users / auth.identities are still allowed, so the functions live in public.

create or replace function public.strip_profile_photo_from_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb) - 'avatar_url' - 'picture';
  return new;
end;
$$;

create or replace function public.strip_profile_photo_from_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.identity_data := coalesce(new.identity_data, '{}'::jsonb) - 'avatar_url' - 'picture';
  return new;
end;
$$;

drop trigger if exists strip_profile_photo on auth.users;
create trigger strip_profile_photo
before insert or update of raw_user_meta_data on auth.users
for each row execute function public.strip_profile_photo_from_user();

drop trigger if exists strip_profile_photo on auth.identities;
create trigger strip_profile_photo
before insert or update of identity_data on auth.identities
for each row execute function public.strip_profile_photo_from_identity();

-- Remove the photos already stored for existing accounts.
update auth.users
set raw_user_meta_data = raw_user_meta_data - 'avatar_url' - 'picture'
where raw_user_meta_data ?| array['avatar_url', 'picture'];

update auth.identities
set identity_data = identity_data - 'avatar_url' - 'picture'
where identity_data ?| array['avatar_url', 'picture'];
