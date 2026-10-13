export class Recorder {
 private generation=0
 private stream:MediaStream|null=null;private recorder:MediaRecorder|null=null;private chunks:Blob[]=[];private timer:ReturnType<typeof setTimeout>|null=null
 private pause=()=>this.cancel()
 private hidden=()=>{if(document.hidden)this.cancel()}
 private detach(){if(typeof window!=='undefined')window.removeEventListener('pasarmalam-pause',this.pause);if(typeof document!=='undefined')document.removeEventListener('visibilitychange',this.hidden)}
 async start(done:(blob:Blob)=>void){
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw new Error('Recording unsupported; use text entry.')
  const generation=++this.generation
  if(typeof window!=='undefined')window.addEventListener('pasarmalam-pause',this.pause)
  if(typeof document!=='undefined')document.addEventListener('visibilitychange',this.hidden)
  let stream:MediaStream
  try{stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}catch(error){this.detach();throw error}
  if(generation!==this.generation||(typeof document!=='undefined'&&document.hidden)){stream.getTracks().forEach(t=>t.stop());this.detach();throw new Error('Recording cancelled')}
  this.stream=stream
  try{this.recorder=new MediaRecorder(this.stream);this.recorder.ondataavailable=e=>{if(e.data.size)this.chunks.push(e.data)};this.recorder.onstop=()=>{const blob=new Blob(this.chunks,{type:this.recorder?.mimeType});this.chunks=[];this.stopTracks();done(blob)};this.recorder.start();this.timer=setTimeout(()=>this.stop(),30000)}catch(e){this.cancel();throw e}
 }
 stop(){this.detach();if(this.recorder?.state==='recording')this.recorder.stop();if(this.timer)clearTimeout(this.timer);this.stopTracks()}
 private stopTracks(){this.stream?.getTracks().forEach(t=>t.stop());this.stream=null}
 cancel(){this.generation++;if(this.recorder){this.recorder.onstop=null;this.recorder.ondataavailable=null;this.recorder.onerror=null}this.stop();this.recorder=null;this.chunks=[]}
}
export async function decode(blob:Blob):Promise<Float32Array>{
 if(blob.size>5000000)throw new Error('Recording too large')
 const context=new AudioContext();const encoded=await blob.arrayBuffer()
 let decoded:AudioBuffer|null=null,rendered:AudioBuffer|null=null,source:AudioBufferSourceNode|null=null
 try{decoded=await context.decodeAudioData(encoded);if(decoded.duration>30.5||decoded.length<1)throw new Error('Recording exceeds 30 seconds');const offline=new OfflineAudioContext(1,Math.min(480000,Math.ceil(decoded.duration*16000)),16000);source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();rendered=await offline.startRendering();return new Float32Array(rendered.getChannelData(0))}finally{for(const buffer of [decoded,rendered])if(buffer)for(let c=0;c<buffer.numberOfChannels;c++)buffer.getChannelData(c).fill(0);if(source)source.buffer=null;if(encoded.byteLength)new Uint8Array(encoded).fill(0);await context.close()}
}
