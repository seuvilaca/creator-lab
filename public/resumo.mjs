// Decode Botwise: "Resumo prático" de uma análise. Tudo calculado no navegador a partir dos dados já salvos.
// Não chama nenhuma API paga.
import {rotulo,LOCALE,traduz} from '/i18n.mjs';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n==null?'—':new Intl.NumberFormat(LOCALE,{notation:'compact',maximumFractionDigits:1}).format(n);
const dec=(n,d=1)=>n==null?'—':n.toFixed(d).replace('.',',');
const vezes=r=>`${dec(r,1)}×`;
const median=a=>{a=a.filter(Number.isFinite).sort((x,y)=>x-y);const n=a.length;return n?(a[Math.floor((n-1)/2)]+a[Math.ceil((n-1)/2)])/2:null;};
const safe=u=>{try{const x=new URL(u);return x.protocol==='https:'?x.href:'';}catch{return '';}};

// Frases legíveis para cada categoria, por classificação.
const FRASE={
 opening:{question:'Abrir com uma pergunta',instruction:'Abrir com uma ordem direta ("Faça...", "Pare de...")',claim:'Abrir com uma afirmação',story:'Abrir contando um acontecimento',dialogue:'Abrir com um diálogo'},
 mechanism:{contradiction:'Gancho que contraria uma crença comum',curiosity:'Gancho de curiosidade (segura a resposta)',result:'Gancho prometendo um resultado',mistake:'Gancho alertando sobre um erro',recognition:'Gancho de identificação ("sabe quando...")',story:'Gancho de história sem final revelado',direct:'Gancho direto ao ponto'},
 structure:{story:'Roteiro em forma de história',steps:'Roteiro em passos',problem_solution:'Roteiro problema → solução',explanation:'Roteiro explicativo',comparison:'Roteiro comparando opções',opinion:'Roteiro de opinião',qa:'Responder uma pergunta do público'},
 topic:{business:'Tema negócios',money:'Tema dinheiro',marketing:'Tema marketing',mindset:'Tema mentalidade',habits:'Tema hábitos',relationships:'Tema relacionamentos',health:'Tema saúde',technology:'Tema tecnologia',other:'Temas fora das categorias'},
 evidence:{example:'Prova com exemplo prático',personal:'Prova com experiência pessoal',numbers:'Prova com números',source:'Prova citando fonte ou estudo',reasoning:'Sustentar só com raciocínio',none:'Sem prova nenhuma'},
 emotion:{aspiration:'Tom de aspiração (futuro melhor)',concern:'Tom de preocupação ou risco',relief:'Tom de alívio e acolhimento',surprise:'Tom de surpresa',amusement:'Tom de humor',neutral:'Tom neutro, informativo'},
 specificity:{none:'Sem conselho prático',principle:'Conselho em forma de princípio',action:'Uma ação concreta',sequence:'Várias ações em sequência'},
 cta:{none:'Sem pedido de ação no fim',follow:'Pedir para seguir',engage:'Pedir curtida, salvamento ou compartilhamento',comment:'Pedir comentário',visit:'Mandar para um link',buy:'Pedir compra',multiple:'Vários pedidos de ação'},
 duracao:{a:'Vídeos com menos de 30 segundos',b:'Vídeos de 30 a 60 segundos',c:'Vídeos de 60 a 90 segundos',d:'Vídeos com mais de 90 segundos'}
};
const ABERTURA={contradiction:'Contrarie uma crença comum do seu público numa frase só.',curiosity:'Abra uma lacuna: prometa uma resposta e só entregue no meio do vídeo.',result:'Prometa um resultado concreto logo na primeira frase.',mistake:'Aponte um erro que a pessoa provavelmente está cometendo.',recognition:'Descreva uma situação em que a pessoa se reconhece.',story:'Comece no meio de um acontecimento, sem contar o final.',direct:'Vá direto ao conselho, em até 8 palavras.'};
const MEIO={steps:'Liste de 3 a 5 ações curtas, uma por frase, sem explicar demais.',story:'Conte o acontecimento em ordem e feche com a lição.',problem_solution:'Mostre o problema rápido e gaste o tempo na solução.',explanation:'Explique como funciona usando um exemplo simples.',comparison:'Compare duas opções e diga qual escolher.',opinion:'Defenda seu ponto de vista com 2 ou 3 argumentos.',qa:'Leia uma pergunta real do público e responda com a sua experiência.'};
const NOME={steps:'em passos',story:'de história',problem_solution:'problema → solução',explanation:'explicativo',comparison:'comparativo',opinion:'de opinião',qa:'de pergunta e resposta'};
const DURACAO={a:'menos de 30 segundos',b:'de 30 a 60 segundos',c:'de 60 a 90 segundos',d:'mais de 90 segundos'};
const DIMS=['opening','mechanism','structure','topic','evidence','emotion','specificity','cta','duracao'];

