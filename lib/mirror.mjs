// Espelho opcional das análises no PocketBase (coleções "analises" e "reels").
// Os JSONs em data/ continuam sendo a fonte da verdade; se o PocketBase cair, o app segue normal.
// Ativa quando PB_URL, PB_ADMIN_EMAIL e PB_ADMIN_PASSWORD existem no ambiente.
import {createHash} from 'node:crypto';
const rid=s=>createHash('sha256').update(s).digest('hex').slice(0,15);
const LABELS=['topic','opening','mechanism','structure','evidence','emotion','specificity','cta'];
const FIELDS={
 analises:[
  {name:'lab_id',type:'text',required:true},{name:'criador',type:'text'},{name:'status',type:'text'},{name:'criado_em',type:'date'},
  {name:'limite',type:'number'},{name:'total_reels',type:'number'},{name:'concluidos',type:'number'},{name:'custo_apify_usd',type:'number'},
  {name:'erro',type:'text'},{name:'idioma',type:'text'},{name:'atualizado_em',type:'date'}],
 reels:[
  {name:'reel_id',type:'text',required:true},{name:'analise_lab_id',type:'text'},{name:'criador',type:'text'},{name:'url',type:'url'},
  {name:'legenda',type:'text'},{name:'publicado_em',type:'date'},{name:'plays',type:'number'},{name:'views',type:'number'},{name:'curtidas',type:'number'},
  {name:'comentarios',type:'number'},{name:'duracao_s',type:'number'},{name:'transcricao',type:'text'},{name:'abertura',type:'text'},
  ...LABELS.map(l=>({name:l,type:'text'})),{name:'confiancas',type:'json',maxSize:20000},{name:'trechos',type:'json',maxSize:200000},
  {name:'revisar',type:'bool'},{name:'excluido_motivo',type:'text'},{name:'modelo',type:'text'},{name:'custo_jev_usd',type:'number'},{name:'atualizado_em',type:'date'}]
};
export class Mirror{
 constructor({url,email,password,log=console.log}){this.url=url.replace(/\/$/,'');this.email=email;this.password=password;this.log=log;this.token=null;this.ready=null;this.timers=new Map();this.synced=new Map();this.failures=0;}
 static fromEnv(env=process.env){return env.PB_URL&&env.PB_ADMIN_EMAIL&&env.PB_ADMIN_PASSWORD?new Mirror({url:env.PB_URL,email:env.PB_ADMIN_EMAIL,password:env.PB_ADMIN_PASSWORD}):null;}
 async api(path,init={}){
  const headers={'Content-Type':'application/json',...(this.token?{Authorization:this.token}:{}),...(init.headers||{})};
  const r=await fetch(this.url+path,{...init,headers});
  if(r.status===204)return null;
  const j=await r.json().catch(()=>({}));
  if(r.status===401&&this.token&&!init._retried){this.token=null;await this.login();return this.api(path,{...init,_retried:true});}
  if(!r.ok){const e=new Error(j.message||`PocketBase ${r.status}`);e.status=r.status;e.data=j.data;throw e;}
  return j;
 }
 async login(){const j=await this.api('/api/collections/_superusers/auth-with-password',{method:'POST',headers:{Authorization:''},body:JSON.stringify({identity:this.email,password:this.password})});this.token=j.token;}
 async ensure(){
  if(this.ready)return this.ready;
  this.ready=(async()=>{
   for(let i=0;i<30;i++){try{await this.login();break;}catch(e){if(i===29)throw e;await new Promise(r=>setTimeout(r,2000));}}
   for(const [name,fields] of Object.entries(FIELDS)){
    let col=null;try{col=await this.api(`/api/collections/${name}`);}catch(e){if(e.status!==404)throw e;}
    if(!col){await this.api('/api/collections',{method:'POST',body:JSON.stringify({name,type:'base',fields,indexes:[`CREATE UNIQUE INDEX idx_${name}_key ON ${name} (${fields[0].name})`]})});this.log(`PocketBase: coleção ${name} criada`);}
    else{const have=new Set(col.fields.map(f=>f.name));const missing=fields.filter(f=>!have.has(f.name));if(missing.length){await this.api(`/api/collections/${name}`,{method:'PATCH',body:JSON.stringify({fields:[...col.fields,...missing]})});this.log(`PocketBase: ${missing.length} campo(s) adicionados em ${name}`);}}
   }
  })().catch(e=>{this.ready=null;throw e;});
  return this.ready;
 }
 async upsert(col,id,data){
  try{await this.api(`/api/collections/${col}/records/${id}`,{method:'PATCH',body:JSON.stringify(data)});}
  catch(e){if(e.status!==404)throw e;await this.api(`/api/collections/${col}/records`,{method:'POST',body:JSON.stringify({id,...data})});}
 }
 schedule(job){
  if(!job)return;
  clearTimeout(this.timers.get(job.id));
  this.timers.set(job.id,setTimeout(()=>{this.timers.delete(job.id);this.sync(job).catch(e=>{this.failures++;if(this.failures<=3||this.failures%50===0)this.log(`PocketBase: falha ao espelhar ${job.creator} (${e.message})`);});},4000));
 }
 async sync(job){
  await this.ensure();const now=new Date().toISOString();
  await this.upsert('analises',rid('job:'+job.id),{lab_id:job.id,criador:job.creator,status:job.status,criado_em:job.createdAt,limite:job.limit,total_reels:job.posts.length,concluidos:job.posts.filter(p=>p.analysis).length,custo_apify_usd:job.costs?.apify??null,erro:job.error||'',idioma:job.language||'',atualizado_em:now});
  const seen=this.synced.get(job.id)||new Map();let n=0;
  for(const p of job.posts){
   const sig=JSON.stringify([p.plays,p.views,p.likes,p.comments,Boolean(p.transcript),Boolean(p.analysis),p.excludedReason||'']);
   if(seen.get(p.id)===sig)continue;
   const a=p.analysis;const lab=k=>a?.labels?.[k]?.value||'';
   await this.upsert('reels',rid('reel:'+job.id+':'+p.id),{
    reel_id:p.id,analise_lab_id:job.id,criador:p.creator,url:p.url,legenda:(p.caption||'').slice(0,5000),publicado_em:p.publishedAt||null,
    plays:p.plays,views:p.views,curtidas:p.likes,comentarios:p.comments,duracao_s:p.duration,transcricao:p.transcript?.text||'',abertura:a?.opening||'',
    ...Object.fromEntries(LABELS.map(k=>[k,lab(k)])),
    confiancas:a?Object.fromEntries(LABELS.map(k=>[k,a.labels?.[k]?.confidence??null])):null,
    trechos:a?.anatomy?.map(s=>({papel:s.value,confianca:s.confidence,inicio:s.start,fim:s.end,texto:s.text}))||null,
    revisar:Boolean(a?.review),excluido_motivo:p.excludedReason||'',modelo:a?.model||'',custo_jev_usd:a?.costUsd??null,atualizado_em:now});
   seen.set(p.id,sig);n++;
  }
  this.synced.set(job.id,seen);this.failures=0;
  if(n)this.log(`PocketBase: ${job.creator} espelhado (${n} reel(s) atualizados)`);
 }
 syncAll(jobs){this.ensure().then(()=>this.log("PocketBase: coleções prontas")).catch(e=>this.log("PocketBase: indisponível no início ("+e.message+"); tento de novo ao salvar"));for(const j of jobs)this.schedule(j);}
}
