import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,createHmac,timingSafeEqual} from 'node:crypto';
import {createStore,commitLead,rateAllowed,CaptureError} from './capture.mjs';
export function createServer({port=3000,origin=`http://localhost:${port}`,dbPath=resolve('var/isolated-test.sqlite'),capture=true}={}){
 if(process.env.NODE_ENV==='production'||process.env.VERCEL)throw new Error('Local SQLite capture cannot run on Vercel or production. Approved durable CRM integration is required.');
 const root=resolve(fileURLToPath(new URL('../public/',import.meta.url)));const db=createStore(dbPath);const secret=randomBytes(32);
 const sign=s=>createHmac('sha256',secret).update(s).digest('hex');
 const token=()=>{const payload=`${Date.now()}.${randomBytes(24).toString('hex')}`;return `${payload}.${sign(payload)}`;};
 const valid=t=>{if(typeof t!=='string'||t.length>200)return false;const parts=t.split('.');if(parts.length!==3||!/^[a-f0-9]{64}$/.test(parts[2]))return false;const age=Date.now()-Number(parts[0]);return age>=0&&age<3600000&&timingSafeEqual(Buffer.from(parts[2]),Buffer.from(sign(parts.slice(0,2).join('.'))));};
 const csp="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src https://cdn.pudutech.com; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'; base-uri 'none'; object-src 'none'; form-action 'self'";
 const aliases={'/residential.html':'/residential-solar/','/commercial.html':'/commercial-solar/','/bess.html':'/battery-storage/','/robotics.html':'/robotics/','/datacenters.html':'/data-center-infrastructure/','/data-offerings.html':'/data-center-infrastructure/','/lead.html':'/fit/'};
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Content-Security-Policy',csp);res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');res.setHeader('Cache-Control','no-store');
  const json=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(body));};
  try{
   const url=new URL(req.url,origin);const path=decodeURIComponent(url.pathname);
   if(path==='/api/capture-config.json'&&req.method==='GET'){
    if(!capture)return json(200,{mode:'local-only',enabled:false});const t=token();res.setHeader('Set-Cookie',`sol_preview_csrf=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600${origin.startsWith('https:')?'; Secure':''}`);return json(200,{mode:'isolated-test',enabled:true,csrf:t});
   }
   if(path==='/api/leads'){
    if(req.method!=='POST')return json(405,{error:'Use POST.'});if(!capture)return json(503,{error:'Capture is not enabled. Your request has not been submitted.'});
    if(req.headers.origin!==origin)return json(403,{error:'Request origin rejected.'});
    if(req.headers['content-type']?.split(';')[0]!=='application/json')return json(415,{error:'Use JSON.'});
    const csrf=req.headers['x-sol-csrf'],cookie=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('sol_preview_csrf='))?.slice(17);
    if(!valid(csrf)||csrf!==cookie)return json(403,{error:'Your test session expired. Reload before submitting.'});
    // Never trust arbitrary proxy headers. Local reference uses the socket address; production must configure its actual trusted proxy.
    const ipKey=sign(req.socket.remoteAddress||'unknown');if(!rateAllowed(db,ipKey)) {res.setHeader('Retry-After','60');return json(429,{error:'Too many attempts. Retry in one minute.'});}
    if(Number(req.headers['content-length'])>16384)return json(413,{error:'Request too large.'});const chunks=[];let size=0;
    for await(const chunk of req){size+=chunk.length;if(size>16384)return json(413,{error:'Request too large.'});chunks.push(chunk);}
    let payload;try{payload=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return json(400,{error:'Invalid JSON.'});}
    // Idempotency scope is server-owned and stable across session refresh/restart. No client owner/tenant assignment is accepted.
    const receipt=commitLead(db,payload,req.headers['idempotency-key'],'isolated-preview-v1');return json(receipt.duplicate?200:201,receipt);
   }
   if(path.startsWith('/api/'))return json(404,{error:'Not found.'});
   if(!['GET','HEAD'].includes(req.method))return json(405,{error:'Method not allowed.'});
   if(aliases[path]){res.writeHead(307,{Location:aliases[path]+url.search});res.end();return;}
   const file=resolve(root,'.'+path+(path.endsWith('/')?'index.html':extname(path)?'':'/index.html'));
   if(!file.startsWith(root+sep)&&file!==root)return json(404,{error:'Not found.'});
   let bytes,status=200;try{bytes=await readFile(file);}catch{bytes=await readFile(resolve(root,'404.html'));status=404;}
   const type={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.txt':'text/plain','.xml':'application/xml'}[status===404?'.html':extname(file)]||'application/octet-stream';
   res.writeHead(status,{'Content-Type':type});res.end(req.method==='HEAD'?undefined:bytes);
  }catch(e){if(e instanceof CaptureError)return json(e.status,{error:e.message});return json(503,{error:'The record could not be saved. Retry with the same details. Receipt is not confirmed.'});}
 });server.requestTimeout=15000;server.headersTimeout=10000;return {server,db,origin};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const port=Number(process.env.SOL_PORT||3000),app=createServer({port,origin:process.env.SOL_ORIGIN||`http://localhost:${port}`,dbPath:process.env.SOL_TEST_DB||resolve('var/isolated-test.sqlite'),capture:process.env.SOL_CAPTURE!=='off'});app.server.listen(port,'0.0.0.0',()=>console.log(`SOL Golden Hour isolated preview: ${app.origin}`));}