const forca=n=>n>=15?['forte','Sinal forte']:n>=8?['medio','Sinal médio']:['pista','Só uma pista'];
const bucket=d=>d==null?null:d<30?'a':d<60?'b':d<90?'c':'d';

function calcular(job){
 const metric=job.posts.some(p=>p.plays>0)?'plays':'views';
 const nomeMetrica=metric==='plays'?'reproduções':'visualizações';
 const elegiveis=job.posts.filter(p=>p.analysis&&!p.excludedReason&&p[metric]>0);
 const idade=p=>p.publishedAt?(Date.now()-Date.parse(p.publishedAt))/864e5:0;
 const maduros=elegiveis.filter(p=>idade(p)>=7);
 const base=maduros.length>=30?maduros:elegiveis;
 const min=base.length>=60?5:3;
 const M=median(base.map(p=>p[metric])),L=median(base.map(p=>p.likes!=null?p.likes/p[metric]*1000:NaN)),C=median(base.map(p=>p.comments!=null?p.comments/p[metric]*1000:NaN));
 const valor=(p,d)=>d==='duracao'?bucket(p.duration):p.analysis.labels[d]?.value;
 const stats=(lista)=>({n:lista.length,med:median(lista.map(p=>p[metric])),like:median(lista.map(p=>p.likes!=null?p.likes/p[metric]*1000:NaN)),com:median(lista.map(p=>p.comments!=null?p.comments/p[metric]*1000:NaN)),posts:lista});
 const grupos=[];
 for(const d of DIMS){const g={};for(const p of base){const v=valor(p,d);if(!v||v==='unclear')continue;(g[v]=g[v]||[]).push(p);}
  for(const [v,lista] of Object.entries(g))if(lista.length>=min){const s=stats(lista);grupos.push({dim:d,cat:v,...s,ratio:s.med/M,frase:FRASE[d]?.[v]||rotulo(v)});}}
 const combos=[];{const g={};for(const p of base){const a=p.analysis.labels.mechanism?.value,b=p.analysis.labels.structure?.value;if(!a||!b||a==='unclear'||b==='unclear')continue;(g[a+'|'+b]=g[a+'|'+b]||[]).push(p);}
  for(const [k,lista] of Object.entries(g))if(lista.length>=min){const [mec,est]=k.split('|');const s=stats(lista);combos.push({mec,est,...s,ratio:s.med/M});}}
 const acima=grupos.filter(g=>g.ratio>=1.15).sort((a,b)=>b.ratio-a.ratio).slice(0,8);
 const abaixo=grupos.filter(g=>g.ratio<=0.85).sort((a,b)=>a.ratio-b.ratio).slice(0,7);
 const conversa=grupos.filter(g=>g.com!=null&&C>0&&g.com>=2*C).sort((a,b)=>b.com-a.com).slice(0,3);
 const dicaConversa=conversa.find(g=>g.dim==='cta'&&g.cat==='comment')||conversa.find(g=>!(g.dim==='cta'&&g.cat==='multiple'));
 const melhor=d=>grupos.filter(g=>g.dim===d).sort((a,b)=>b.ratio-a.ratio)[0];
 const abertura=melhor('opening'),duracao=melhor('duracao'),semCta=grupos.find(g=>g.dim==='cta'&&g.cat==='none');
 let receitas=combos.filter(c=>c.ratio>=1.1).map(c=>({...c,score:c.ratio*Math.min(1,c.n/10)})).sort((a,b)=>b.score-a.score).slice(0,3);
 if(!receitas.length){const m=melhor('mechanism'),e=melhor('structure');if(m&&e){const lista=base.filter(p=>p.analysis.labels.mechanism?.value===m.cat||p.analysis.labels.structure?.value===e.cat);receitas=[{mec:m.cat,est:e.cat,...stats(lista),ratio:Math.max(m.ratio,e.ratio),aproximada:true}];}}
 const datas=base.map(p=>p.publishedAt).filter(Boolean).sort();
 return {metric,nomeMetrica,dicaConversa,stats,median,base,M,L,C,min,acima,abaixo,conversa,abertura,duracao,semCta,receitas,datas,usouIdade:base===maduros,total:job.posts.length,excluidos:job.posts.filter(p=>p.excludedReason).length,revisar:base.filter(p=>p.analysis.review).length};
}

function linhaGrupo(g,r){const [cls,txt]=forca(g.n);return `<tr><td>${esc(g.frase)}</td><td>${g.n}</td><td><b class="${g.ratio>=1?'sobe':'desce'}">${vezes(g.ratio)}</b> <small>${fmt(g.med)}</small></td><td><span class="forca ${cls}">${txt}</span></td></tr>`;}
const abrir=p=>{const t=(p.analysis?.opening||p.transcript?.text||'').replace(/\s+/g,' ').trim();return t.length>150?t.slice(0,147)+'…':t;};

