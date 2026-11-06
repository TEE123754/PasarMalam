import { useState } from 'react'
import { demoImages, type DemoImageKey } from './demo-images'
import { ImagePlaceholder } from './ImagePlaceholder'

export function DemoImage({image,photo,description,priority=false,className='',sizes='(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 420px'}:{image?:DemoImageKey;photo?:string|null;description:string;priority?:boolean;className?:string;sizes?:string}) {
 const [failed,setFailed]=useState<string|null>(null)
 const demo=/^\/(?:demo|sandbox)(?:\/|$)/.test(window.location.pathname)
 const supplied=photo&&/^(?:https?:\/\/|data:image\/(?:jpeg|png|webp);base64,|\/demo\/images\/)/i.test(photo)?photo:null
 const artwork=image&&demo?demoImages[image]:null
 const src=supplied??(artwork?`/demo/images/${artwork.file}.webp`:null)
 if(!src||failed===src)return <ImagePlaceholder description={description}/>
 const local=src.startsWith('/demo/images/'),stem=local?src.split('?')[0].replace(/\.webp$/,''):null
 const frame=local?new URLSearchParams(src.split('?')[1]).get('batch'):null
 const offset=frame?[...frame].reduce((n,c)=>n+c.charCodeAt(0),0)%9:4
 const historical=frame&&/^DEMO-batch-\d+-(?:4|5)$/.test(frame)
 const zoom=historical?1.17+(offset%3)*.03:1+(offset%4)*.01
 return <div className={`demo-artwork ${frame?'batch-artwork':''} ${className}`}><img key={src} src={src} srcSet={stem?`${stem}-small.webp 480w, ${stem}.webp 960w`:undefined} sizes={sizes} alt={description} width={960} height={image==='night'||image==='day'?540:image==='satayStall'||image==='riceStall'?720:960} style={frame?{objectPosition:`${34+offset*4}% ${66-offset*4}%`,transform:`scale(${zoom})`}:undefined} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async" onError={()=>setFailed(src)}/></div>
}
