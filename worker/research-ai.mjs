// Owner-only research drafting. Fixed topics, no patient input or paid fallback.
export const MODEL='@cf/meta/llama-3.1-8b-instruct-fp8';
export const DAILY_LIMIT=5;
const topics=Object.freeze({imaging:'Explain how to design a reproducible synthetic geometric segmentation benchmark.',cohort:'Outline quality checks for a generated administrative FHIR fixture.',literature:'Outline a reproducible bibliographic metadata audit without inventing citations.',botanical:'Outline research methods for botanical identity and evidence provenance, without discussing treatments or doses.'});
const json=(status,data)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
async function authorized(request,secret){
 const auth=request.headers.get('Authorization')||'';if(auth.length>256)return false;
 const e=new TextEncoder(),a=new Uint8Array(await crypto.subtle.digest('SHA-256',e.encode(auth))),b=new Uint8Array(await crypto.subtle.digest('SHA-256',e.encode('Bearer '+secret)));let d=0;for(let i=0;i<a.length;i++)d|=a[i]^b[i];return d===0;
}
export class HealthAIQuota{
 constructor(state){this.state=state;}
 async fetch(request){
  if(request.method!=='POST'||new URL(request.url).pathname!=='/reserve')return json(404,{error:'Not found'});
  const day=new Date().toISOString().slice(0,10);
  const result=await this.state.storage.transaction(async tx=>{
   const old=await tx.get('daily'),used=old?.day===day?old.used:0;
   if(!Number.isInteger(used)||used<0||used>=DAILY_LIMIT)return {ok:false,remaining:0};
   await tx.put('daily',{day,used:used+1});return {ok:true,remaining:DAILY_LIMIT-used-1};
  });
  return json(result.ok?200:429,result);
 }
}
export function aiConfigured(env){return env.HEALTH_AI_ENABLED==='true'&&env.CF_AI_FREE_PLAN_CONFIRMED==='true'&&typeof env.HEALTH_AI_OWNER_TOKEN==='string'&&env.HEALTH_AI_OWNER_TOKEN.length>=32&&env.HEALTH_AI_OWNER_TOKEN.length<=200&&!!env.AI&&!!env.HEALTH_AI_QUOTA}
export async function researchAI(request,env){
 const u=new URL(request.url);
 if(request.method!=='POST'||request.body)return json(405,{error:'POST without body required'});
 if(request.headers.get('Origin')!==u.origin||request.headers.get('Sec-Fetch-Site')==='cross-site')return json(403,{error:'Same-origin request required'});
 if([...u.searchParams.keys()].length!==1||!u.searchParams.has('mission')||!Object.hasOwn(topics,u.searchParams.get('mission'))||request.headers.get('X-HealthOS-Consent')!=='true')return json(400,{error:'Fixed mission and explicit consent required'});
 if(!aiConfigured(env))return json(503,{error:'Research AI disabled or not configured'});
 if(!await authorized(request,env.HEALTH_AI_OWNER_TOKEN))return json(401,{error:'Unauthorized'});
 const mission=u.searchParams.get('mission');
 try{
  const quota=env.HEALTH_AI_QUOTA.get(env.HEALTH_AI_QUOTA.idFromName('global-owner'));
  const reserve=await quota.fetch('https://quota.internal/reserve',{method:'POST'});
  if(reserve.status===429)return json(429,{error:'Daily research call limit reached'});
  if(!reserve.ok)return json(503,{error:'Quota unavailable'});
  const q=await reserve.json();if(q.ok!==true||!Number.isInteger(q.remaining)||q.remaining<0||q.remaining>=DAILY_LIMIT)return json(503,{error:'Quota unavailable'});
  const result=await env.AI.run(MODEL,{messages:[{role:'system',content:'You draft research-method checklists only. No patient data, diagnosis, triage, treatments, medical advice, invented citations, or claims of executed research. State limitations. Output plain text.'},{role:'user',content:topics[mission]}],max_tokens:300,temperature:0.2,stream:false});
  if(typeof result?.response!=='string'||!result.response.trim())return json(502,{error:'Model response unavailable; reserved call not refunded'});
  return json(200,{schema:'healthos-ai-draft-v1',mission,provider:'workers-ai',model:MODEL,draft:result.response.slice(0,3000),remaining:q.remaining,clinicalValidation:false,notice:'AI-generated research-method draft only; independently review. No experiments or literature verification performed.'});
 }catch{return json(503,{error:'Research AI unavailable; no fallback or automatic retry'})}
}
