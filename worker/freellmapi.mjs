// Owner-only, private FreeLLMAPI gateway. No user-controlled URL/model/prompt.
export const FREE_URL='https://llm-private.mabrigkorie.org/v1/chat/completions';
export const FREE_PROFILE='auto:healthos-free';
const secret=(s,min=16)=>typeof s==='string'&&s.length>=min&&s.length<=512&&!/[\r\n]/.test(s);
export function freeConfigured(env){
 return env.FREELLMAPI_ENABLED==='true'&&env.FREELLMAPI_FREE_PROFILE_CONFIRMED==='true'&&secret(env.FREELLMAPI_UNIFIED_KEY,24)&&secret(env.FREELLMAPI_ACCESS_CLIENT_ID)&&secret(env.FREELLMAPI_ACCESS_CLIENT_SECRET,24);
}
export async function freeDraft(env,messages,fetcher=globalThis.fetch){
 if(!freeConfigured(env))throw Error('disabled');
 const response=await fetcher(FREE_URL,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.FREELLMAPI_UNIFIED_KEY,'CF-Access-Client-Id':env.FREELLMAPI_ACCESS_CLIENT_ID,'CF-Access-Client-Secret':env.FREELLMAPI_ACCESS_CLIENT_SECRET},body:JSON.stringify({model:FREE_PROFILE,messages,max_tokens:300,temperature:0.2,stream:false}),redirect:'error',signal:AbortSignal.timeout(45000)});
 if(!response.ok||!response.body)throw Error('router unavailable');
 const reader=response.body.getReader(),decoder=new TextDecoder();let raw='',size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();throw Error('oversize')}raw+=decoder.decode(value,{stream:true})}raw+=decoder.decode()}finally{reader.releaseLock()}
 const data=JSON.parse(raw),draft=data?.choices?.[0]?.message?.content,route=response.headers.get('X-Routed-Via');
 if(typeof draft!=='string'||!draft.trim()||typeof route!=='string'||!route.includes('/')||route.length>250||!/^[\x21-\x7e]+$/.test(route))throw Error('invalid response');
 // Metadata is reported by the router, not proof that the upstream call was free.
 for(const key of [env.FREELLMAPI_UNIFIED_KEY,env.FREELLMAPI_ACCESS_CLIENT_ID,env.FREELLMAPI_ACCESS_CLIENT_SECRET])if(draft.includes(key)||route.includes(key))throw Error('unexpected credential echo');
 return {draft:draft.slice(0,3000),model:route};
}
