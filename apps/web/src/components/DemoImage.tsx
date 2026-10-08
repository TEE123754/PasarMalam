import { useState } from 'react'
import { demoImages, type DemoImageKey } from './demo-images'
import { ImagePlaceholder } from './ImagePlaceholder'

export function DemoImage({image,description,priority=false,className=''}:{image?:DemoImageKey;description:string;priority?:boolean;className?:string}) {
 const [failed,setFailed]=useState<string|null>(null)
 const demo=/^\/(?:demo|sandbox)(?:\/|$)/.test(window.location.pathname)
 if(!image||!demo||failed===image)return <ImagePlaceholder description={description}/>
 const artwork=demoImages[image]
 return <div className={`demo-artwork ${className}`}><img key={artwork.file} src={`/demo/images/${artwork.file}.webp`} srcSet={`/demo/images/${artwork.file}-small.webp 480w, /demo/images/${artwork.file}.webp 960w`} sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 420px" alt={description} width={960} height={image==='night'||image==='day'?540:image==='satayStall'||image==='riceStall'?720:960} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async" onError={()=>setFailed(image)}/></div>
}
