// Public directory and deterministic, fictional-only manual handoffs. No network calls.
const ecosystem=Object.freeze([
 {id:"swarm",name:"MABRIG SwarmLab",url:"https://swarmlab.mabrigkorie.org/",purpose:"Review a bounded software research mission; owner-only engineering pilot is not a clinical service.",kind:"brief",instruction:"Copy the reviewed software-only brief into an authorized SwarmLab session. Never use patient information."},
 {id:"scholar",name:"MABRIG Scholar",url:"https://scholar.mabrigkorie.org/research-agent",purpose:"Research evidence quality and DOI-backed literature discovery.",kind:"brief",instruction:"Copy the generic research question into Research Agent; inspect original studies and limitations."},
 {id:"flora",name:"NigerFlora BioSciences",url:"https://nigerflora.mabrigkorie.org/",purpose:"Explore medicinal plant research and experimental evidence.",kind:"brief",instruction:"Use the generic evidence-review brief as a research question, not a treatment recommendation."},
 {id:"statlab",name:"MABRIG StatLab",url:"https://www.mabrigkorie.org/projects",purpose:"Import a fictional documentation-actions CSV for descriptive analysis.",kind:"csv",instruction:"Open StatLab from the MABRIG project directory. Import the downloaded CSV into Data View. Rows are actions, not people; no clinical or population inference."},
 {id:"university",name:"AI University HQ",url:"https://aiuniversityhq.uk/",purpose:"Practice evidence literacy and responsible health software design.",kind:"brief",instruction:"Use the learning exercise in your own authorized learning workspace; no automatic enrollment."},
 {id:"buildrx",name:"BuildRx",url:"https://www.buildrx.online/",purpose:"Develop and test privacy-first software components.",kind:"brief",instruction:"Review and paste the software specification into a new project. No automatic code execution or publishing."},
 {id:"grants",name:"AfrigrantPipeline",url:"https://www.afrigrantpipeline.com/",purpose:"Explore funding for independent health informatics validation.",kind:"brief",instruction:"Use the research planning brief to guide funding searches; no application is automatically submitted."}
].map(Object.freeze));
const handoffText=Object.freeze({
 swarm:"Design a synthetic-only health evidence workflow that verifies record provenance, preserves unresolved documentation actions and rejects real patient input. Return a test plan and evidence traceability requirements. Do not produce diagnosis, triage, treatment or clinical predictions. No automatic deployment or paid calls.",
 scholar:"Research methods for provenance-aware health documentation and care coordination in resource-constrained settings. Retrieve DOI-linked sources, distinguish study designs and limitations, and flag contradictions. Do not infer individual medical advice.",
 flora:"Review methods for identifying botanical species, extracting published experimental evidence, assessing toxicity and documented drug interactions. Separate preclinical from human evidence. Do not recommend herbs, doses or treatment.",
 university:"Learning exercise: design a fictional care documentation timeline, classify source provenance, preserve contradictory evidence, and explain why reported completion is not clinical verification. Discuss consent and privacy.",
 buildrx:"Build a standalone synthetic-only health evidence component. Require an allowlisted fictional case ID, deterministic traceable results, explicit export, no patient input, no background network access, and automated negative tests. Do not deploy automatically.",
 grants:"Explore funding for usability, privacy, safety and independent validation of a synthetic-only health evidence coordination prototype in resource-constrained settings. Identify eligibility and evidence requirements without submitting applications."
});
function ecosystemHandoff(target,caseId,reported=[]){
 const t=ecosystem.find(x=>x.id===target);if(!t)throw Error("Unknown integration");
 const r=compileEvidence(caseId,reported,false); // validate allowed case and action IDs even for generic briefs
 if(t.kind==="csv"){
  const header="synthetic_only,case_id,action_id,source_day,reported_complete";
  const rows=r.actions.map(a=>[1,r.caseId,a.id,r.records.find(x=>x.id===a.record).day,a.status==="reported_complete"?1:0].join(","));
  return {filename:"healthos-SYNTHETIC-actions.csv",mime:"text/csv",content:[header,...rows].join("\r\n")+"\r\n"};
 }
 return {filename:"healthos-"+target+"-brief.txt",mime:"text/plain",content:"MABRIG HealthOS — generic research/education brief (no patient information)\n\n"+handoffText[target]+"\n\nHuman review required; not clinical advice.\n"};
}