function render(job){
 const r=calcular(job);
 document.title=`Resumo prático · @${job.creator} · Decode Botwise`;
 if(r.base.length<10){$('#conteudo').innerHTML=`<section><h2>Poucos Reels para um resumo</h2><p>Esta análise tem só ${r.base.length} Reels com fala e métricas. Para o resumo fazer sentido, rode uma análise com pelo menos 50 Reels.</p></section>`;return;}
 const periodo=r.datas.length?`${new Date(r.datas[0]).toLocaleDateString(LOCALE)} a ${new Date(r.datas.at(-1)).toLocaleDateString(LOCALE)}`:'';
 let h=`<div class="hero"><span class="selo">RESUMO PRÁTICO</span><h1>O que funciona no <span>@${esc(job.creator)}</span></h1>
 <p>${r.base.length} Reels com fala analisados${periodo?`, publicados de ${periodo}`:''}. A referência é a mediana de <b>${fmt(r.M)} ${r.nomeMetrica}</b> por Reel. "2×" quer dizer o dobro do alcance típico.</p></div>`;

 // Receitas
 h+=`<section><div class="num">01</div><h2>Receitas prontas para gravar</h2><p class="lead">As combinações de gancho e roteiro que tiveram mais alcance. Use a estrutura com o <b>seu</b> assunto e a <b>sua</b> experiência.</p>`;
 r.receitas.forEach((c,i)=>{const [cls,txt]=forca(c.n);const ex=[...c.posts].sort((a,b)=>b[r.metric]-a[r.metric]).slice(0,3);
  const linhas=[];
  const melhorDentro=(fn)=>{const g={};for(const p of c.posts){const v=fn(p);if(!v||v==='unclear')continue;(g[v]=g[v]||[]).push(p);}return Object.entries(g).filter(([,l])=>l.length>=2).map(([v,l])=>[v,l.length,median(l.map(p=>p[r.metric]))]).sort((a,b)=>b[2]-a[2])[0];};
  const ab=melhorDentro(p=>p.analysis.labels.opening?.value),du=melhorDentro(p=>bucket(p.duration));
  if(ab)linhas.push(`<b>Primeira frase:</b> ${esc(FRASE.opening[ab[0]]||rotulo(ab[0]))}. É o formato dos Reels desta receita com mais alcance (${ab[1]} vídeos).`);
  linhas.push(`<b>Abertura:</b> ${esc(ABERTURA[c.mec]||rotulo(c.mec))}`);
  linhas.push(`<b>Meio:</b> ${esc(MEIO[c.est]||rotulo(c.est))}`);
  linhas.push(`<b>Fim:</b> ${r.semCta&&r.semCta.ratio>=1?'feche com uma frase de efeito, sem pedir nada. Os vídeos sem pedido de ação tiveram mais alcance.':'feche com a lição numa frase.'}`);
  if(du)linhas.push(`<b>Duração:</b> ${DURACAO[du[0]]}, a faixa com mais alcance dentro desta receita (${du[1]} vídeos).`);else if(r.duracao)linhas.push(`<b>Duração:</b> ${DURACAO[r.duracao.cat]}, a faixa com mais alcance no perfil.`);
  h+=`<div class="receita"><div class="rec-topo"><span class="rec-num">Receita ${i+1}</span><span class="forca ${cls}">${txt} · ${c.n} Reels</span></div>
   <h3>${esc(rotulo(c.mec))} + roteiro ${esc(NOME[c.est]||rotulo(c.est))}</h3><p class="rec-res">Alcance de <b>${vezes(c.ratio)}</b> a mediana (${fmt(c.med)} ${r.nomeMetrica} por Reel)${c.aproximada?'. Combinação aproximada, com poucos Reels.':'.'}</p>
   <ul class="passos-rec">${linhas.map(l=>`<li>${l}</li>`).join('')}</ul>
   <details><summary>Ver os 3 Reels de maior alcance desta receita</summary>${ex.map(p=>`<div class="exemplo"><b>${fmt(p[r.metric])}</b><span>“${esc(abrir(p))}”</span>${safe(p.url)?`<a href="${esc(safe(p.url))}" target="_blank" rel="noopener noreferrer">Assistir ↗</a>`:''}</div>`).join('')}</details></div>`;});
 h+=`</section>`;

 // Acima / abaixo
 h+=`<section><div class="num">02</div><h2>O que mais deu alcance</h2>${r.acima.length?`<div class="tabela"><table><thead><tr><th>Padrão</th><th>Reels</th><th>Alcance</th><th>Confiança</th></tr></thead><tbody>${r.acima.map(linhaGrupo).join('')}</tbody></table></div>`:'<p>Nenhum padrão ficou bem acima da mediana. O alcance deste perfil é parecido em todos os formatos.</p>'}</section>`;
 h+=`<section><div class="num">03</div><h2>O que evitar</h2>${r.abaixo.length?`<div class="tabela"><table><thead><tr><th>Padrão</th><th>Reels</th><th>Alcance</th><th>Confiança</th></tr></thead><tbody>${r.abaixo.map(linhaGrupo).join('')}</tbody></table></div>`:'<p>Nenhum padrão ficou bem abaixo da mediana.</p>'}</section>`;

 // Conversa
 if(r.conversa.length)h+=`<section><div class="num">04</div><h2>Quando o objetivo é conversa</h2><p>Estes padrões geram muito mais comentários que o normal (${dec(r.C,2)} por mil ${r.nomeMetrica}), mesmo quando o alcance não é o maior:</p><ul class="lista">${r.conversa.map(g=>`<li><b>${esc(g.frase)}:</b> ${dec(g.com/r.C,1)} vezes mais comentários (${g.n} Reels).</li>`).join('')}</ul></section>`;

 // Plano
 const r1=r.receitas[0],r2=r.receitas[1];
 h+=`<section><div class="num">${r.conversa.length?'05':'04'}</div><h2>Plano para esta semana</h2><ol class="plano">
  ${r1?`<li>Escolha um assunto que você domina e grave <b>3 vídeos na Receita 1</b> (${esc(rotulo(r1.mec))} + roteiro ${esc(NOME[r1.est]||rotulo(r1.est))}).</li>`:''}
  ${r2?`<li>Grave <b>1 vídeo na Receita 2</b> (${esc(rotulo(r2.mec))} + roteiro ${esc(NOME[r2.est]||rotulo(r2.est))}), para comparar.</li>`:''}
  ${r.dicaConversa?`<li>Se quiser comentários, use em <b>1 vídeo</b> o padrão "${esc(r.dicaConversa.frase.toLowerCase())}".</li>`:''}
  <li>Antes de gravar, assista aos exemplos de cada receita (botão "Ver os 3 Reels") para pegar o ritmo.</li>
  <li>Daqui a 2 ou 3 semanas, rode o Decode <b>no seu próprio perfil</b> e veja se a receita funcionou com o seu público.</li></ol></section>`;

 // Cuidados
 h+=`<section class="cuidados"><h2>Como ler este resumo</h2><ul class="lista">
  <li><b>Confiança:</b> "Sinal forte" tem 15 Reels ou mais. "Só uma pista" tem menos de 8 e pode ser coincidência.</li>
  <li><b>Associação, não causa:</b> o resumo mostra o que andou junto com o alcance. O assunto do momento, a edição e o horário também influenciam.</li>
  <li><b>Base usada:</b> ${r.usouIdade?'só Reels com 7 dias ou mais de publicados, para não comparar vídeos que ainda estão crescendo':'todos os Reels com fala, porque havia poucos com mais de 7 dias'}. ${r.excluidos?`${r.excluidos} Reels sem fala ficaram de fora.`:''}</li>
  ${r.revisar>r.base.length/2?`<li><b>Rótulos para conferir:</b> o Jev teve pouca certeza em ${r.revisar} dos ${r.base.length} Reels, algo comum em português. Antes de seguir uma receita, leia 2 ou 3 roteiros dela no painel.</li>`:''}
 </ul></section>`;
 $('#conteudo').innerHTML=h;
}

