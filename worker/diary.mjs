// Single-owner opaque encrypted vault. Never receives a plaintext journal or passphrase.
export const VAULT_KEY='private/facial-diary-v1.enc',MAX_VAULT=8*1024*1024;
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const json=(status,x)=>Response.json(x,{status,headers});
export function diaryConfigured(env){return env.DIARY_ENABLED==='true'&&!!env.HEALTHOS_STORAGE&&typeof env.HEALTH_DIARY_OWNER_TOKEN==='string'&&env.HEALTH_DIARY_OWNER_TOKEN.length>=32&&env.HEALTH_DIARY_OWNER_TOKEN.length<=200}
async function auth(request,token){const h=request.headers.get('Authorization')||'';if(h.length>256)return false;const e=new TextEncoder(),a=new Uint8Array(await crypto.subtle.digest('SHA-256',e.encode(h))),b=new Uint8Array(await crypto.subtle.digest('SHA-256',e.encode('Bearer '+token)));let d=0;for(let i=0;i<a.length;i++)d|=a[i]^b[i];return d===0}
async function bounded(request){const n=request.headers.get('Content-Length');if(n!==null&&(!/^\d+$/.test(n)||Number(n)>MAX_VAULT))throw Error('size');if(!request.body)throw Error('empty');const reader=request.body.getReader(),parts=[];let total=0;try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>MAX_VAULT){await reader.cancel();throw Error('size')}parts.push(value)}}finally{reader.releaseLock()}const out=new Uint8Array(total);let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length}if(out.length<49||out[0]!==72||out[1]!==79||out[2]!==83||out[3]!==49)throw Error('envelope');return out}
export async function diaryGateway(request,env){
 const u=new URL(request.url);if(u.search||!['GET','PUT'].includes(request.method))return json(405,{error:'GET or PUT only, no query'});
 if(request.headers.get('Sec-Fetch-Site')==='cross-site'||(request.headers.get('Origin')&&request.headers.get('Origin')!==u.origin)||request.headers.get('X-HealthOS-Vault')!=='1')return json(403,{error:'Same-origin explicit vault request required'});
 if(!diaryConfigured(env))return json(503,{error:'Diary disabled'});
 if(!await auth(request,env.HEALTH_DIARY_OWNER_TOKEN))return json(401,{error:'Unauthorized'});
 const bucket=env.HEALTHOS_STORAGE;
 try{
 if(request.method==='GET'){const o=await bucket.get(VAULT_KEY);if(!o)return json(404,{error:'No vault'});if(o.size>MAX_VAULT||!o.body)return json(502,{error:'Invalid vault'});return new Response(o.body,{headers:{...headers,'Content-Type':'application/octet-stream',ETag:o.httpEtag}})}
 if(request.headers.get('Content-Type')!=='application/octet-stream')return json(415,{error:'Encrypted envelope required'});
 const match=request.headers.get('If-Match'),create=request.headers.get('If-None-Match');
 if((match&&create)||(!match&&create!=='*')||(match&&!/^"[a-fA-F0-9]{32}"$/.test(match)))return json(428,{error:'Conditional version required'});
 let bytes;try{bytes=await bounded(request)}catch{return json(400,{error:'Invalid or oversized encrypted envelope'})}
 const conditions=new Headers();conditions.set(match?'If-Match':'If-None-Match',match||'*');
 const o=await bucket.put(VAULT_KEY,bytes,{onlyIf:conditions,httpMetadata:{contentType:'application/octet-stream',cacheControl:'no-store'}});
 if(!o)return json(412,{error:'Vault changed; reload before saving'});
 return new Response(null,{status:204,headers:{...headers,ETag:o.httpEtag}});
 }catch{return json(503,{error:'Private vault unavailable'})}
}
