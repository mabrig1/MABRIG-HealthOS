const $=id=>document.getElementById(id);let current='followup',closed=new Set(),agentResults=[];const elem=(t,s,c)=>{const e=document.createElement(t);if(s!==undefined)e.textContent=s;if(c)e.className=c;return e};const add=(p,...nodes)=>p.append(...nodes);const clear=id=>$(id).replaceChildren();const fixture=()=>fixtures[current];function item(title,desc,meta){const e=elem('div',undefined,'item');add(e,elem('h3',title),elem('p',desc),elem('div',meta,'meta'));return e}function report(){return compileEvidence(current,[...closed],agentResults.length>0)}

function render(){const f=fixture(),remaining=f.actions.length-closed.size;clear('metrics');for(const [label,value,sub] of [['Evidence records',f.records.length,'Fictional source events'],['Unresolved actions',remaining,'Not a medical-risk score'],['Source discrepancies',current==='conflict'?1:0,'Requires human clarification']]){const e=elem('div',undefined,'tile');add(e,elem('span',label),elem('strong',String(value)),elem('span',sub));$('metrics').append(e)}clear('overview-actions');clear('action-list');for(const [id,text,record,owner] of f.actions){const done=closed.has(id);const card=item(text,owner,`Source ${record}`);card.append(elem('span',done?'Reported complete':'Open',done?'tag done':'tag open'));$('overview-actions').append(card);const line=item(text,owner,`Source ${record}`);const btn=elem('button',done?'Reopen':'Mark reported complete','action-btn');btn.addEventListener('click',()=>{done?closed.delete(id):closed.add(id);agentResults=[];clear('agents');$('swarm-status').textContent='Action status changed. Run again for an updated report.';render()});line.append(btn);$('action-list').append(line)}clear('completeness');const progress=elem('div',undefined,'progress'),bar=elem('div');bar.style.width=(100*closed.size/f.actions.length)+'%';progress.append(bar);add($('completeness'),elem('h3',`${closed.size} of ${f.actions.length} actions reported complete`),progress);$('findings').textContent=f.finding;clear('records');clear('ledger');for(const [id,day,type,text,source,status] of f.records){$('records').append(item(`Day ${day} · ${type}`,text,`${id} · ${source} · ${status}`));$('ledger').append(item(`${id} · ${source}`,text,`Evidence status: ${status}`))}drawMap();renderVisit();clearHandoff();}
function drawMap(){clear('map');const f=fixture(),NS='http://www.w3.org/2000/svg';const node=(tag,attrs,text)=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;return e};const svg=node('svg',{viewBox:'0 0 600 320',class:'map',role:'img','aria-label':'Source records linked to their associated care actions'});const ys=(i)=>70+i*85;for(const [i,a] of f.actions.entries()){const j=f.records.findIndex(r=>r[0]===a[2]);svg.append(node('line',{x1:220,y1:ys(j),x2:380,y2:ys(i),stroke:'#79a99b','stroke-width':2}))}for(const [i,r] of f.records.entries()){svg.append(node('rect',{x:12,y:ys(i)-22,width:208,height:44,rx:9,fill:'#e7f4ed',stroke:'#97bdae'}),node('text',{x:116,y:ys(i)+5,'text-anchor':'middle',fill:'#14342f','font-size':14},r[0]+' · '+r[2]))}for(const [i,a] of f.actions.entries()){svg.append(node('rect',{x:380,y:ys(i)-22,width:208,height:44,rx:9,fill:closed.has(a[0])?'#e7f4ed':'#fff4df',stroke:'#b8b3a0'}),node('text',{x:484,y:ys(i)+5,'text-anchor':'middle',fill:'#14342f','font-size':14},a[0]+' · '+(closed.has(a[0])?'Reported complete':'Open action')))}$('map').append(svg)}
function runSwarm(){agentResults=compileEvidence(current,[...closed],true).agents;clear('agents');for(const a of agentResults){const e=elem('article',undefined,'agent');add(e,elem('span','SCRIPTED COMPLETE','tag done'),elem('h3',a.id+'. '+a.role),elem('p',a.output));$('agents').append(e)}$('swarm-status').textContent='12 scripted roles completed · 0 AI calls · not clinically validated.'}
function renderVisit(){const q=prepareVisit(report());clear('visit-questions');if(!q.length){$('visit-questions').append(elem('p','All fictional actions are reported complete; this is not clinical clearance.'));return}for(const x of q)$('visit-questions').append(item(x.question,x.reviewer,'Source '+x.source))}
function reset(){current=$('case').value;closed=new Set();agentResults=[];clear('agents');$('swarm-status').textContent='Ready for demonstration.';render()}
$('case').addEventListener('change',reset);$('reset').addEventListener('click',reset);$('compile').addEventListener('click',()=>{render();runSwarm()});$('run-swarm').addEventListener('click',runSwarm);$('export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(report(),null,2)],{type:'application/json'}));const a=elem('a');a.href=url;a.download='healthos-fictional-evidence.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});const headings={overview:'Your health story, connected.',timeline:'Health timeline',evidence:'Evidence intelligence',actions:'Close the documentation loop.',swarm:'Specialist evidence swarm',privacy:'Privacy by design',visit:'Prepare for a care visit',library:'Health evidence library',ecosystem:'MABRIG connected workspace',research:'Public research radar',imaging:'MONAI imaging research lab',studio:'Medical imaging studio',clinical:'Clinical research OS',council:'SwarmLab research council',compute:'Scientific computing laboratory',ai:'AI research providers',wellness:'Facial wellness & healthy aging'};for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>{for(const v of document.querySelectorAll('.view'))v.hidden=v.id!==b.dataset.view;for(const x of document.querySelectorAll('[data-view]')){x.classList.toggle('active',x===b);x.setAttribute('aria-current',x===b?'page':'false')}$('heading').textContent=headings[b.dataset.view]});

