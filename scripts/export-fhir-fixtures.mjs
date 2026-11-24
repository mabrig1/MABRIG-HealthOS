import {readFile,mkdir,writeFile} from 'node:fs/promises';import vm from 'node:vm';
const src=await readFile(new URL('../src/app.js',import.meta.url),'utf8'),ctx=vm.createContext({});vm.runInContext(src.slice(src.indexOf('const clinicalRegistry='),src.indexOf('let cohort=null')),ctx);
const dir=new URL('../clinical/fhir/generated/',import.meta.url);await mkdir(dir,{recursive:true});
for(const n of [5,10,20,50])await writeFile(new URL('cohort-'+n+'.json',dir),JSON.stringify(ctx.makeCohort(n),null,2));
