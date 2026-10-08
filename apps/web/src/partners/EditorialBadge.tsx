import { COMMUNITY_KEY } from '../community/gateway'
import sample from '../../../../contracts/discovery-fixture.json'
import { useQuery } from '@tanstack/react-query'
import { selectedMode } from '../app/config'
import { connectedRequest } from '../auth/client'
import { DEMO_KEY } from '../vendor/gateway'
import { publicPartners, type Partners } from './model'
export function EditorialBadge({stall}:{stall:string}){const demo=selectedMode()==='fixture';const q=useQuery({queryKey:['partner-public',demo],queryFn:async()=>{if(demo){const s=(JSON.parse(localStorage.getItem(DEMO_KEY)??'{}') as {partners?:Partners}).partners;const operations=JSON.parse(localStorage.getItem(COMMUNITY_KEY)??"{}") as {operations?:{stalls:Record<string,boolean>}};return s?publicPartners(s,new Set(sample.stalls.filter(s=>operations.operations?.stalls[s.id]!==false).map(s=>s.id))):[]}const r=await connectedRequest('/api/v1/partners/public');if(!r.ok)return [];return r.json() as Promise<ReturnType<typeof publicPartners>>},refetchInterval:10000});return q.data?.some(e=>e.kind==='collaboration'&&e.stall===stall)?<p>Featured by RasaTrail · Community food guide</p>:null}