let pendingHandoff=null;
function clearHandoff(){pendingHandoff=null;$('handoff-preview').hidden=true;$('handoff-text').textContent='';$('handoff-status').textContent='';}
function setupEcosystem(){
 for(const t of ecosystem){const card=elem('article',undefined,'agent'),link=elem('a','Open destination ↗');link.href=t.url;link.target='_blank';link.rel='noopener noreferrer';const btn=elem('button',t.kind==='csv'?'Prepare fictional CSV':'Prepare research brief');btn.addEventListener('click',()=>{pendingHandoff=ecosystemHandoff(t.id,current,[...closed]);$('handoff-text').textContent=pendingHandoff.content;$('handoff-instruction').textContent=t.instruction;$('handoff-preview').hidden=false;$('handoff-status').textContent='Review the content before copying or downloading.'});add(card,elem('h3',t.name),elem('p',t.purpose),elem('p','Manual handoff · external destination','meta'),btn,elem('p'));card.lastChild.append(link);$('ecosystem-grid').append(card)}
 $('handoff-download').addEventListener('click',()=>{if(!pendingHandoff)return;const a=elem('a'),url=URL.createObjectURL(new Blob([pendingHandoff.content],{type:pendingHandoff.mime}));a.href=url;a.download=pendingHandoff.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('handoff-status').textContent='Local download requested; nothing sent to another application.'});
 $('handoff-copy').addEventListener('click',async()=>{if(!pendingHandoff)return;try{await navigator.clipboard.writeText(pendingHandoff.content);$('handoff-status').textContent='Copied. Paste only into the intended destination.'}catch{$('handoff-status').textContent='Clipboard unavailable. Select the preview text or download the file.'}});
}
setupEcosystem();
render();

