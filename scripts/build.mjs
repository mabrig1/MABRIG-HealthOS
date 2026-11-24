import {readFile,mkdir,writeFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const [template,style,core,ui]=await Promise.all(['src/index.template.html','src/styles.css','src/evidence.js','src/app.js'].map(read));
const html=template.replace('<!-- HEALTHOS_STYLE -->','<style>\n'+style.trimEnd()+'\n</style>').replace('<!-- HEALTHOS_SCRIPT -->',"<script>\n'use strict';\n"+core.trimEnd()+"\n"+ui.trimEnd()+"\n</script>");
if(html.includes('<!-- HEALTHOS_'))throw Error('Unresolved template placeholder');
await mkdir(new URL('../dist/',import.meta.url),{recursive:true});
await writeFile(new URL('../dist/index.html',import.meta.url),html);
console.log('Built dist/index.html (standalone, no dependencies)');
