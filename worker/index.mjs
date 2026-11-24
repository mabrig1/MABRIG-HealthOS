import {diaryGateway,diaryConfigured} from './diary.mjs';
import {researchAI,aiConfigured,freeAIConfigured} from './research-ai.mjs';
export {HealthAIQuota} from './research-ai.mjs';
import {councilGateway} from './council.mjs';
// Fixed-topic publication metadata gateway. No patient text, AI inference or medical advice.
const TOPICS=Object.freeze({
 care:'"care coordination" AND "health records"',
 documentation:'"medication reconciliation" AND "documentation"',
 plants:'"medicinal plants" AND "toxicity" AND review',
 access:'"healthcare access" AND "Nigeria"'
});
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
const json=(status,data)=>new Response(JSON.stringify(data),{status,headers});
const safe=(x,n)=>typeof x==='string'?x.slice(0,n):'';
export async function searchEvidence(topic,fetcher=globalThis.fetch){
 if(typeof topic!=='string'||!Object.hasOwn(TOPICS,topic))throw Error('invalid_topic');
 const url=new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
 for(const [k,v] of Object.entries({query:TOPICS[topic],format:'json',pageSize:'10',resultType:'lite'}))url.searchParams.set(k,v);
 const res=await fetcher(url.toString(),{method:'GET',headers:{accept:'application/json'},redirect:'manual',signal:AbortSignal.timeout(10000)});
 if(!res.ok)throw Error('provider_unavailable');
 if(!res.body)throw Error('empty_provider_response');
 const reader=res.body.getReader();let size=0;const decoder=new TextDecoder();let raw='';
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>262144){await reader.cancel();throw Error('oversized_response');}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();}finally{reader.releaseLock();}
 const data=JSON.parse(raw),rows=data?.resultList?.result;if(!Array.isArray(rows))throw Error('invalid_provider_response');
 const seen=new Set(),items=[];
 for(const x of rows.slice(0,10)){
  if(!x||typeof x!=='object')continue;
  const id=safe(x.id,80),source=safe(x.source,10),title=safe(x.title,500);
  if(!/^[A-Z]{2,8}$/.test(source)||!/^[a-zA-Z0-9._-]+$/.test(id)||!title)continue;
  const key=source+':'+id;if(seen.has(key))continue;seen.add(key);
  items.push({id,source,title,authors:safe(x.authorString,400),year:safe(x.pubYear,4),journal:safe(x.journalTitle,200),doi:safe(x.doi,200),url:'https://europepmc.org/article/'+source+'/'+id});
 }
 return {schema:'healthos-public-evidence-v1',topic,query:TOPICS[topic],provider:'Europe PMC',retrievedAt:new Date().toISOString(),items,notice:'Publication metadata only. Relevance, study quality, retractions, and clinical applicability require independent review.'};
}
export async function handle(request,env,fetcher=globalThis.fetch,cache=undefined){
 const u=new URL(request.url);
 if(u.pathname==='/api/diary')return diaryGateway(request,env);
 if(u.pathname==='/api/research-ai')return researchAI(request,env,fetcher);
 if(u.pathname==='/api/council')return councilGateway(request,env);
 if(u.pathname==='/api/health')return request.method==='GET'?json(200,{service:'healthos',evidence:env.EVIDENCE_ENABLED==='true',council:env.SWARM_COUNCIL_ENABLED==='true'&&!!env.SWARMLAB&&typeof env.HEALTHOS_BRIDGE_TOKEN==='string'&&env.HEALTHOS_BRIDGE_TOKEN.length>=32,researchAI:aiConfigured(env),freeLLMAPI:freeAIConfigured(env),diary:diaryConfigured(env),clinicalUse:false}):json(405,{error:'Method not allowed'});
 if(u.pathname!=='/api/evidence'){
  if(u.pathname.startsWith('/api/'))return json(404,{error:'Not found'});
  return env.ASSETS.fetch(request);
 }
 if(request.method!=='GET'||request.body)return json(405,{error:'GET only'});
 if([...u.searchParams.keys()].length!==1||!u.searchParams.has('topic')||!Object.hasOwn(TOPICS,u.searchParams.get('topic')))return json(400,{error:'Only one predefined topic ID is accepted'});
 if(env.EVIDENCE_ENABLED!=='true')return json(503,{error:'Public evidence gateway disabled'});
 if(request.headers.get('sec-fetch-site')==='cross-site'||(request.headers.get('origin')&&request.headers.get('origin')!==u.origin))return json(403,{error:'Same-origin use only'});
 const topic=u.searchParams.get('topic'),key=new Request(u.origin+'/api/evidence?topic='+topic);
 try{if(cache){const cached=await cache.match(key);if(cached)return new Response(cached.body,{status:200,headers});}
  const data=await searchEvidence(topic,fetcher);if(cache){try{await cache.put(key,new Response(JSON.stringify(data),{headers:{...headers,'cache-control':'public, max-age=3600'}}));}catch{/* cache unavailable */}}
  return json(200,data);
 }catch{return json(502,{error:'Literature provider unavailable; retry later or use the public research links'});}
}
export default {fetch(request,env){return handle(request,env,globalThis.fetch,globalThis.caches?.default);}};