let sourcePacket=null;
function clearResearch(){sourcePacket=null;$('research-export').disabled=true;clear('research-results');$('research-status').textContent='No retrieval performed for this topic.'}
$('research-topic').addEventListener('change',clearResearch);
$('research-run').addEventListener('click',async()=>{
 clearResearch();
 if(location.protocol==='file:'){$('research-status').textContent='Offline file: research gateway unavailable. Use the hosted HealthOS Worker or public research links.';return;}
 const topic=$('research-topic').value;const allowed=['care','documentation','plants','access'];if(!allowed.includes(topic))return;
 $('research-run').disabled=true;$('research-topic').disabled=true;$('research-status').textContent='Requesting publication metadata…';
 try{
 const response=await globalThis.fetch('/api/evidence?topic='+encodeURIComponent(topic),{credentials:'omit',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('unavailable');
 const packet=await response.json();if(packet.schema!=='healthos-public-evidence-v1'||packet.topic!==topic||!Array.isArray(packet.items)||packet.items.length>10)throw Error('invalid response');
 for(const p of packet.items){if(!p||typeof p.title!=='string'||!/^https:\/\/europepmc\.org\/article\/[A-Z]{2,8}\/[a-zA-Z0-9._-]+$/.test(p.url))throw Error('invalid source');}
 sourcePacket=packet;
 for(const p of packet.items){const e=item(p.title,p.authors||'Authors not supplied',[p.journal,p.year,p.doi?'DOI: '+p.doi:'DOI not supplied'].filter(Boolean).join(' · '));const link=elem('a','View source ↗');link.href=p.url;link.target='_blank';link.rel='noopener noreferrer';e.append(link);$('research-results').append(e)}
 $('research-status').textContent=packet.items.length+' publication records · Europe PMC · retrieved '+packet.retrievedAt+' · not clinically verified';$('research-export').disabled=false;
 }catch{clearResearch();$('research-status').textContent='Research gateway unavailable or disabled. Use the evidence library links; no fabricated results shown.'}
 finally{$('research-run').disabled=false;$('research-topic').disabled=false;}
});
$('research-export').addEventListener('click',()=>{if(!sourcePacket)return;const a=elem('a'),url=URL.createObjectURL(new Blob([JSON.stringify(sourcePacket,null,2)],{type:'application/json'}));a.href=url;a.download='healthos-public-source-packet.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});

// Accept only the exact synthetic experiment schema; never render arbitrary file text.
function validateImagingReport(r){
 const keys=['schema','synthetic_only','clinical_validation','monai_version','upstream_commit','seed','size','method','dice','intersection','predicted_pixels','reference_pixels','untrained_unet_shape','untrained_unet_finite','reference_mask','predicted_mask'];
 if(!r||typeof r!=='object'||Array.isArray(r)||Object.keys(r).length!==keys.length||!keys.every(k=>Object.hasOwn(r,k)))throw Error('invalid schema');
 if(r.schema!=='healthos-monai-synthetic-v1'||r.synthetic_only!==true||r.clinical_validation!==false||r.monai_version!=='1.6.2'||r.upstream_commit!=='a85d75e11cdd9c6d6d13500dc7f3960dd07dd7d3'||r.seed!==42||r.size!==64||r.method!=='threshold_baseline'||r.untrained_unet_finite!==true||JSON.stringify(r.untrained_unet_shape)!=='[1,2,64,64]')throw Error('invalid experiment metadata');
 for(const m of [r.reference_mask,r.predicted_mask])if(!Array.isArray(m)||m.length!==4096||!m.every(x=>x===0||x===1))throw Error('invalid mask');
 let ref=0,pred=0,both=0;
 for(let i=0;i<4096;i++){const x=i%64,y=Math.floor(i/64),expected=((x-32)**2+(y-32)**2<=256)?1:0;if(r.reference_mask[i]!==expected)throw Error('not the synthetic reference');ref+=expected;pred+=r.predicted_mask[i];both+=expected*r.predicted_mask[i];}
 if(r.reference_pixels!==ref||r.predicted_pixels!==pred||r.intersection!==both||typeof r.dice!=='number'||!Number.isFinite(r.dice)||Math.abs(r.dice-2*both/(ref+pred))>1e-6)throw Error('inconsistent metrics');
 return r;
}

function clearImaging(){clear('imaging-metrics');for(const id of ['imaging-reference','imaging-prediction']){const c=$(id).getContext('2d');c.clearRect(0,0,64,64)}}
function drawImaging(id,mask){const c=$(id).getContext('2d'),img=c.createImageData(64,64);for(let i=0;i<4096;i++){const v=mask[i]?230:22;img.data.set([v,v,v,255],i*4)}c.putImageData(img,0,0)}
let imagingSequence=0;
$('imaging-file').addEventListener('change',async()=>{
 const seq=++imagingSequence;clearImaging();const file=$('imaging-file').files[0];if(!file){$('imaging-status').textContent='No report loaded.';return}
 try{if(file.size>131072)throw Error('too large');const r=validateImagingReport(JSON.parse(await file.text()));if(seq!==imagingSequence)return;drawImaging('imaging-reference',r.reference_mask);drawImaging('imaging-prediction',r.predicted_mask);for(const [title,value] of [['Threshold Dice',r.dice.toFixed(4)],['Reference pixels',String(r.reference_pixels)],['Untrained U-Net shape','1 × 2 × 64 × 64']]){const e=elem('div',undefined,'tile');add(e,elem('span',title),elem('strong',value));$('imaging-metrics').append(e)}$('imaging-status').textContent='Imported synthetic report · MONAI 1.6.2 · overlap cross-check passed locally · execution not authenticated.'}
 catch{if(seq===imagingSequence){clearImaging();$('imaging-status').textContent='Report rejected. Use only the generated synthetic lab JSON; no patient images or medical records.'}}
 finally{if(seq===imagingSequence)$('imaging-file').value=''}
});

// Geometry-only phantom. No patient data, models or external data sources.
const PHANTOM_SIZE=48;
function phantomVoxel(x,y,z){
 for(const v of [x,y,z])if(!Number.isInteger(v)||v<0||v>=PHANTOM_SIZE)throw Error('invalid voxel');
 const a=(x-24)/17,b=(y-24)/14,c=(z-24)/19;
 const outer=a*a+b*b+c*c<=1;
 const inner=((x-18)/6)**2+((y-24)/5)**2+((z-24)/8)**2<=1;
 const second=((x-30)/5)**2+((y-28)/4)**2+((z-28)/7)**2<=1;
 return inner?{value:220,label:2}:second?{value:155,label:3}:outer?{value:90,label:1}:{value:12,label:0};
}
function phantomSlice(plane,index,level=128,width=256,overlay=false){
 if(!['axial','coronal','sagittal'].includes(plane)||!Number.isInteger(index)||index<0||index>=PHANTOM_SIZE||!Number.isFinite(level)||level<0||level>255||!Number.isFinite(width)||width<1||width>512||typeof overlay!=='boolean')throw Error('invalid view');
 const rgba=new Uint8ClampedArray(PHANTOM_SIZE*PHANTOM_SIZE*4);
 for(let y=0;y<PHANTOM_SIZE;y++)for(let x=0;x<PHANTOM_SIZE;x++){
  const [a,b,c]=plane==='axial'?[x,y,index]:plane==='coronal'?[x,index,y]:[index,x,y];
  const v=phantomVoxel(a,b,c),g=Math.round(255*Math.max(0,Math.min(1,(v.value-level+width/2)/width))),i=4*(y*PHANTOM_SIZE+x);
  const color=overlay&&v.label===2?[255,116,40]:overlay&&v.label===3?[45,205,175]:[g,g,g];
  rgba.set([...color,255],i);
 }
 return rgba;
}
function phantomSummary(){const counts=[0,0,0,0];for(let z=0;z<PHANTOM_SIZE;z++)for(let y=0;y<PHANTOM_SIZE;y++)for(let x=0;x<PHANTOM_SIZE;x++)counts[phantomVoxel(x,y,z).label]++;
 return {schema:'healthos-geometric-phantom-v1',synthetic_only:true,clinical_validation:false,dimensions:[48,48,48],voxel_spacing_mm:[1,1,1],labels:counts.map((count,label)=>({label,voxel_count:count,synthetic_volume_mm3:count})),notice:'Analytic geometric phantom only; volumes are not anatomical measurements.'};}

const studioPlanes=['axial','coronal','sagittal'];
function renderStudio(){
 const level=Number($('studio-level').value),width=Number($('studio-width').value),overlay=$('studio-overlay').checked;
 $('studio-level-value').textContent=String(level);$('studio-width-value').textContent=String(width);
 for(const plane of studioPlanes){const i=Number($('studio-'+plane+'-slice').value),canvas=$('studio-'+plane),ctx=canvas.getContext('2d');$('studio-'+plane+'-value').textContent=String(i);if(ctx){const img=ctx.createImageData(48,48);img.data.set(phantomSlice(plane,i,level,width,overlay));ctx.putImageData(img,0,0);}}
}
for(const id of ['studio-level','studio-width','studio-overlay',...studioPlanes.map(p=>'studio-'+p+'-slice')])$(id).addEventListener('input',renderStudio);
$('studio-reset').addEventListener('click',()=>{$('studio-level').value=128;$('studio-width').value=256;$('studio-overlay').checked=true;for(const p of studioPlanes)$('studio-'+p+'-slice').value=24;renderStudio()});
$('studio-export').addEventListener('click',()=>{const a=elem('a'),url=URL.createObjectURL(new Blob([JSON.stringify(phantomSummary(),null,2)],{type:'application/json'}));a.href=url;a.download='healthos-synthetic-geometry.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
for(const l of phantomSummary().labels.slice(1))$('studio-summary').append(item('Geometry label '+l.label,l.voxel_count+' voxels',l.synthetic_volume_mm3+' mm³ at synthetic 1 mm spacing'));
renderStudio();

const clinicalRegistry=[{"name":"PyHealth","repo":"sunlabuiuc/PyHealth","version":"v2.1.0","commit":"e5394d5ca1aa39b4ba70ad81bc708343ba37b092","purpose":"Longitudinal health research","runtime":"Source pinned; not executed"},{"name":"OpenMRS","repo":"openmrs/openmrs-core","version":"2.8.10","commit":"a7f6314dd430cbc393313dcfcdc6dd2edecea377","purpose":"Electronic records","runtime":"Source pinned; not executed"},{"name":"Synthea","repo":"synthetichealth/synthea","version":"master snapshot","commit":"5441eef7de9867babcde1551640b78f3e0119594","purpose":"Synthetic datasets","runtime":"Source pinned; not executed"},{"name":"MONAILabel","repo":"Project-MONAI/MONAILabel","version":"0.8.6","commit":"f824cd267f32429f518d1d0c7f699909b2dbe559","purpose":"Image annotation","runtime":"Source pinned; not executed"},{"name":"MONAIModelZoo","repo":"Project-MONAI/model-zoo","version":"dev snapshot","commit":"c1f50fb80be8a6274fa7de956bb742faab1a833d","purpose":"Model bundle review","runtime":"Source pinned; not executed"},{"name":"HAPIFHIR","repo":"hapifhir/hapi-fhir","version":"v9.0.0","commit":"28e4e97ccf2035af9be7c00612a01d82d366f18c","purpose":"Interoperability","runtime":"Source pinned; not executed"}];
function makeCohort(n){
 if(![5,10,20,50].includes(n))throw Error('Invalid fictional cohort size');
 const entry=[];
 for(let i=1;i<=n;i++){const k=String(i).padStart(3,'0'),p='synthetic-p-'+k,e='synthetic-e-'+k,t='synthetic-t-'+k;
 const patient={resourceType:'Patient',id:p,active:true,identifier:[{system:'urn:mabrig:synthetic',value:p}],name:[{use:'anonymous',family:'SYNTHETIC',given:['Fixture '+k]}]};
 const encounter={resourceType:'Encounter',id:e,status:'finished',class:{system:'http://terminology.hl7.org/CodeSystem/v3-ActCode',code:'AMB'},subject:{reference:'Patient/'+p}};
 const task={resourceType:'Task',id:t,status:i%3===0?'completed':'requested',intent:'order',description:'Fictional administrative documentation check',for:{reference:'Patient/'+p},encounter:{reference:'Encounter/'+e}};
 for(const r of [patient,encounter,task])entry.push({fullUrl:'https://synthetic.invalid/fhir/'+r.resourceType+'/'+r.id,resource:r});}
 return {resourceType:'Bundle',id:'healthos-synthetic-'+n,type:'collection',meta:{tag:[{system:'urn:mabrig:research',code:'synthetic'}]},entry};
}
function checkCohort(b){
 if(!b||!Array.isArray(b.entry)||![15,30,60,150].includes(b.entry.length)||JSON.stringify(b)!==JSON.stringify(makeCohort(b.entry.length/3)))throw Error('Not a generated fixture');
 const refs=new Map(b.entry.map(e=>[e.resource.resourceType+'/'+e.resource.id,e.resource]));
 if(refs.size!==b.entry.length)throw Error('Duplicate resource');
 const rows=b.entry.map(e=>e.resource).filter(r=>r.resourceType==='Task').map(t=>{const p=refs.get(t.for.reference),e=refs.get(t.encounter.reference);if(!p||!e||e.subject.reference!==t.for.reference)throw Error('Broken reference');return {patient:p.id,encounter:e.id,task:t.id,completed:t.status==='completed'?1:0}});
 return {count:rows.length,completed:rows.reduce((a,r)=>a+r.completed,0),rows,formalFHIRValidation:false};
}
function cohortCSV(b){return ['synthetic_id,encounter_id,task_id,completed',...checkCohort(b).rows.map(r=>[r.patient,r.encounter,r.task,r.completed].join(','))].join('\r\n')+'\r\n'}
function manualMark(x,y,z,label){phantomVoxel(x,y,z);if(!['region-a','region-b','background','uncertain'].includes(label))throw Error('Invalid label');return {x,y,z,label,synthetic_only:true}}

let cohort=null,marks=[];
function clinicalExport(name,data,type){const a=elem('a'),url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function resetCohort(){cohort=null;clear('cohort-rows');$('cohort-json').disabled=true;$('cohort-csv').disabled=true;$('cohort-status').textContent='No cohort generated.'}
$('cohort-size').addEventListener('change',resetCohort);
$('cohort-run').addEventListener('click',()=>{resetCohort();cohort=makeCohort(Number($('cohort-size').value));const s=checkCohort(cohort);$('cohort-status').textContent=s.count+' fictional subjects · '+s.completed+' completed administrative tasks · internal references passed · formal FHIR validation not run';for(const r of s.rows.slice(0,10))$('cohort-rows').append(item(r.patient,r.encounter+' · '+r.task,r.completed?'Completed fictional task':'Requested fictional task'));$('cohort-json').disabled=false;$('cohort-csv').disabled=false});
$('cohort-json').addEventListener('click',()=>{if(cohort)clinicalExport('healthos-SYNTHETIC-fhir.json',JSON.stringify(cohort,null,2),'application/json')});
$('cohort-csv').addEventListener('click',()=>{if(cohort)clinicalExport('healthos-SYNTHETIC-cohort.csv',cohortCSV(cohort),'text/csv')});
function renderMarks(){clear('mark-rows');for(const m of marks)$('mark-rows').append(item(m.label,[m.x,m.y,m.z].join(', '),'Manual synthetic mark'));$('mark-status').textContent=marks.length+' / 50 marks'}
$('mark-add').addEventListener('click',()=>{try{const v=['x','y','z'].map(k=>$('mark-'+k).value);if(marks.length>=50||v.some(x=>!x.trim()))throw Error('Invalid');marks.push(manualMark(...v.map(Number),$('mark-label').value));renderMarks()}catch{$('mark-status').textContent='Invalid coordinates or 50-mark limit reached.'}});
$('mark-clear').addEventListener('click',()=>{marks=[];renderMarks()});
$('mark-export').addEventListener('click',()=>clinicalExport('healthos-SYNTHETIC-marks.json',JSON.stringify({schema:'healthos-manual-geometry-v1',synthetic_only:true,marks},null,2),'application/json'));
for(const p of clinicalRegistry){const c=elem('article',undefined,'agent'),a=elem('a','Pinned source ↗');a.href='https://github.com/'+p.repo+'/tree/'+p.commit;a.target='_blank';a.rel='noopener noreferrer';add(c,elem('h3',p.name),elem('p',p.purpose),elem('p',p.version+' · '+p.runtime,'meta'),a);$('clinical-registry').append(c)}
renderMarks();


let councilReport=null;
function resetCouncil(){councilReport=null;clear('council-roles');$('council-export').disabled=true;$('council-status').textContent='No research plan loaded.'}
$('council-mission').addEventListener('change',resetCouncil);
$('council-run').addEventListener('click',async()=>{
 resetCouncil();if(location.protocol==='file:'){$('council-status').textContent='Offline mode: protected hosted gateway required.';return}
 const mission=$('council-mission').value;if(!['imaging','cohort','literature','botanical'].includes(mission))return;
 $('council-run').disabled=true;$('council-mission').disabled=true;$('council-status').textContent='Requesting research plan…';
 try{const res=await globalThis.fetch('/api/council?mission='+mission,{credentials:'omit',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)});if(!res.ok)throw Error('unavailable');const r=await res.json();if(r.schema!=='healthos-swarmlab-council-v1'||r.mission!==mission||r.mode!=='deterministic-research-plan'||r.modelCalls!==0||r.clinicalValidation!==false||!Array.isArray(r.agents)||r.agents.length!==8)throw Error('invalid response');
 for(const a of r.agents){if(typeof a.role!=='string'||typeof a.task!=='string'||!['ready','review_required'].includes(a.status))throw Error('invalid role')}
 councilReport=r;for(const a of r.agents){const e=elem('article',undefined,'agent');add(e,elem('span',a.status==='ready'?'PLAN READY':'REVIEW REQUIRED','tag'),elem('h3',a.role),elem('p',a.task));$('council-roles').append(e)}
 $('council-status').textContent='SwarmLab plan received · 8 roles · 0 model calls · no research executed';$('council-export').disabled=false;
 }catch{resetCouncil();$('council-status').textContent='Council unavailable or disabled. No model calls or automatic fallback initiated.'}finally{$('council-run').disabled=false;$('council-mission').disabled=false}
});
$('council-export').addEventListener('click',()=>{if(councilReport)clinicalExport('healthos-research-council.json',JSON.stringify(councilReport,null,2),'application/json')});

function validateTraining(r){
 if(!r||r.schema!=='healthos-monai-training-v1'||r.synthetic_only!==true||r.clinical_validation!==false||r.monai_version!=='1.6.2'||r.train_seed!==42||r.holdout_seed!==31415||r.train_count!==48||r.holdout_count!==16||r.epochs!==12||!Array.isArray(r.losses)||r.losses.length!==12||!r.losses.every(x=>Number.isFinite(x)&&x>=0))throw Error('invalid training report');
 for(const k of ['model','threshold']){const s=r[k];if(!s||!Array.isArray(s.cases)||s.cases.length!==16||!Number.isFinite(s.mean_dice))throw Error('invalid metrics');let sum=0;
 for(const [i,c] of s.cases.entries()){if(c.case!==i+1||![c.predicted,c.reference,c.intersection].every(x=>Number.isInteger(x)&&x>=0&&x<=1024)||c.reference===0||c.intersection>Math.min(c.predicted,c.reference)||c.predicted+c.reference-c.intersection>1024||!Number.isFinite(c.dice)||Math.abs(c.dice-2*c.intersection/(c.predicted+c.reference))>1e-6)throw Error('inconsistent overlap');sum+=c.dice}
 if(Math.abs(sum/16-s.mean_dice)>1e-6)throw Error('inconsistent mean');}
 for(let i=0;i<16;i++)if(r.model.cases[i].reference!==r.threshold.cases[i].reference)throw Error('different reference sizes');
 return {losses:[...r.losses],model:r.model.mean_dice,threshold:r.threshold.mean_dice};
}

let computeSeq=0;
$('compute-file').addEventListener('change',async()=>{const seq=++computeSeq;clear('compute-metrics');clear('compute-losses');const file=$('compute-file').files[0];if(!file){$('compute-status').textContent='No report loaded.';return}try{if(file.size>65536)throw Error('size');const r=validateTraining(JSON.parse(await file.text()));if(seq!==computeSeq)return;for(const [label,value] of [['Model mean Dice',r.model.toFixed(4)],['Threshold mean Dice',r.threshold.toFixed(4)],['Holdout images','16']]){const e=elem('div',undefined,'tile');add(e,elem('span',label),elem('strong',value));$('compute-metrics').append(e)}for(const [i,l] of r.losses.entries())$('compute-losses').append(item('Epoch '+(i+1),'Training loss '+l.toFixed(5),'Synthetic training only'));$('compute-status').textContent='Imported synthetic experiment · overlap counts consistent · execution not authenticated.'}catch{if(seq===computeSeq)$('compute-status').textContent='Report rejected: invalid synthetic training schema or metrics.'}finally{if(seq===computeSeq)$('compute-file').value=''}});


$('ai-run').addEventListener('click',async()=>{
 $('ai-draft').textContent='';const token=$('ai-token').value;const mission=$('ai-mission').value,provider=$('ai-provider').value,consent=$('ai-consent').checked;
 $('ai-token').value='';$('ai-consent').checked=false;
 if(location.protocol==='file:'||!['imaging','cohort','literature','botanical'].includes(mission)||!['workers-ai','freellmapi'].includes(provider)||token.length<32||!consent){$('ai-status').textContent='Hosted Worker, owner token and explicit consent required.';return}
 $('ai-run').disabled=true;$('ai-status').textContent='Requesting one research draft…';
 try{const res=await globalThis.fetch('/api/research-ai?mission='+mission+'&provider='+provider,{method:'POST',headers:{Authorization:'Bearer '+token,'X-HealthOS-Consent':'true'},credentials:'omit',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(60000)});
 if(!res.ok)throw Error('Unavailable ('+res.status+')');const r=await res.json();
 if(r.schema!=='healthos-ai-draft-v1'||r.mission!==mission||r.provider!==provider||typeof r.model!=='string'||r.model.length>250||r.clinicalValidation!==false||typeof r.draft!=='string'||r.draft.length>3000||!Number.isInteger(r.remaining)||r.remaining<0||r.remaining>4)throw Error('Invalid response');
 $('ai-draft').textContent=r.draft;$('ai-status').textContent='AI-generated draft · '+r.provider+' · '+r.model+' · '+r.remaining+' reserved calls remaining today · human review required';
 }catch(e){$('ai-status').textContent='Request failed or disabled. No automatic HealthOS retry or provider fallback.'}finally{$('ai-run').disabled=false}
});

// Local facial wellness: image quality only, educational guidance from chosen habits.
const wellnessSources=Object.freeze({
 skin:'https://www.aad.org/public/everyday-care/skin-care-secrets/anti-aging/reduce-premature-aging-skin',
 diet:'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
 activity:'https://www.who.int/initiatives/behealthy/physical-activity',
 face:'https://pubmed.ncbi.nlm.nih.gov/41322034/'
});
function wellnessPlan(habits){
 const keys=['sun','dryness','food','movement','sleep','smoking','faceExercise'];
 if(!habits||Object.keys(habits).some(k=>!keys.includes(k))||keys.some(k=>typeof habits[k]!=='boolean'))throw Error('Invalid habit selection');
 const out=[{title:'Daily sun protection',body:'Use broad-spectrum water-resistant SPF 30+ on exposed skin, plus shade and protective clothing. Reapply according to the label, especially outdoors.',source:wellnessSources.skin,level:'Dermatology guidance'}];
 if(habits.sun)out.push({title:'Make outdoor protection routine',body:'Keep sunscreen near your morning essentials. Use a hat and seek shade; UV exposure can contribute to premature skin aging across skin tones.',source:wellnessSources.skin,level:'Dermatology guidance'});
 if(habits.dryness)out.push({title:'Gentle skin care',body:'Use a gentle cleanser and moisturizer that suits your skin. Avoid harsh scrubs, bleaching products and products that sting. Moisturizer may soften the appearance of fine lines, not reverse aging.',source:wellnessSources.skin,level:'Dermatology guidance'});
 if(habits.food)out.push({title:'Food variety for overall health',body:'Try beans or moi-moi, leafy vegetables such as ugu, oranges or pawpaw, whole grains, fish or other protein foods. Choose water over sugary drinks when appropriate. No particular food has been proved to reverse facial aging.',source:wellnessSources.diet,level:'General nutrition guidance'});
 if(habits.movement)out.push({title:'Whole-body movement',body:'Start with comfortable walking and build gradually toward 150 minutes of moderate activity weekly if suitable for you. Adapt to mobility and medical limitations. This supports health, not guaranteed wrinkle reduction.',source:wellnessSources.activity,level:'General activity guidance'});
 if(habits.sleep)out.push({title:'Rest and recovery',body:'Keep a regular sleep schedule and make time for relaxation. This is a general wellness habit, not a proven facial rejuvenation treatment.',source:wellnessSources.skin,level:'General wellness'});
 if(habits.smoking)out.push({title:'Tobacco avoidance',body:'Avoid tobacco smoke; if you smoke, ask a qualified health professional for cessation support. Smoking contributes to premature skin aging.',source:wellnessSources.skin,level:'Dermatology guidance'});
 if(habits.faceExercise)out.push({title:'Facial exercises: limited evidence',body:'Research is small and heterogeneous. Do not force repeated grimaces, use painful massage or expect a lifted jaw or erased wrinkles. Gentle relaxation is optional; stop if uncomfortable.',source:wellnessSources.face,level:'Uncertain evidence'});
 return out;
}
function frameQuality(rgba,w,h){
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<8||h<8||w>256||h>256||!rgba||rgba.length!==4*w*h)throw Error('Invalid image buffer');
 const lum=new Float64Array(w*h);let dark=0,bright=0,total=0,edge=0,count=0;
 for(let i=0;i<lum.length;i++){const j=i*4,y=.2126*rgba[j]+.7152*rgba[j+1]+.0722*rgba[j+2];if(!Number.isFinite(y)||y<0||y>255)throw Error('Invalid pixel');lum[i]=y;total+=y;if(y<20)dark++;if(y>245)bright++;}
 for(let y=1;y<h;y++)for(let x=1;x<w;x++){const i=y*w+x;edge+=Math.abs(lum[i]-lum[i-1])+Math.abs(lum[i]-lum[i-w]);count+=2;}
 return {mean:total/lum.length,dark:dark/lum.length,bright:bright/lum.length,detail:edge/count};
}
function captureFeedback(frames){
 if(!Array.isArray(frames)||frames.length!==2||frames.some(q=>!q||!['mean','dark','bright','detail'].every(k=>Number.isFinite(q[k]))))throw Error('Two image-quality samples required');
 const tips=[];
 if(frames.some(q=>q.mean<55||q.dark>.45))tips.push('Image is dark: face a soft, even light.');
 if(frames.some(q=>q.mean>215||q.bright>.30))tips.push('Image is very bright: reduce direct glare.');
 if(frames.some(q=>q.detail<2))tips.push('Low image detail: hold still and check camera focus.');
 if(Math.abs(frames[0].mean-frames[1].mean)>25)tips.push('Lighting changed between samples: keep the light steady.');
 return {ready:tips.length===0,tips,notice:'Experimental whole-frame image quality only; not face detection, skin texture, wrinkle severity, or biological age.'};
}

let wellnessStream=null,wellnessGeneration=0,wellnessTimers=[];
const habitKeys=['sun','dryness','food','movement','sleep','smoking','faceExercise'];
function wellnessStop(message='Camera off. No images retained.'){
 wellnessGeneration++;for(const t of wellnessTimers)clearTimeout(t);wellnessTimers=[];
 if(wellnessStream)for(const t of wellnessStream.getTracks())t.stop();
 wellnessStream=null;$('wellness-video').srcObject=null;$('wellness-start').disabled=false;$('wellness-scan').disabled=true;
 $('wellness-status').textContent=message;clear('wellness-feedback');
}
$('wellness-open').addEventListener('click',()=>document.querySelector('[data-view="wellness"]').click());
for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>{if(b.dataset.view!=='wellness')wellnessStop()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)wellnessStop()});window.addEventListener('pagehide',()=>wellnessStop());
$('wellness-consent').addEventListener('change',()=>{if(!$('wellness-consent').checked)wellnessStop()});
$('wellness-start').addEventListener('click',async()=>{
 wellnessStop();if(!$('wellness-consent').checked){$('wellness-status').textContent='Confirm camera consent first, or skip to the plan.';return}
 if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){$('wellness-status').textContent='Camera unavailable. Use HTTPS or localhost, or skip to the plan.';return}
 const run=wellnessGeneration;$('wellness-start').disabled=true;$('wellness-status').textContent='Requesting camera permission…';
 try{const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:640},height:{ideal:480}}});
 if(run!==wellnessGeneration||document.hidden||$('wellness').hidden||!$('wellness-consent').checked){stream.getTracks().forEach(t=>t.stop());return}
 wellnessStream=stream;$('wellness-video').srcObject=stream;await $('wellness-video').play();
 if(run!==wellnessGeneration)return;
 $('wellness-scan').disabled=false;$('wellness-status').textContent='Camera on. Center your face and begin the guided check.';
 }catch{if(run===wellnessGeneration)wellnessStop('Camera permission denied or unavailable. The habit plan still works.')}
});
$('wellness-stop').addEventListener('click',()=>wellnessStop());
function wellnessSample(){
 const v=$('wellness-video');if(v.readyState<2||!v.videoWidth||!v.videoHeight)throw Error('Camera not ready');
 const c=document.createElement('canvas');c.width=96;c.height=96;
 const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('No canvas');
 try{ctx.drawImage(v,0,0,96,96);const pixels=ctx.getImageData(0,0,96,96);try{return frameQuality(pixels.data,96,96)}finally{pixels.data.fill(0)}}finally{ctx.clearRect(0,0,96,96);c.width=0;c.height=0}
}
$('wellness-scan').addEventListener('click',()=>{
 if(!wellnessStream||!$('wellness-consent').checked)return;
 const run=wellnessGeneration;let first;
 $('wellness-scan').disabled=true;clear('wellness-feedback');$('wellness-status').textContent='Keep still in even light. First check in 4 seconds.';
 wellnessTimers.push(setTimeout(()=>{if(run!==wellnessGeneration)return;try{first=wellnessSample();$('wellness-status').textContent='First sample checked. Stay neutral for 4 more seconds.'}catch{wellnessStop('Could not sample camera. Retake or use the plan.')}},4000));
 wellnessTimers.push(setTimeout(()=>{if(run!==wellnessGeneration)return;try{const result=captureFeedback([first,wellnessSample()]);wellnessStop('Guided check finished. Camera stopped; no image saved.');$('wellness-feedback').append(item(result.ready?'Image-quality check passed':'Capture could be improved',result.ready?'Lighting and image detail passed experimental checks. This does not assess skin health.':result.tips.join(' '),result.notice));}catch{wellnessStop('Camera check could not finish. Retake or use the plan.')}},8000));
});
$('wellness-plan').addEventListener('click',()=>{clear('wellness-plan-output');const plan=wellnessPlan(Object.fromEntries(habitKeys.map(k=>[k,$('habit-'+k).checked])));for(const p of plan){const c=elem('article',undefined,'agent'),a=elem('a','Read evidence ↗');a.href=p.source;a.target='_blank';a.rel='noopener noreferrer';add(c,elem('h3',p.title),elem('p',p.body),elem('span',p.level,'tag'),elem('p'));c.lastChild.append(a);$('wellness-plan-output').append(c)}});
$('wellness-clear').addEventListener('click',()=>{wellnessStop();$('wellness-consent').checked=false;for(const k of habitKeys)$('habit-'+k).checked=false;clear('wellness-plan-output')});

