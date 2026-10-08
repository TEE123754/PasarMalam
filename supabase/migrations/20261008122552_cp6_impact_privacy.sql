begin;
create or replace function public.cp6_impact_source() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare raw jsonb;rows jsonb;weights jsonb;
begin
raw=private.cp6_impact_raw();
raw=jsonb_set(raw,'{engagement}',(select coalesce(jsonb_agg((e-'actors')||jsonb_build_object('active_users',case when (e->>'actors')::int>=5 then e->'actors' else 'null'::jsonb end,'actors',case when (e->>'actors')::int>=5 then 5 else 0 end,'events',case when (e->>'actors')::int>=5 then e->'events' else 'null'::jsonb end)),'[]'::jsonb) from jsonb_array_elements(raw->'engagement') e));
raw=jsonb_set(raw,'{concerns}',(select coalesce(jsonb_agg((e-'reporters')||jsonb_build_object('reporters',case when (e->>'reporters')::int>=5 then 5 else 0 end,'reports',case when (e->>'reporters')::int>=5 then e->'reports' else 'null'::jsonb end)),'[]'::jsonb) from jsonb_array_elements(raw->'concerns') e));
if private.has_role('vendor') or private.has_role('admin') then return raw;end if;
-- Organisers receive market/day aggregates only, never individual batch/source amounts.
with batches as (
 select b.*,s.value->>'market' as market from jsonb_array_elements(raw->'batches') v,
 jsonb_to_record(v.value) as b(id text,stall text,session text,prepared integer,transfer_in integer,remaining integer),
 jsonb_array_elements(raw->'stalls') s where s.value->>'id'=b.stall
), movements as (
 select m.batch,sum(m.units) as consumed from jsonb_array_elements(raw->'movements') v,
 jsonb_to_record(v.value) as m(batch text,units integer) group by m.batch
), close as (
 select c.batch,c.remaining from jsonb_array_elements(raw->'closings') v,
 jsonb_to_record(v.value) as c(batch text,remaining integer)
), sessions as (
 select b.market,b.stall,b.session,sum(b.prepared) as prepared,sum(c.remaining) as leftovers,
 bool_and(c.batch is not null and c.remaining is not null) as closed,
 bool_and(coalesce(b.prepared is not null and b.remaining is not null and b.prepared+coalesce(b.transfer_in,0)-coalesce(m.consumed,0)=b.remaining,false)) as reconciled
 from batches b left join movements m on m.batch=b.id left join close c on c.batch=b.id group by b.market,b.stall,b.session
), grouped as (
 select market,session,count(*) as n,count(*) filter(where closed and reconciled and prepared>0) as valid,
 sum(prepared) filter(where closed and reconciled and prepared>0) as prepared,
 sum(leftovers) filter(where closed and reconciled and prepared>0) as leftovers from sessions group by market,session
)
select coalesce(jsonb_agg(jsonb_build_object('market',market,'date',session,'stall','market aggregate',
'prepared',case when valid>=5 then prepared end,'closing_leftovers',case when valid>=5 then leftovers end,
'closed',valid>=5,'reconciled',valid>=5,'suppressed',valid<5,'included_stalls',case when valid>=5 then valid end,
'excluded_stalls',case when n>=5 then n-valid end)),'[]'::jsonb) into rows from grouped;

with inputs as (
 select s.market_id as market,(b.prepared_at at time zone 'Asia/Kuala_Lumpur')::date as date,f.stall_id,m.kind as route,m.units,
 case when w.id is not null then 'weighed' when sample.id is not null then 'estimated' else 'unknown' end as method,
 case when w.id is not null then (w.data->>'grams')::numeric/1000 when sample.id is not null then (sample.data->>'grams')::numeric/(sample.data->>'portions')::numeric*m.units/1000 end as kg,
 (coalesce(w.data,sample.data)->>'uncertainty_pct')::numeric as uncertainty,
 (coalesce(w.data,sample.data)->>'portions')::integer as sample_count
 from private.cp5_movements m join public.batches b on b.id=m.batch join public.food_items f on f.id=b.food_item_id join public.stalls s on s.id=f.stall_id
 left join lateral (select r.* from private.cp6_records r where r.kind='weight-sample' and r.data->>'method'='weighed-route' and r.data->>'movement'=m.id limit 1)w on true
 left join lateral (select r.* from private.cp6_records r where r.kind='weight-sample' and r.data->>'method'='portion-sample' and r.data->>'food'=f.id::text and (r.data->>'measured_at')::timestamptz between m.at-interval '30 days' and m.at order by (r.data->>'measured_at')::timestamptz desc,r.id limit 1)sample on true
 where private.cp6_scope(f.stall_id) and m.kind<>'transfer-out'
), grouped as (
 select market,date,route,method,count(distinct stall_id) as stalls,sum(units) as units,sum(kg) as kg,max(uncertainty) as uncertainty,max(sample_count) as sample_count from inputs group by market,date,route,method
)
select coalesce(jsonb_agg(jsonb_build_object('market',market,'date',date,'source',market||':'||date||':'||route||':'||method,'route',route,'method',method,
'portions',case when stalls>=5 then units end,'kg',case when stalls>=5 then round(kg,4) end,'uncertainty_pct',case when stalls>=5 then uncertainty end,
'sample_count',case when stalls>=5 then sample_count end,'sample_date',date,'suppressed',stalls<5)),'[]'::jsonb) into weights from grouped;

return jsonb_build_object('now',raw->'now','sessions',rows,'engagement',raw->'engagement','concerns',raw->'concerns',
'posting',(select coalesce(jsonb_agg(jsonb_build_object('market',p->>'market','date',p->>'date','batches',case when
(select count(distinct f.stall_id) from private.cp6_events e join public.batches b on b.id=e.session join public.food_items f on f.id=b.food_item_id join public.stalls s on s.id=f.stall_id where e.kind='batch-post' and s.market_id=(p->>'market')::uuid and (b.prepared_at at time zone 'Asia/Kuala_Lumpur')::date=(p->>'date')::date)>=5 then p->'batches' else 'null'::jsonb end)),'[]'::jsonb) from jsonb_array_elements(raw->'posting') p),
'aggregate_weights',weights,'weights','[]'::jsonb,'movements','[]'::jsonb);
end $$;
commit;
