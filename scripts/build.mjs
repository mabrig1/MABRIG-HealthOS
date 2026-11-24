import {readFile,mkdir,writeFile,rm,cp,stat} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const [template,style,core,bridge,ui]=await Promise.all(['src/index.template.html','src/styles.css','src/evidence.js','src/integrations.js','src/app.js'].map(read));
const html=template.replace('<!-- HEALTHOS_STYLE -->','<style>\n'+style.trimEnd()+'\n</style>').replace('<!-- HEALTHOS_SCRIPT -->',"<script>\n'use strict';\n"+core.trimEnd()+"\n"+bridge.trimEnd()+"\n"+ui.trimEnd()+"\n</script>");
if(html.includes('<!-- HEALTHOS_'))throw Error('Unresolved template placeholder');
await mkdir(new URL('../dist/',import.meta.url),{recursive:true});
await writeFile(new URL('../dist/index.html',import.meta.url),html);
// Never bundle unreviewed assets or carry over stale runtime files.
const target=new URL('../dist/face-runtime/',import.meta.url);
await rm(target,{recursive:true,force:true});
if(process.env.HEALTHOS_FACE_ASSETS_APPROVED==='true'){
 const source=new URL('../face-runtime-reviewed/',import.meta.url);
 const manifest=JSON.parse(await readFile(new URL('manifest.json',source),'utf8'));
 if(manifest.version!=='0.10.21'||manifest.model!=='face-landmarker-float16-1'||!manifest.files||Object.keys(manifest.files).length!==6)throw Error('Invalid reviewed runtime manifest');
 const names=['vision_bundle.mjs','face_landmarker.task','wasm/vision_wasm_internal.js','wasm/vision_wasm_internal.wasm','wasm/vision_wasm_nosimd_internal.js','wasm/vision_wasm_nosimd_internal.wasm'];
 const {createHash}=await import('node:crypto');
 for(const n of names){const url=new URL(n,source),s=await stat(url);if(!s.isFile()||s.size>25*1024*1024||s.size===0||!/^([a-f0-9]{64})$/.test(manifest.files[n]||''))throw Error('Missing or invalid approved asset '+n);const bytes=await readFile(url);if(createHash('sha256').update(bytes).digest('hex')!==manifest.files[n])throw Error('Asset checksum mismatch '+n);}
 // Copy only explicitly verified files, not the input directory or arbitrary contents.
 await mkdir(new URL('wasm/',target),{recursive:true});
 for(const n of names)await cp(new URL(n,source),new URL(n,target));
 console.log('Reviewed optional Face Landmarker runtime staged');
}
console.log('Built dist/index.html (standalone core)');
