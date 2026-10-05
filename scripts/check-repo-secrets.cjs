/* Scan Git upload candidates against configured private values; never print values. */
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),secrets=[];
for(const name of ['.env','.env.push','.env.local-voice']){
 const file=path.join(root,'apps/api',name);if(!fs.existsSync(file))continue;
 for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/)){
  const m=line.match(/^([A-Z_]+)=(.+)$/);if(!m)continue;
  if(/PASSWORD|SECRET|PRIVATE_KEY|MORPHEUS_API_KEY|LOCAL_LLM_KEY|DATABASE_URL/.test(m[1])){
   const v=m[2].trim().replace(/^['"]|['"]$/g,'');if(v.length>=12)secrets.push(v);
   if(m[1].endsWith('DATABASE_URL'))try{const p=decodeURIComponent(new URL(v).password);if(p.length>=8)secrets.push(p)}catch{/* Not a URL. */}
  }
 }
}
const files=execFileSync('git',['-c',`safe.directory=${root.replaceAll('\\','/')}`,'ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root}).toString().split('\0').filter(Boolean);
let violations=0;
for(const name of new Set(files)){
 const file=path.join(root,name);if(!fs.existsSync(file)||!fs.statSync(file).isFile())continue;
 const data=fs.readFileSync(file);
 if(secrets.some(s=>data.includes(Buffer.from(s)))){violations++;console.error('Private value found in upload candidate: '+name)}
 if(/(?:^|\/)\.env(?:$|\.)/.test(name)&&!name.endsWith('.example')){violations++;console.error('Private environment file selected: '+name)}
}
if(violations)process.exit(1);
console.log('Git upload candidate credential scan passed; private values suppressed.');
