import { useQuery } from '@tanstack/react-query'
import { selectedMode } from '../app/config'
import { ui } from '../locales/phrases'
import { publicData } from './gateway'
import { fixtureClock } from '../app/clock'
export function PublicFlag({stall}:{stall:string}){const mode=selectedMode();const q=useQuery({queryKey:['community-public',mode],queryFn:()=>publicData(mode),refetchInterval:60000,refetchIntervalInBackground:false});const now=mode==='fixture'?fixtureClock.now().getTime():Date.now();const flag=q.data?.flags.find(f=>f.stall===stall&&Date.parse(f.expires)>now);return flag?<p className="privacy-notice">{ui('Reports under review')}{flag.reply&&<span> · {ui('Approved hawker reply')}: {flag.reply}</span>}</p>:null}