// Educational program: self-selected regions, not inferred from camera imagery.
const longevityRegions=Object.freeze({
 forehead:['Forehead','Expression lines and changes in surface texture can occur here. Protect exposed skin from UV and avoid harsh products. A dermatologist can explain options if lines bother you.'],
 eyes:['Eye area','The eye area is delicate. Use comfortable sun protection and gentle skin care. Do not put irritating actives near the eyelids without professional guidance.'],
 cheeks:['Cheeks','Uneven tone, dryness and changes in facial fullness have different causes. Use gentle care and sun protection; a clinician can assess persistent pigment concerns.'],
 mouth:['Mouth and smile lines','Normal facial movement and changes in underlying support can affect folds. No exercise is proven to restore lost facial volume.'],
 jaw:['Jawline and neck','Skin and deeper tissues change with age. Protect exposed neck skin, and seek professional advice about cosmetic options; exercises cannot reliably lift tissues.']
});
const longevityHabits=Object.freeze(['am','pm','plants','movement','rest']);
const longevityLabels=Object.freeze({am:'Morning sun protection',pm:'Gentle evening skin care',plants:'Varied plant foods and protein',movement:'Movement or planned recovery',rest:'Consistent sleep and relaxation routine'});
function longevityRoutine(kind){
 if(!['normal','dry','oily'].includes(kind))throw Error('invalid skin preference');
 const details={normal:'Choose a comfortable gentle cleanser and moisturizer.',dry:'Prefer fragrance-free gentle cleansing and a richer moisturizer; avoid irritating exfoliants.',oily:'Choose gentle cleansing and a light, non-comedogenic moisturizer; avoid harsh scrubbing.'};
 return {am:[details[kind],'Finish with broad-spectrum, water-resistant SPF 30+; reapply as directed when outdoors.'],pm:['Remove sunscreen and makeup gently.',details[kind],'Ask a dermatologist about retinoids or other actives if interested. Avoid retinoids during pregnancy; discuss breastfeeding, sensitive skin and current treatments with a clinician.']};
}
function newLongevityLog(){return {schema:'healthos-habits-v1',days:Array.from({length:30},()=>Object.fromEntries(longevityHabits.map(k=>[k,false])))}}
function checkLongevityLog(x){
 if(!x||Object.keys(x).length!==2||x.schema!=='healthos-habits-v1'||!Array.isArray(x.days)||x.days.length!==30||x.days.some(d=>!d||Object.keys(d).length!==5||longevityHabits.some(k=>typeof d[k]!=='boolean')))throw Error('Invalid journal');
 return {schema:x.schema,days:x.days.map(d=>Object.fromEntries(longevityHabits.map(k=>[k,d[k]])))};
}
function longevityCounts(x){const d=checkLongevityLog(x).days;return {completed:d.reduce((n,r)=>n+longevityHabits.filter(k=>r[k]).length,0),total:150,days:d.filter(r=>longevityHabits.every(k=>r[k])).length}}

