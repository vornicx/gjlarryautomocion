begin;
alter table public.fleet_vehicles add column gallery jsonb not null default '[]';
create function public.valid_fleet_gallery(items jsonb) returns boolean
language plpgsql immutable security invoker set search_path = '' as $$
declare item jsonb;
begin
 if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) > 20 then return false; end if;
 for item in select value from jsonb_array_elements(items) loop
  if jsonb_typeof(item) <> 'object' or item->>'src' is null or
     not (item->>'src' ~ '^assets/images/[a-z0-9-]+\.webp$' or item->>'src' ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.jpg$') or
     length(coalesce(item->>'alt','')) > 200 then return false; end if;
 end loop;
 return true;
end;
$$;
revoke all on function public.valid_fleet_gallery(jsonb) from public;
grant execute on function public.valid_fleet_gallery(jsonb) to anon, authenticated;
alter table public.fleet_vehicles add constraint fleet_gallery_valid check(public.valid_fleet_gallery(gallery));
alter table public.fleet_vehicles add constraint published_has_photo check(status not in ('published','reserved') or jsonb_array_length(gallery)>0);
grant insert(gallery), update(gallery) on public.fleet_vehicles to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('fleet','fleet',false,8388608,array['image/jpeg']);
create policy fleet_photo_read on storage.objects for select to anon, authenticated
using(bucket_id='fleet' and exists(select 1 from public.fleet_vehicles v where v.gallery @> jsonb_build_array(jsonb_build_object('src',name))));
create policy fleet_operator_photo_read on storage.objects for select to authenticated
using(bucket_id='fleet' and (select larry_private.is_operator()));
create policy fleet_photo_upload on storage.objects for insert to authenticated
with check(bucket_id='fleet' and (select larry_private.is_operator()) and name ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.jpg$' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy fleet_unused_photo_delete on storage.objects for delete to authenticated
using(bucket_id='fleet' and (select larry_private.is_operator()) and not exists(select 1 from public.fleet_vehicles v where v.gallery @> jsonb_build_array(jsonb_build_object('src',name))));
create function public.fleet_operator_access() returns boolean
language sql stable security invoker set search_path = '' as $$
 select larry_private.is_operator();
$$;
revoke all on function public.fleet_operator_access() from public, anon;
grant execute on function public.fleet_operator_access() to authenticated;
commit;