async function iniciar(){
 try{
  const params=new URLSearchParams(location.search);let id=params.get('run');
  const boot=await (await fetch('/api/bootstrap')).json();
  const runs=boot.runs.filter(x=>x.completed>0);
  $('#escolha').innerHTML=runs.map(x=>`<option value="${esc(x.id)}">@${esc(x.creator)} · ${x.completed} Reels classificados</option>`).join('');
  if(!id||!runs.some(x=>x.id===id))id=runs[0]?.id;
  if(!id){$('#conteudo').innerHTML='<section><h2>Nenhuma análise pronta</h2><p>Rode uma análise no painel primeiro.</p></section>';return;}
  $('#escolha').value=id;
  const r=await fetch('/api/runs/'+encodeURIComponent(id));const job=await r.json();if(!r.ok)throw new Error(job.error||'Falha ao carregar');
  render(job);
 }catch(e){$('#conteudo').innerHTML=`<section><h2>Não foi possível montar o resumo</h2><p>${esc(traduz(e.message))}</p></section>`;}
}
$('#escolha').onchange=e=>{history.replaceState(null,'','/resumo?run='+encodeURIComponent(e.target.value));iniciar();};
$('#imprimir').onclick=()=>print();
window.addEventListener('beforeprint',()=>document.querySelectorAll('details').forEach(d=>d.open=true));
iniciar();
