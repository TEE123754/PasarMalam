import { connectedRequest } from '../auth/client'
import type { AppMode } from '../data/types'

export async function preparePhoto(file:File):Promise<Blob> {
  if(file.size>5242880)throw new Error('Photo must be at most 5 MB')
  const head=new Uint8Array(await file.slice(0,12).arrayBuffer())
  const jpeg=head[0]===255&&head[1]===216&&head[2]===255
  const png=[137,80,78,71,13,10,26,10].every((v,i)=>head[i]===v)
  const webp=String.fromCharCode(...head.slice(0,4))==='RIFF'&&String.fromCharCode(...head.slice(8,12))==='WEBP'
  if(!jpeg&&!png&&!webp)throw new Error('Choose a genuine JPEG, PNG or WebP photo')
  const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'})
  try {if(bitmap.width*bitmap.height>16000000||bitmap.width<32||bitmap.height<32)throw new Error('Photo must be 32 pixels or larger and at most 16 megapixels');const scale=Math.min(1,1280/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const context=canvas.getContext('2d');if(!context)throw new Error('Photo processing unavailable');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Photo conversion failed')),'image/jpeg',.8));if(blob.size>1048576)throw new Error('Compressed photo exceeds 1 MB');return blob} finally {bitmap.close()}
}
export async function uploadPhoto(mode:AppMode,stall:string,file:File,onProgress:(n:number)=>void):Promise<string> {
  onProgress(10);const blob=await preparePhoto(file);onProgress(45)
  if(mode==='fixture') {const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Photo read failed'));reader.readAsDataURL(blob)});onProgress(100);return data}
  const r=await connectedRequest(`/api/v1/vendor/photos/${stall}`,{method:'POST',headers:{'Content-Type':'image/jpeg'},body:blob},fraction=>onProgress(45+Math.round(fraction*45)));if(!r.ok)throw new Error('Photo upload failed. No listing was saved.');onProgress(100);return ((await r.json()) as {key:string}).key
}
export async function cleanupPhoto(mode:AppMode,key:string) {if(mode==='connected') {const r=await connectedRequest('/api/v1/vendor/photos/cleanup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});if(!r.ok)throw new Error('Photo cleanup pending. Retry before leaving this page.')}}
