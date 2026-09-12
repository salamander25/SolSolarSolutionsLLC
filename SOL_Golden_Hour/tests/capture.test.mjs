import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {lanes,consent} from '../content.mjs';
import {createStore,commitLead,validateLead,hash,rateAllowed,processNotification} from '../backend/capture.mjs';
import {createServer} from '../backend/server.mjs';
const dir=mkdtempSync(join(tmpdir(),'SOL_Golden_Hour_QA_'));
function fixture(lane=lanes[0]){return {solution:lane.id,location:'SYNTHETIC QA — no customer',state:'IL',timing:'Exploring options',questions:Object.fromEntries(lane.questions.map(([name,,type,opts])=>[name,type==='select'?opts.at(-1):'Unknown'])),context:'SYNTHETIC TEST. Do not contact.',related:[],contact:{name:'SYNTHETIC QA',email:'sol-gh-qa@example.invalid',company:'Test fixture',response:'email-only',phone:''},availability:{timezone:'America/Chicago',hoursStatus:'unknown',workingHours:'',callWindow:'email-only',bestTime:'',evidence:'self-reported'},consent:{request:true,marketingEmail:false,marketingCalls:false,sms:false,version:consent.version},attribution:{first:{utm_source:'qa'},latest:{utm_source:'qa'},sourcePath:'/fit/'},website:''};}
for(const lane of lanes)test(`${lane.name}: valid product-specific inquiry`,()=>assert.equal(validateLead(fixture(lane)).solution,lane.id));
const invalid=[
 ['invalid email',p=>p.contact.email='wrong'],
 ['phone required for phone response',p=>{p.contact.response='phone';p.availability.callWindow='unknown';}],
 ['phone and email-only preference conflict',p=>p.contact.phone='+12025550123'],
 ['phone and email-only hours conflict',p=>{p.contact.response='phone';p.contact.phone='+12025550123';p.availability.hoursStatus='email-only';p.availability.callWindow='unknown';}],
 ['unknown solution',p=>p.solution='invented'],
 ['invalid product category',p=>p.questions.authority='Invented'],
 ['cross-lane questions',p=>p.questions.initialPower='10 MW'],
 ['untrusted owner injection',p=>p.owner='unapproved'],
 ['untrusted tenant injection',p=>p.tenant='someone-else'],
 ['request consent missing',p=>p.consent.request=false],
 ['string boolean rejected',p=>p.consent.marketingEmail='false'],
 ['SMS not authorized',p=>p.consent.sms=true],
 ['invalid consent version',p=>p.consent.version='old'],
 ['invalid timezone',p=>p.availability.timezone='Imaginary/Place'],
 ['person-hours evidence cannot be forged',p=>p.availability.evidence='verified-by-owner'],
 ['overlong context',p=>p.context='x'.repeat(1201)],
 ['unknown attribution / PII rejected',p=>p.attribution.latest.utm_content='person@example.com'],
 ['honeypot',p=>p.website='spam'],
 ['contradictory calling window',p=>p.availability.bestTime='1 pm']
];for(const [name,mutate] of invalid)test(`Reject ${name}`,()=>{const p=fixture();mutate(p);assert.throws(()=>validateLead(p));});
test('Unknown timezone accepted without inventing one',()=>{const p=fixture();p.availability.timezone='unknown';assert.equal(validateLead(p).availability.timezone,'unknown');});
test('Specific person hours and IANA timezone survive commit',()=>{const db=createStore(join(dir,'hours.sqlite')),p=fixture();p.contact.response='phone';p.contact.phone='+12025550123';p.availability={timezone:'America/Chicago',hoursStatus:'known',workingHours:'Tue–Thu 9 am–4 pm',callWindow:'specific',bestTime:'Tue 1–3 pm',evidence:'self-reported'};const r=commitLead(db,p,randomUUID(),'qa');const saved=JSON.parse(db.prepare('SELECT payload FROM inquiries WHERE id=?').get(r.id).payload);assert.deepEqual(saved.availability,p.availability);assert.equal(saved.consent.marketingEmail,false);db.close();});
test('One durable record for repeated submission, including restart',()=>{const path=join(dir,'durable.sqlite');let db=createStore(path);const key=randomUUID(),p=fixture(),a=commitLead(db,p,key,'qa'),b=commitLead(db,p,key,'qa');assert.equal(a.id,b.id);assert.equal(b.duplicate,true);db.close();db=createStore(path);const c=commitLead(db,p,key,'qa');assert.equal(c.id,a.id);assert.equal(db.prepare('SELECT count(*) n FROM inquiries').get().n,1);db.close();});
test('Same idempotency key with different payload returns conflict',()=>{const db=createStore(join(dir,'conflict.sqlite')),p=fixture(),key=randomUUID();commitLead(db,p,key,'qa');p.location='Different';assert.throws(()=>commitLead(db,p,key,'qa'),e=>e.status===409);db.close();});
test('Commit failure rolls back inquiry and outbox; no receipt',()=>{const db=createStore(join(dir,'failure.sqlite'));assert.throws(()=>commitLead(db,fixture(),randomUUID(),'qa',{simulateCommitFailure:true}));assert.equal(db.prepare('SELECT count(*) n FROM inquiries').get().n,0);assert.equal(db.prepare('SELECT count(*) n FROM notification_outbox').get().n,0);db.close();});
test('Notification failure retains one saved record and supports retry',async()=>{const db=createStore(join(dir,'notify.sqlite')),p=fixture(),key=randomUUID(),r=commitLead(db,p,key,'qa');await processNotification(db,r.id,async()=>{throw Error('Synthetic notifier failure');});assert.equal(db.prepare('SELECT state FROM notification_outbox').get().state,'retry_required');assert.equal(commitLead(db,p,key,'qa').id,r.id);await processNotification(db,r.id,async()=>{});assert.equal(db.prepare('SELECT state,attempts FROM notification_outbox').get().state,'delivered');assert.equal(db.prepare('SELECT count(*) n FROM inquiries').get().n,1);db.close();});
test('Suppression, ownership, tenant and campaign hold cannot be lifted by inquiry',()=>{const db=createStore(join(dir,'controls.sqlite')),p=fixture();p.consent.marketingEmail=true;p.attribution.latest.utm_campaign='IL_SOLAR_QUAL_2026';const h=hash(p.contact.email);db.prepare('INSERT INTO suppressions VALUES(?,?)').run(h,'existing opt-out');db.prepare('INSERT INTO ownership VALUES(?,?,?)').run(h,'TEST-OWNER-LOCK','TEST-TENANT');db.prepare('INSERT INTO campaign_holds VALUES(?,?)').run('IL_SOLAR_QUAL_2026','existing campaign hold');commitLead(db,p,randomUUID(),'qa');const r=db.prepare('SELECT * FROM inquiries').get(),ctrl=JSON.parse(r.controls);assert.equal(r.owner,'TEST-OWNER-LOCK');assert.equal(r.tenant,'TEST-TENANT');assert.equal(r.marketing_eligible,0);assert.equal(ctrl.suppressed,true);assert.equal(ctrl.campaignHeld,true);assert.equal(ctrl.automationBlocked,true);assert.equal(db.prepare('SELECT count(*) n FROM suppressions').get().n,1);db.close();});
test('Database rate limit blocks burst and permits next window',()=>{const db=createStore(join(dir,'rate.sqlite'));for(let i=0;i<8;i++)assert.equal(rateAllowed(db,'qa',1000),true);assert.equal(rateAllowed(db,'qa',1000),false);assert.equal(rateAllowed(db,'qa',62000),true);db.close();});
test('HTTP server enforces origin, CSRF, JSON, limits; browser contract commits first',async()=>{
 const app=createServer({origin:'http://localhost:4318',dbPath:join(dir,'http.sqlite')});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.server.address().port}`;
 try{const conf=await fetch(base+'/api/capture-config.json');const cookie=conf.headers.get('set-cookie').split(';')[0],config=await conf.json();const headers={'Content-Type':'application/json',Origin:app.origin,'X-SOL-CSRF':config.csrf,Cookie:cookie,'Idempotency-Key':randomUUID()};const request=h=>fetch(base+'/api/leads',{method:'POST',headers:h,body:JSON.stringify(fixture())});
 assert.equal((await request({...headers,Origin:'https://untrusted.example'})).status,403);
 assert.equal((await request({...headers,'X-SOL-CSRF':'bad'})).status,403);
 assert.equal((await request({...headers,'Content-Type':'text/plain'})).status,415);
 let res=await request(headers);assert.equal(res.status,201);const receipt=await res.json();assert.equal(receipt.committed,true);assert.ok(app.db.prepare('SELECT id FROM inquiries WHERE id=?').get(receipt.id));
 res=await request(headers);assert.equal(res.status,200);assert.equal((await res.json()).id,receipt.id);
 const html=await fetch(base+'/robotics/');assert.equal(html.status,200);assert.match(html.headers.get('x-robots-tag'),/noindex/);assert.match(await html.text(),/Sol does not have a GT demonstration unit/);
 assert.equal((await fetch(base+'/api/inquiries')).status,404);assert.equal((await fetch(base+'/../backend/capture.mjs')).status,404);
 const big=await fetch(base+'/api/leads',{method:'POST',headers,body:JSON.stringify({...fixture(),context:'x'.repeat(17000)})});assert.equal(big.status,413);
 for(let i=0;i<5;i++)await request(headers);res=await request(headers);assert.equal(res.status,429);assert.equal(res.headers.get('retry-after'),'60');
 }finally{await new Promise(r=>app.server.close(r));app.db.close();}
});
test('Disabled capture never emits a receipt',async()=>{const app=createServer({capture:false,dbPath:join(dir,'off.sqlite')});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));try{const base=`http://127.0.0.1:${app.server.address().port}`,r=await fetch(base+'/api/leads',{method:'POST'});assert.equal(r.status,503);assert.equal((await r.json()).committed,undefined);}finally{await new Promise(r=>app.server.close(r));app.db.close();}});
test('All six static pages have unique source content, H1 and noindex',()=>{const titles=[];for(const l of lanes){const html=readFileSync(new URL('../public/'+l.path+'/index.html',import.meta.url),'utf8');assert.equal((html.match(/<h1>/g)||[]).length,1);assert.match(html,/noindex,nofollow,noarchive/);assert.ok(html.includes(l.paragraphs[0]));titles.push(html.match(/<title>(.*?)<\/title>/)[1]);}assert.equal(new Set(titles).size,6);});
test('Public preview contains no guessed backend, fake success timer or unapproved inbox',()=>{const source=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');assert.doesNotMatch(source,/formspree|hook\.us2|airtable\.com|formsubmit\.co|mailto:/);assert.ok(source.includes('data.committed!==true'));assert.ok(source.includes('Prepared locally — not submitted.'));const html=readFileSync(new URL('../public/fit/index.html',import.meta.url),'utf8');assert.doesNotMatch(html,/checked(?:\s|>)/);assert.ok(html.includes('name="marketingConsent"'));});
