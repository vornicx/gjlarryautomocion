-- Integration test; all fixtures and edits are rolled back.
begin;
insert into auth.users(id) values('11111111-1111-4111-8111-111111111111');
insert into larry_private.operators(user_id) values('11111111-1111-4111-8111-111111111111');
insert into public.fleet_vehicles(slug,brand,model,status) values('access-test-private','Test','Private','draft');
set local role anon;
do $$ begin
 if exists(select 1 from public.fleet_vehicles where slug='access-test-private') then raise exception 'Draft leaked'; end if;
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
 update public.fleet_vehicles set model='Edited' where slug='access-test-private' and version=1;
 get diagnostics n = row_count;
 if n <> 1 then raise exception 'Operator update failed'; end if;
 update public.fleet_vehicles set model='Stale' where slug='access-test-private' and version=1;
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
 update public.fleet_vehicles set status='archived' where slug='access-test-private' and version=2;
 if not exists(select 1 from public.fleet_vehicles where slug='access-test-private' and version=3 and status='archived') then raise exception 'Archive failed'; end if;
end $$;
rollback;