let longevityLog=newLongevityLog(),longevityDay=0,longevityImportSeq=0;
function renderLongevityRegion(){const r=longevityRegions[$('longevity-region').value];if(!r)return;clear('longevity-region-info');$('longevity-region-info').append(item(r[0],r[1],'Education only · self-selected area'))}
function renderLongevityRoutine(){clear('longevity-routine');const r=longevityRoutine($('longevity-skin').value);for(const [title,lines] of [['Morning',r.am],['Evening',r.pm]]){const a=elem('article',undefined,'agent');a.append(elem('h3',title));const ol=elem('ol');for(const l of lines)ol.append(elem('li',l));a.append(ol);$('longevity-routine').append(a)}}
function renderLongevity(){clear('longevity-day-grid');for(let i=0;i<30;i++){const b=elem('button',String(i+1),i===longevityDay?'primary':'');b.setAttribute('aria-pressed',i===longevityDay?'true':'false');if(longevityHabits.every(k=>longevityLog.days[i][k]))b.classList.add('habit-complete');b.setAttribute('aria-label','Day '+(i+1));b.addEventListener('click',()=>{longevityDay=i;renderLongevity()});$('longevity-day-grid').append(b)}$('longevity-day-title').textContent='Day '+(longevityDay+1);clear('longevity-checks');for(const k of longevityHabits){const label=elem('label',undefined,'wellness-check'),c=elem('input');c.type='checkbox';c.checked=longevityLog.days[longevityDay][k];c.addEventListener('change',()=>{longevityLog.days[longevityDay][k]=c.checked;const n=longevityCounts(longevityLog);$('longevity-tally').textContent=n.completed+' of '+n.total+' habit checks · '+n.days+' complete days · not a health score';$('longevity-bar').style.width=(100*n.completed/n.total)+'%';$('longevity-day-grid').children[longevityDay].classList.toggle('habit-complete',longevityHabits.every(k=>longevityLog.days[longevityDay][k]))});label.append(c,document.createTextNode(longevityLabels[k]));$('longevity-checks').append(label)}const n=longevityCounts(longevityLog);$('longevity-tally').textContent=n.completed+' of '+n.total+' habit checks · '+n.days+' complete days · not a health score';$('longevity-bar').style.width=(100*n.completed/n.total)+'%'}
$('longevity-region').addEventListener('change',renderLongevityRegion);$('longevity-skin').addEventListener('change',renderLongevityRoutine);
$('longevity-export').addEventListener('click',()=>clinicalExport('healthos-habit-journal.json',JSON.stringify(checkLongevityLog(longevityLog),null,2),'application/json'));
$('longevity-import').addEventListener('change',async()=>{const seq=++longevityImportSeq,file=$('longevity-import').files[0];if(!file)return;try{if(file.size>12000)throw Error('size');const next=checkLongevityLog(JSON.parse(await file.text()));if(seq!==longevityImportSeq)return;longevityLog=next;longevityDay=0;renderLongevity();$('longevity-status').textContent='Journal imported locally.'}catch{if(seq===longevityImportSeq)$('longevity-status').textContent='Invalid journal; current entries unchanged.'}finally{if(seq===longevityImportSeq)$('longevity-import').value=''}});
$('longevity-reset').addEventListener('click',()=>{longevityImportSeq++;$('longevity-import').value='';longevityLog=newLongevityLog();longevityDay=0;renderLongevity();$('longevity-status').textContent='Session journal cleared. Previously downloaded files are not deleted.'});
renderLongevityRegion();renderLongevityRoutine();renderLongevity();
