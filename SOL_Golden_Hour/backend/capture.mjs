import {DatabaseSync} from 'node:sqlite';
import {createHash,randomUUID} from 'node:crypto';
import {mkdirSync,chmodSync} from 'node:fs';
import {dirname} from 'node:path';
import {lanes,consent as consentCopy} from '../content.mjs';
export class CaptureError extends Error {constructor(status,message){super(message);this.status=status;}}
const fail=(msg,status=422)=>{throw new CaptureError(status,msg);};
const text=(x,max,label,required=false)=>{if(typeof x!=='string'||x.length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(x))fail(`Invalid ${label}.`);x=x.trim();if(required&&!x)fail(`Provide ${label}.`);return x;};
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
const keys=(x,allowed)=>{if(!obj(x)||Object.keys(x).some(k=>!allowed.includes(k)))fail('Unexpected request fields.');};
const choice=(v,list,label)=>{if(!list.includes(v))fail(`Choose a valid ${label}.`);return v;};
const attributes={utm_source:['owner-signature','existing-outreach','social','search','direct','qa'],utm_medium:['email','organic','paid-search','referral','qa'],utm_campaign:['SOL_GH_PREVIEW','IL_SOLAR_QUAL_2026','PUDU-SOCAL-WF26','PUDU-GT-SOCAL-2026'],utm_content:['hero','footer','lane','overview','qa']};
export function validateLead(raw){
 keys(raw,['solution','location','state','timing','questions','context','related','contact','availability','consent','attribution','website']);
 if(raw.website!==''&&raw.website!==undefined)fail('The request could not be validated.',400);
 const lane=lanes.find(l=>l.id===raw.solution);if(!lane)fail('Choose a valid solution.');
 const states='AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY outside-us unknown'.split(' ');
 const clean={solution:lane.id,location:text(raw.location,120,'general location',true),state:choice(raw.state,states,'state'),timing:choice(raw.timing,['Exploring options','Within 3 months','3–6 months','6–12 months','Longer-term','Unknown'],'timing'),context:text(raw.context,1200,'context'),questions:{}};
 keys(raw.questions,lane.questions.map(q=>q[0]));
 for(const [name,label,type,options] of lane.questions){clean.questions[name]=type==='select'?choice(raw.questions[name],options,label):text(raw.questions[name]??'',240,label);}
 if(!Array.isArray(raw.related)||raw.related.length>5||new Set(raw.related).size!==raw.related.length||raw.related.some(x=>!lanes.some(l=>l.id===x)||x===lane.id))fail('Invalid related solutions.');clean.related=raw.related;
 keys(raw.contact,['name','email','company','response','phone']);const c=raw.contact;
 clean.contact={name:text(c.name,100,'name',true),email:text(c.email,254,'email',true).toLowerCase(),company:text(c.company,160,'company'),response:choice(c.response,['email-only','phone'],'response method'),phone:text(c.phone,30,'phone')};
 if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(clean.contact.email))fail('Enter a valid email address.');
 if(c.response==='email-only'&&c.phone)fail('Email-only preference conflicts with a phone field.');
 if(c.response==='phone'&&(!/^\+?[\d\s().-]+$/.test(c.phone)||c.phone.replace(/\D/g,'').length<7||c.phone.replace(/\D/g,'').length>15))fail('Enter a valid phone number.');
 keys(raw.availability,['timezone','hoursStatus','workingHours','callWindow','bestTime','evidence']);const a=raw.availability;
 clean.availability={timezone:text(a.timezone,80,'time zone',true),hoursStatus:choice(a.hoursStatus,['known','unknown','email-only'],'working-hours status'),workingHours:text(a.workingHours,240,'working hours',a.hoursStatus==='known'),callWindow:choice(a.callWindow,['specific','arrange-by-email','unknown','email-only'],'calling window'),bestTime:text(a.bestTime,240,'best calling time',a.callWindow==='specific'),evidence:'self-reported'};
 if(a.evidence!=='self-reported')fail('Invalid availability evidence.');
 if(a.timezone!=='unknown'){try{new Intl.DateTimeFormat('en',{timeZone:a.timezone});}catch{fail('Choose a valid local time zone or unknown.');}}
 if(a.hoursStatus!=='known'&&a.workingHours)fail('Working-hours status conflicts with supplied hours.');
 if(a.callWindow!=='specific'&&a.bestTime)fail('Calling preference conflicts with a specific window.');
 if(c.response==='email-only'&&a.callWindow!=='email-only')fail('Email-only preference conflicts with calling availability.');
 if(c.response==='phone'&&(a.callWindow==='email-only'||a.hoursStatus==='email-only'))fail('Phone preference conflicts with email-only availability.');
 keys(raw.consent,['request','marketingEmail','marketingCalls','sms','version']);const co=raw.consent;
 if(co.request!==true)fail('Request-specific permission is required.');if(typeof co.marketingEmail!=='boolean'||co.marketingCalls!==false||co.sms!==false||co.version!==consentCopy.version)fail('Invalid consent choices or version.');
 clean.consent={...co};keys(raw.attribution,['first','latest','sourcePath']);if(raw.attribution.sourcePath!=='/fit/')fail('Invalid source route.');clean.attribution={sourcePath:'/fit/',first:{},latest:{}};
 for(const phase of ['first','latest']){keys(raw.attribution[phase],Object.keys(attributes));for(const [k,v]of Object.entries(raw.attribution[phase])){if(!attributes[k].includes(v))fail('Invalid campaign attribution.');clean.attribution[phase][k]=v;}}
 return clean;
}
export function createStore(path){
 mkdirSync(dirname(path),{recursive:true,mode:0o700});const db=new DatabaseSync(path);chmodSync(path,0o600);db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=3000;
 CREATE TABLE IF NOT EXISTS inquiries(id TEXT PRIMARY KEY,scope TEXT NOT NULL,idem TEXT NOT NULL,fingerprint TEXT NOT NULL,payload TEXT NOT NULL,created_at TEXT NOT NULL,status TEXT NOT NULL,owner TEXT,tenant TEXT NOT NULL,marketing_eligible INTEGER NOT NULL DEFAULT 0,controls TEXT NOT NULL,UNIQUE(scope,idem));
 CREATE TABLE IF NOT EXISTS notification_outbox(inquiry_id TEXT PRIMARY KEY REFERENCES inquiries(id),state TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0);
 CREATE TABLE IF NOT EXISTS suppressions(contact_hash TEXT PRIMARY KEY,reason TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS ownership(contact_hash TEXT PRIMARY KEY,owner TEXT NOT NULL,tenant TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS campaign_holds(campaign TEXT PRIMARY KEY,reason TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);`);
 return db;
}
export const hash=s=>createHash('sha256').update(s).digest('hex');
const stable=x=>Array.isArray(x)?x.map(stable):obj(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
export function commitLead(db,raw,key,scope,{simulateCommitFailure=false}={}){
 if(typeof key!=='string'||!/^[a-zA-Z0-9-]{24,80}$/.test(key))fail('A valid retry identifier is required.',400);
 const lead=validateLead(raw), fingerprint=hash(JSON.stringify(stable(lead)));db.exec('BEGIN IMMEDIATE');
 try{
  const old=db.prepare('SELECT id,fingerprint,created_at FROM inquiries WHERE scope=? AND idem=?').get(scope,key);
  if(old){if(old.fingerprint!==fingerprint)throw new CaptureError(409,'This retry contains different details.');db.exec('COMMIT');return {id:old.id,createdAt:old.created_at,committed:true,duplicate:true,mode:'isolated-test'};}
  const contactHash=hash(lead.contact.email), suppression=db.prepare('SELECT reason FROM suppressions WHERE contact_hash=?').get(contactHash), ownership=db.prepare('SELECT owner,tenant FROM ownership WHERE contact_hash=?').get(contactHash), campaign=lead.attribution.latest.utm_campaign||'', hold=db.prepare('SELECT reason FROM campaign_holds WHERE campaign=?').get(campaign);
  // All new records stay quarantined. Existing controls can restrict them further, never relax them.
  const controls={suppressed:!!suppression,campaignHeld:!!hold,controlsReviewRequired:true,automationBlocked:true,ownershipPreserved:!!ownership};
  const id='SOLTEST-'+randomUUID(),createdAt=new Date().toISOString();
  db.prepare('INSERT INTO inquiries VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id,scope,key,fingerprint,JSON.stringify({...lead,consentText:consentCopy}),createdAt,'isolated_test_hold',ownership?.owner??null,ownership?.tenant??'isolated-preview',0,JSON.stringify(controls));
  db.prepare('INSERT INTO notification_outbox(inquiry_id,state) VALUES(?,?)').run(id,'held_no_approved_route');
  if(simulateCommitFailure)throw new Error('Synthetic storage failure');db.exec('COMMIT');
  return {id,createdAt,committed:true,duplicate:false,mode:'isolated-test'};
 }catch(e){try{db.exec('ROLLBACK');}catch{}throw e;}
}
export async function processNotification(db,id,notifier){
 const row=db.prepare('SELECT state FROM notification_outbox WHERE inquiry_id=?').get(id);if(!row||row.state==='delivered')return;
 // This function has no email integration. Tests inject a synthetic notifier; production must approve a route.
 try{await notifier({inquiryId:id});db.prepare('UPDATE notification_outbox SET state=?,attempts=attempts+1 WHERE inquiry_id=?').run('delivered',id);}catch{db.prepare('UPDATE notification_outbox SET state=?,attempts=attempts+1 WHERE inquiry_id=?').run('retry_required',id);}
}
export function rateAllowed(db,key,now=Date.now(),limit=8,windowMs=60000){
 db.exec('BEGIN IMMEDIATE');try{db.prepare('DELETE FROM rate_limits WHERE expires < ?').run(now);const row=db.prepare('SELECT count,expires FROM rate_limits WHERE key=?').get(key);if(row&&row.count>=limit){db.exec('COMMIT');return false;}if(row)db.prepare('UPDATE rate_limits SET count=count+1 WHERE key=?').run(key);else db.prepare('INSERT INTO rate_limits VALUES(?,?,?)').run(key,1,now+windowMs);db.exec('COMMIT');return true;}catch(e){db.exec('ROLLBACK');throw e;}
}
