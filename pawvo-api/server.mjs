import http from 'node:http';
import {createHmac,timingSafeEqual} from 'node:crypto';
import {fal} from '@fal-ai/client';
const KEY=(process.env.FAL_KEY||'').trim(), TOKEN=(process.env.PLAYGROUND_TOKEN||'').trim();
const ORIGIN=process.env.PLAYGROUND_ORIGIN||'https://pawvo-pet-video-preview.onrender.com';
const ready=()=>!!KEY&&TOKEN.length>=24;
if(KEY)fal.config({credentials:KEY});
const VIDEO=new Set(['fal-ai/kling-video/v3/standard/image-to-video','fal-ai/kling-video/v3/pro/image-to-video']);
const AUDIO='fal-ai/elevenlabs/tts/eleven-v3';
const allowed=m=>VIDEO.has(m)||m===AUDIO;
let submissions=[],submitting=false;
function same(a,b){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}
function sign(s){return createHmac('sha256',TOKEN).update(s).digest('base64url')}
function jobId(model,id){const s=Buffer.from(JSON.stringify([model,id])).toString('base64url');return s+'.'+sign(s)}
function parseJob(t){const [s,sig,...rest]=t.split('.');if(rest.length||!s||!sig||!same(sig,sign(s)))throw fail(404,'Unknown job');let p;try{p=JSON.parse(Buffer.from(s,'base64url'))}catch{throw fail(404,'Unknown job')}if(!Array.isArray(p)||!allowed(p[0])||typeof p[1]!=='string'||!/^[\w-]{1,100}$/.test(p[1]))throw fail(404,'Unknown job');return p}
function fail(status,message){return Object.assign(new Error(message),{httpStatus:status})}
async function body(req){const chunks=[];let n=0;for await(const chunk of req){n+=chunk.length;if(n>12*1024*1024)throw fail(413,'Image too large');chunks.push(chunk)}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw fail(400,'Invalid JSON')}}
function str(x,max){return typeof x==='string'&&x.trim().length>0&&x.length<=max}
function validate(model,input){if(!allowed(model)||!input||typeof input!=='object')throw fail(400,'Unsupported model or input');
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
if(req.method==='GET'&&path.startsWith('/api/playground/jobs/')){
const [model,id]=parseJob(decodeURIComponent(path.slice('/api/playground/jobs/'.length)));
const status=await fal.queue.status(model,{requestId:id,logs:false});
if(status.status==='COMPLETED'){const result=await fal.queue.result(model,{requestId:id});const url=model===AUDIO?result.data?.audio?.url:result.data?.video?.url;if(typeof url!=='string'||!url.startsWith('https://'))throw fail(502,'Provider returned no valid output URL');return json(res,200,{status:'COMPLETED',...(model===AUDIO?{audio_url:url}:{video_url:url})})}
return json(res,200,{status:status.status||'IN_QUEUE'});}
throw fail(404,'Not found');
}catch(e){const s=e.httpStatus||502;const providerStatus=e.status||e.statusCode;const msg=e.httpStatus?e.message:(providerStatus?'fal.ai request failed (HTTP '+providerStatus+'). Check credits, model permissions and input.':'fal.ai request failed. Check provider status and configuration.');if(!res.headersSent)json(res,s,{error:msg});else res.end();}});
server.requestTimeout=60000;server.listen(Number(process.env.PORT||10000),'0.0.0.0',()=>console.log('Pawvo API listening; configured:',ready()));
