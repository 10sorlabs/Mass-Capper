import http from 'node:http';
import {createHmac,timingSafeEqual} from 'node:crypto';
import {fal} from '@fal-ai/client';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,readFile,writeFile,rm,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import ffmpeg from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';
const exec=promisify(execFile);
const STS='fal-ai/elevenlabs/voice-changer';
let mediaBusy=false;
async function mediaWork(fn){if(mediaBusy)throw fail(429,'Media processing is busy. Try again.');mediaBusy=true;let dir;try{dir=await mkdtemp(join(tmpdir(),'pawvo-'));return await fn(dir)}finally{try{if(dir)await rm(dir,{recursive:true,force:true})}finally{mediaBusy=false}}}
function mediaUrl(raw){let u;try{u=new URL(raw)}catch{throw fail(400,'Enter a valid fal.ai media URL')}if(u.protocol!=='https:'||u.username||u.password||u.port||!(/^([a-z0-9-]+\.)?fal\.media$/i.test(u.hostname)||u.hostname==='storage.googleapis.com'&&u.pathname.startsWith('/falserverless/')))throw fail(400,'Only fal.media or falserverless storage URLs are accepted');return u.href}
async function download(raw,path,max=45*1024*1024){const response=await fetch(mediaUrl(raw),{redirect:'error',signal:AbortSignal.timeout(45000)});if(!response.ok||!response.body)throw fail(422,'Could not download source media; check that the fal link is still available');if(Number(response.headers.get('content-length'))>max)throw fail(413,'Media exceeds the size limit');const chunks=[];let n=0;for await(const c of response.body){n+=c.length;if(n>max)throw fail(413,'Media exceeds the size limit');chunks.push(c)}await writeFile(path,Buffer.concat(chunks));}
async function probe(path){try{const {stdout}=await exec(ffprobe.path,['-v','error','-protocol_whitelist','file,pipe','-show_streams','-show_format','-of','json',path],{timeout:20000,maxBuffer:1024*1024});return JSON.parse(stdout)}catch{throw fail(422,'Could not read media metadata')}}
async function ff(args){try{await exec(ffmpeg,['-nostdin','-hide_banner','-loglevel','error','-y',...args],{timeout:45000,maxBuffer:1024*1024})}catch{throw fail(422,'FFmpeg could not process this media; check that it contains a valid audio track')}}
function sourceInfo(p){const v=p.streams?.find(s=>s.codec_type==='video');const a=p.streams?.find(s=>s.codec_type==='audio');const duration=Number(v?.duration||p.format?.duration);if(!v||!a||!Number.isFinite(duration)||duration<.2||duration>30)throw fail(422,'Source must have video and native audio, and be at most 30 seconds');return {duration,offset:Math.max(0,Number(a.start_time||0)-Number(v.start_time||0))}}
function rate(){const now=Date.now();submissions=submissions.filter(t=>now-t<3600000);if(submitting||submissions.length>=12||submissions.filter(t=>now-t<60000).length>=2)throw fail(429,'Test rate limit reached. Try later.');submitting=true;submissions.push(now)}
async function submitSTS(input,source){rate();try{const {request_id}=await fal.queue.submit(STS,{input});if(!request_id)throw fail(502,'No voice changer request ID returned');return jobId(STS,request_id,source)}finally{submitting=false}}

