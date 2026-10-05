/// <reference lib="webworker" />
import { env, pipeline, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers'
import model from '../../../../contracts/speech-model.json'
env.allowLocalModels=false
env.useBrowserCache=true // Model files only. Audio never receives a URL or cache key.
if(env.backends.onnx.wasm)env.backends.onnx.wasm.numThreads=1
const createASR=pipeline as unknown as (task:string,model:string,options:{revision:string;device:'wasm';dtype:'q8';progress_callback:(p:unknown)=>void})=>Promise<AutomaticSpeechRecognitionPipeline>
let recognizer:AutomaticSpeechRecognitionPipeline|null=null
self.onmessage=async(e:MessageEvent<{kind:'load'|'transcribe';audio?:Float32Array}>)=>{
 const audio=e.data.audio
 try {
  if(!recognizer)recognizer=await createASR('automatic-speech-recognition',model.model,{revision:model.revision,device:'wasm',dtype:'q8',progress_callback:p=>self.postMessage({kind:'progress',progress:p})})
  if(e.data.kind==='load'){self.postMessage({kind:'ready'});return}
  if(!audio||audio.length>480000||!audio.length)throw new Error('Use a recording of at most 30 seconds')
  const result=await recognizer(audio,{task:'transcribe',return_timestamps:false,chunk_length_s:30})
  self.postMessage({kind:'transcript',text:Array.isArray(result)?result.map(r=>r.text).join(' '):result.text})
 }catch{self.postMessage({kind:'error',message:'Speech inference failed; use quick entry.'})}
 finally{audio?.fill(0)}
}

