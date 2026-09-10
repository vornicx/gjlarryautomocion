begin;
alter policy public_inventory on public.fleet_vehicles to anon;
alter policy operator_inventory on public.fleet_vehicles
 using (status in ('published','reserved') or (select larry_private.is_operator()));
alter policy fleet_photo_read on storage.objects to anon;
alter policy fleet_operator_photo_read on storage.objects
 using(bucket_id='fleet' and ((select larry_private.is_operator()) or exists(select 1 from public.fleet_vehicles v where v.gallery @> jsonb_build_array(jsonb_build_object('src',name)))));

create or replace function public.valid_fleet_gallery(items jsonb) returns boolean
language plpgsql immutable security invoker set search_path = '' as $$
declare item jsonb; paths text[] := '{}';
begin
 if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) > 20 then return false; end if;
 for item in select value from jsonb_array_elements(items) loop
  if jsonb_typeof(item) <> 'object' or jsonb_typeof(item->'src') is distinct from 'string' or
     not (item->>'src' ~ '^assets/images/[a-z0-9-]+\.webp$' or item->>'src' ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.jpg$') or
     (item ? 'alt' and jsonb_typeof(item->'alt') <> 'string') or
     length(coalesce(item->>'alt','')) > 200 or
     (item - 'src' - 'alt') <> '{}'::jsonb or item->>'src' = any(paths)
     then return false; end if;
  paths := array_append(paths,item->>'src');
 end loop;
 return true;
end;
$$;
commit;