const KEY=(process.env.FAL_KEY||'').trim(), TOKEN=(process.env.PLAYGROUND_TOKEN||'').trim();
const ORIGIN=process.env.PLAYGROUND_ORIGIN||'https://pawvo-pet-video-preview.onrender.com';
const ready=()=>!!KEY&&TOKEN.length>=24;
if(KEY)fal.config({credentials:KEY});
const VIDEO=new Set(['fal-ai/kling-video/v3/standard/image-to-video','fal-ai/kling-video/v3/pro/image-to-video']);
const AUDIO='fal-ai/elevenlabs/tts/eleven-v3';
const allowed=m=>VIDEO.has(m)||m===AUDIO||m===STS;
let submissions=[],submitting=false;
function same(a,b){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}
function sign(s){return createHmac('sha256',TOKEN).update(s).digest('base64url')}
function jobId(model,id,source){const s=Buffer.from(JSON.stringify(source?[model,id,source]:[model,id])).toString('base64url');return s+'.'+sign(s)}
function parseJob(t){const [s,sig,...rest]=t.split('.');if(rest.length||!s||!sig||!same(sig,sign(s)))throw fail(404,'Unknown job');let p;try{p=JSON.parse(Buffer.from(s,'base64url'))}catch{throw fail(404,'Unknown job')}if(!Array.isArray(p)||!allowed(p[0])||typeof p[1]!=='string'||!/^[\w-]{1,100}$/.test(p[1]))throw fail(404,'Unknown job');return p}
function fail(status,message){return Object.assign(new Error(message),{httpStatus:status})}
async function body(req){const chunks=[];let n=0;for await(const chunk of req){n+=chunk.length;if(n>12*1024*1024)throw fail(413,'Image too large');chunks.push(chunk)}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw fail(400,'Invalid JSON')}}
function str(x,max){return typeof x==='string'&&x.trim().length>0&&x.length<=max}
function validate(model,input){if(model===STS||!allowed(model)||!input||typeof input!=='object')throw fail(400,'Unsupported model or input');
if(model===AUDIO){if(!str(input.text,1500)||!str(input.voice,100))throw fail(400,'Text (max 1500 chars) and voice required');return {text:input.text.trim(),voice:input.voice.trim(),output_format:'mp3_44100_128'};}
if(!str(input.prompt,2500)||!['5','10'].includes(input.duration)||typeof input.generate_audio!=='boolean')throw fail(400,'Invalid prompt, duration or audio option');
const m=typeof input.start_image_url==='string'&&input.start_image_url.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/);if(!m)throw fail(400,'Upload a JPG, PNG or WebP image');const bytes=Buffer.from(m[2],'base64');if(!bytes.length||bytes.length>8*1024*1024)throw fail(400,'Image exceeds 8 MB');
const valid=m[1]==='image/jpeg'?bytes[0]===255&&bytes[1]===216:m[1]==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';if(!valid)throw fail(400,'Invalid image data');
return {prompt:input.prompt.trim(),duration:input.duration,generate_audio:input.generate_audio,start_image_url:input.start_image_url};}
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))}
const server=http.createServer(async(req,res)=>{
const origin=req.headers.origin;if(origin===ORIGIN){res.setHeader('Access-Control-Allow-Origin',ORIGIN);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS')}
try{const path=new URL(req.url,'http://localhost').pathname;
if(req.method==='GET'&&path==='/health')return json(res,200,{ok:true});
if(origin&&origin!==ORIGIN)throw fail(403,'Origin not allowed');
if(req.method==='OPTIONS')return json(res,204,{});
if(!path.startsWith('/api/playground/'))throw fail(404,'Not found');
if(!ready())throw fail(503,'Set FAL_KEY and PLAYGROUND_TOKEN (24+ characters) in Render.');
if(!same(req.headers.authorization||'','Bearer '+TOKEN))throw fail(401,'Invalid playground access token');
if(req.method==='GET'&&path==='/api/playground/health')return json(res,200,{ready:true});
if(req.method==='POST'&&path==='/api/playground/jobs'){
if(!String(req.headers['content-type']||'').startsWith('application/json'))throw fail(415,'JSON required');
const {model,input}=await body(req);const clean=validate(model,input);
const now=Date.now();submissions=submissions.filter(t=>now-t<3600000);if(submitting||submissions.length>=12||submissions.filter(t=>now-t<60000).length>=2)throw fail(429,'Test rate limit reached. Try later.');
submitting=true;submissions.push(now);
try{const {request_id}=await fal.queue.submit(model,{input:clean});if(!request_id)throw fail(502,'No provider request ID returned');return json(res,202,{job_id:jobId(model,request_id)})}finally{submitting=false}}
if(req.method==='POST'&&path==='/api/playground/replace-voice'){
const data=await body(req);if(!str(data.voice,100))throw fail(400,'Choose a voice name or ID');const sourceUrl=mediaUrl(data.video_url);
const id=await mediaWork(async dir=>{const video=join(dir,'source.mp4'),wav=join(dir,'source.wav');await download(sourceUrl,video);const meta=sourceInfo(await probe(video));await ff(['-protocol_whitelist','file,pipe','-i',video,'-map','0:a:0','-vn','-ac','1','-ar','44100','-c:a','pcm_s16le',wav]);const audio=await readFile(wav);if(audio.length<1000||audio.length>5*1024*1024)throw fail(422,'Source audio size is invalid');const ap=await probe(wav);const originalDuration=Number(ap.format.duration);const audioUrl=await fal.storage.upload(new File([audio],'source.wav',{type:'audio/wav'}));return submitSTS({audio_url:audioUrl,voice:data.voice.trim(),model_id:'eleven_multilingual_sts_v2',remove_background_noise:data.remove_background_noise===true,output_format:'mp3_44100_192'},{video_url:sourceUrl,duration:meta.duration,offset:meta.offset,audio_duration:originalDuration})});return json(res,202,{job_id:id})}
if(req.method==='POST'&&path==='/api/playground/export-replacement'){
const data=await body(req);const [model,id,source]=parseJob(String(data.job_id||''));if(model!==STS||!source)throw fail(400,'A voice replacement job is required');const offset=Number(data.offset_seconds??0);if(!Number.isFinite(offset)||Math.abs(offset)>2)throw fail(400,'Offset must be between -2 and 2 seconds');
const result=await fal.queue.result(STS,{requestId:id});const audioUrl=mediaUrl(result.data?.audio?.url);
const output=await mediaWork(async dir=>{const video=join(dir,'source.mp4'),audio=join(dir,'voice.mp3'),out=join(dir,'output.mp4');await download(source.video_url,video);await download(audioUrl,audio,8*1024*1024);const original=sourceInfo(await probe(video));const ap=await probe(audio);const actual=Number(ap.format.duration);if(!Number.isFinite(actual)||actual<=0)throw fail(422,'Converted audio duration is invalid');
const delta=original.offset+offset;const filter=(delta>=0?'adelay='+Math.round(delta*1000)+':all=1':'atrim=start='+(-delta).toFixed(3)+',asetpts=PTS-STARTPTS')+',apad';await ff(['-protocol_whitelist','file,pipe','-i',video,'-protocol_whitelist','file,pipe','-i',audio,'-map','0:v:0','-map','1:a:0','-c:v','copy','-af',filter,'-c:a','aac','-b:a','192k','-t',String(original.duration),'-movflags','+faststart',out]);if((await stat(out)).size>50*1024*1024)throw fail(413,'Export too large');return {bytes:await readFile(out),actual}});
res.setHeader('Access-Control-Expose-Headers','X-Source-Audio-Duration, X-Converted-Audio-Duration');res.writeHead(200,{'Content-Type':'video/mp4','Content-Disposition':'attachment; filename="pawvo-voice-replacement.mp4"','Cache-Control':'no-store','X-Source-Audio-Duration':String(source.audio_duration),'X-Converted-Audio-Duration':String(output.actual)});return res.end(output.bytes)}
if(req.method==='GET'&&path.startsWith('/api/playground/jobs/')){
const [model,id]=parseJob(decodeURIComponent(path.slice('/api/playground/jobs/'.length)));
const status=await fal.queue.status(model,{requestId:id,logs:false});
if(status.status==='COMPLETED'){const result=await fal.queue.result(model,{requestId:id});const url=(model===AUDIO||model===STS)?result.data?.audio?.url:result.data?.video?.url;if(typeof url!=='string'||!url.startsWith('https://'))throw fail(502,'Provider returned no valid output URL');return json(res,200,{status:'COMPLETED',...((model===AUDIO||model===STS)?{audio_url:url}:{video_url:url})})}
return json(res,200,{status:status.status||'IN_QUEUE'});}
throw fail(404,'Not found');
}catch(e){const s=e.httpStatus||502;const providerStatus=e.status||e.statusCode;const msg=e.httpStatus?e.message:(providerStatus?'fal.ai request failed (HTTP '+providerStatus+'). Check credits, model permissions and input.':'fal.ai request failed. Check provider status and configuration.');if(!res.headersSent)json(res,s,{error:msg});else res.end();}});
server.requestTimeout=60000;server.listen(Number(process.env.PORT||10000),'0.0.0.0',()=>console.log('Pawvo API listening; configured:',ready()));
