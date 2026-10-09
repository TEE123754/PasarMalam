/// <reference lib="webworker" />
import { env, pipeline, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers'
import { speechOptions, speechProfile, type SpeechLanguage, type SpeechModelId } from './speechOptions'
import { prepareSpeechAudio } from './audioQuality'
env.allowLocalModels=false
env.useBrowserCache=true // Model files only. Audio never receives a URL or cache key.
if(env.backends.onnx.wasm)env.backends.onnx.wasm.numThreads=1
const createASR=pipeline as unknown as (task:string,model:string,options:{revision:string;device:'wasm';dtype:'q8';progress_callback:(p:unknown)=>void})=>Promise<AutomaticSpeechRecognitionPipeline>
let recognizer:AutomaticSpeechRecognitionPipeline|null=null
let loadedProfile=''
self.onmessage=async(e:MessageEvent<{kind:'load'|'transcribe';audio?:Float32Array;language?:SpeechLanguage;profile?:SpeechModelId}>)=>{
 const audio=e.data.audio
 let prepared:Float32Array|undefined
 try {
  const profile=speechProfile(e.data.profile??'small')
  if(profile.id==='desktop'){
   if(recognizer){await recognizer.dispose();recognizer=null}
   loadedProfile=profile.id
   if(e.data.kind==='load'){
    const response=await fetch('http://127.0.0.1:8020/status',{cache:'no-store',signal:AbortSignal.timeout(5000)})
    if(!response.ok)throw new Error('Desktop speech helper unavailable; choose a browser model or text entry.')
    self.postMessage({kind:'ready'});return
   }
   if(!audio||!audio.length||audio.length>480000)throw new Error('Use a recording of at most 30 seconds')
   const response=await fetch('http://127.0.0.1:8020/transcribe',{method:'POST',headers:{'Content-Type':'application/octet-stream','X-Speech-Language':e.data.language??'ms'},body:audio.buffer as ArrayBuffer,signal:AbortSignal.timeout(120000)})
   if(!response.ok)throw new Error('Desktop speech helper unavailable; choose a browser model or text entry.')
   const result=await response.json() as {text:string}
   self.postMessage({kind:'transcript',text:result.text});return
  }
  if(recognizer&&loadedProfile!==profile.id){await recognizer.dispose();recognizer=null}
  if(!recognizer){recognizer=await createASR('automatic-speech-recognition',profile.model,{revision:profile.revision,device:'wasm',dtype:'q8',progress_callback:p=>self.postMessage({kind:'progress',progress:p})});loadedProfile=profile.id}
  if(e.data.kind==='load'){self.postMessage({kind:'ready'});return}
  if(!audio||audio.length>480000||!audio.length)throw new Error('Use a recording of at most 30 seconds')
  const clean=prepareSpeechAudio(audio);prepared=clean.audio
  const result=await recognizer(prepared,speechOptions(e.data.language??'ms'))
  self.postMessage({kind:'transcript',text:Array.isArray(result)?result.map(r=>r.text).join(' '):result.text,quality:clean.quality})
 }catch(error){self.postMessage({kind:'error',message:error instanceof Error&&(error.message.startsWith('No audible speech')||error.message.startsWith('Desktop speech'))?error.message:'Speech inference failed; use quick entry.'})}
 finally{audio?.fill(0);prepared?.fill(0)}
}

