// Server-to-server research plan bridge. No patient input or paid model calls.
export const missions=Object.freeze(['imaging','cohort','literature','botanical']);
const roles=['Mission planner','Evidence auditor','Data quality','Imaging specialist','Interoperability specialist','Statistics specialist','Research coordinator','Safety reviewer'];
const json=(status,data)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
export function validateCouncil(data,mission){
 if(!data||data.schema!=='healthos-swarmlab-council-v1'||data.mission!==mission||data.mode!=='deterministic-research-plan'||data.modelCalls!==0||data.clinicalValidation!==false||!Array.isArray(data.agents)||data.agents.length!==8||typeof data.notice!=='string'||data.notice.length>400)throw Error('invalid council');
 const agents=data.agents.map((a,i)=>{if(!a||a.role!==roles[i]||a.status!==(i===0||i===7?'ready':'review_required')||typeof a.task!=='string'||!a.task.length||a.task.length>500)throw Error('invalid role');return {role:a.role,status:a.status,task:a.task}});
 return {schema:data.schema,mission,mode:data.mode,modelCalls:0,clinicalValidation:false,agents,notice:'Deterministic research task plan, not executed research, AI inference or clinical findings.'};
}
export async function councilGateway(request,env){
 const u=new URL(request.url);
 if(request.method!=='GET'||request.body)return json(405,{error:'GET only'});
 if([...u.searchParams.keys()].length!==1||!u.searchParams.has('mission')||!missions.includes(u.searchParams.get('mission')))return json(400,{error:'Only one fixed research mission ID accepted'});
 if(request.headers.get('sec-fetch-site')==='cross-site'||(request.headers.get('origin')&&request.headers.get('origin')!==u.origin))return json(403,{error:'Same-origin use only'});
 if(env.SWARM_COUNCIL_ENABLED!=='true'||!env.SWARMLAB||typeof env.HEALTHOS_BRIDGE_TOKEN!=='string'||env.HEALTHOS_BRIDGE_TOKEN.length<32)return json(503,{error:'Research council bridge disabled or not configured'});
 const mission=u.searchParams.get('mission');
 try{
  const upstream=await env.SWARMLAB.fetch(new Request('https://swarmlab.internal/api/health-council?mission='+mission,{headers:{Authorization:'Bearer '+env.HEALTHOS_BRIDGE_TOKEN},redirect:'manual',signal:AbortSignal.timeout(5000)}));
  if(!upstream.ok||!upstream.body)throw Error('upstream unavailable');
  const reader=upstream.body.getReader(),decoder=new TextDecoder();let size=0,raw='';
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw Error('oversized response')}raw+=decoder.decode(value,{stream:true})}raw+=decoder.decode()}finally{reader.releaseLock()}
  return json(200,validateCouncil(JSON.parse(raw),mission));
 }catch{return json(502,{error:'SwarmLab research council unavailable; no automatic fallback'})}
}
