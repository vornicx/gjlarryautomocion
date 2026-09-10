-- Integration test; all fixtures and edits are rolled back.
begin;
insert into auth.users(id) values('11111111-1111-4111-8111-111111111111');
insert into larry_private.operators(user_id) values('11111111-1111-4111-8111-111111111111');
insert into public.fleet_vehicles(slug,brand,model,status) values('access-test-private','Test','Private','draft');
insert into storage.objects(bucket_id,name) values('fleet','11111111-1111-4111-8111-111111111111/33333333-3333-4333-8333-333333333333.jpg');
update public.fleet_vehicles set gallery='[{"src":"11111111-1111-4111-8111-111111111111/33333333-3333-4333-8333-333333333333.jpg","alt":"Test"}]' where slug='access-test-private';
set local role anon;
do $$ begin
 if exists(select 1 from public.fleet_vehicles where slug='access-test-private') then raise exception 'Draft leaked'; end if;
 if exists(select 1 from storage.objects where name='11111111-1111-4111-8111-111111111111/33333333-3333-4333-8333-333333333333.jpg') then raise exception 'Draft photo leaked'; end if;
 begin
  insert into public.fleet_vehicles(slug,brand,model) values('anon-write','Test','Denied');
  raise exception 'Anonymous write allowed';
 exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
 if public.fleet_operator_access() then raise exception 'Non-operator authorized'; end if;
 if exists(select 1 from public.fleet_vehicles where slug='access-test-private') then raise exception 'Private draft leaked'; end if;
 begin
  insert into public.fleet_vehicles(slug,brand,model) values('non-operator-write','Test','Denied');
  raise exception 'Non-operator write allowed';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ declare n integer; begin
 if not public.fleet_operator_access() then raise exception 'Operator denied'; end if;
 if not exists(select 1 from storage.objects where name='11111111-1111-4111-8111-111111111111/33333333-3333-4333-8333-333333333333.jpg') then raise exception 'Operator photo denied'; end if;
 update public.fleet_vehicles set model='Edited',gallery='[]' where slug='access-test-private' and version=2;
 get diagnostics n = row_count;
 if n <> 1 then raise exception 'Operator update failed'; end if;
 update public.fleet_vehicles set model='Stale' where slug='access-test-private' and version=2;
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'Stale update accepted'; end if;
 begin
  update public.fleet_vehicles set status='published' where slug='access-test-private';
  raise exception 'Published without photo';
 exception when check_violation then null; end;
 begin
  insert into larry_private.operators(user_id) values('22222222-2222-4222-8222-222222222222');
  raise exception 'Operator privilege escalation allowed';
 exception when insufficient_privilege then null; end;
 update public.fleet_vehicles set status='archived' where slug='access-test-private' and version=3;
 if not exists(select 1 from public.fleet_vehicles where slug='access-test-private' and version=4 and status='archived') then raise exception 'Archive failed'; end if;
 if public.valid_fleet_gallery('[{"src":"https://external.invalid/tracker.jpg"}]') then raise exception 'External gallery path accepted'; end if;
 if public.valid_fleet_gallery('[{"src":"assets/images/test.webp"},{"src":"assets/images/test.webp"}]') then raise exception 'Duplicate photo accepted'; end if;
end $$;
rollback;
