'use strict';
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defaults=()=>({step:0,lang:'es',teacher:false,vote:null,case:'loma',selected:[],twist:false,reflection:'',science:'',team:'',remaining:180,running:false,soil:'rock',design:'good',labRuns:0,visited:['loma']});
let state=defaults(), storageAvailable=true;
try{
 const x=JSON.parse(localStorage.getItem('seismic-mission-v1')||'null');
 if(x&&typeof x==='object'){
  state.step=Number.isInteger(x.step)&&x.step>=0&&x.step<7?x.step:0;
  state.lang=x.lang==='en'?'en':'es';state.teacher=x.teacher===true;
  state.vote=['a','b','c'].includes(x.vote)?x.vote:null;
  state.case=x.case==='christchurch'?'christchurch':'loma';
  for(const k of ['team','science','reflection'])state[k]=typeof x[k]==='string'?x[k].slice(0,k==='team'?60:1600):'';
  state.selected=Array.isArray(x.selected)?[...new Set(x.selected)].filter(id=>MISSION.options.some(o=>o.id===id)):[];
  if(cost(state.selected)>10)state.selected=[];
  state.twist=x.twist===true;state.remaining=Number.isInteger(x.remaining)&&x.remaining>=0&&x.remaining<=180?x.remaining:180;
  state.soil=['rock','soft','wet'].includes(x.soil)?x.soil:'rock';state.design=x.design==='weak'?'weak':'good';
  state.labRuns=Number.isInteger(x.labRuns)&&x.labRuns>=0?x.labRuns:0;
  state.visited=Array.isArray(x.visited)?x.visited.filter(v=>['loma','christchurch'].includes(v)):['loma'];
 }
}catch{storageAvailable=false}
function tr(es,en){return state.lang==='es'?es:en}
function t(pair){return pair[state.lang==='es'?0:1]}
const box=(c,x)=>'<div class="'+c+'">'+x+'</div>', p=(x,c='')=>'<p class="'+c+'">'+x+'</p>', h=x=>'<h3>'+x+'</h3>';
function btn(label,action,cls=''){return '<button class="'+cls+'" onclick="'+action+'">'+label+'</button>'}
function detail(title,body){return '<details><summary>'+title+'</summary>'+p(body)+'</details>'}
function head(label,title,body=''){return box('eyebrow',label)+'<h2 tabindex="-1" id="pageTitle">'+title+'</h2>'+p(body,'lede')}
function cost(ids){return MISSION.options.filter(o=>ids.includes(o.id)).reduce((n,o)=>n+o.cost,0)}
const total=()=>cost(state.selected);
function save(){try{localStorage.setItem('seismic-mission-v1',JSON.stringify(state))}catch{storageAvailable=false}}
let toastTimeout,labTimeout,modalFocus;
function toast(text){clearTimeout(toastTimeout);$('#toast').textContent=text;$('#toast').classList.remove('hidden');toastTimeout=setTimeout(()=>$('#toast').classList.add('hidden'),3500)}
function go(n){state.step=Math.max(0,Math.min(6,n));save();render();$('#pageTitle')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
function footer(){return '<div class="footer"><button onclick="go('+(state.step-1)+')" '+(state.step===0?'disabled':'')+'>'+tr('Anterior','Back')+'</button><span>'+(state.step+1)+' / 7 · '+tr('Decisiones compartidas','Shared decisions')+'</span><button class="primary" onclick="go('+(state.step+1)+')" '+(state.step===6?'disabled':'')+'>'+tr('Continuar','Continue')+' →</button></div>'}
function teacher(){return state.teacher?'<aside class="teacher">'+h(tr('Para vos, que coordinás','Presenter prompt'))+p(t(MISSION.prompts[state.step]))+'</aside>':''}
function render(){
 clearTimeout(labTimeout);document.documentElement.lang=state.lang;
 $('#lang').textContent=state.lang==='es'?'EN':'ES';
 $('#teacher').textContent=tr(state.teacher?'Ocultar guía':'Modo docente',state.teacher?'Hide guide':'Presenter mode');
 $('#teacher').setAttribute('aria-pressed',String(state.teacher));$('#sources').textContent=tr('Fuentes','Sources');
 $('#nav').innerHTML=MISSION.labels.map((label,i)=>'<button class="'+(i===state.step?'active':'')+'" onclick="go('+i+')" '+(i===state.step?'aria-current="step"':'')+'><small>0'+(i+1)+'</small>'+t(label)+'</button>').join('')+box('navfoot','CLASSROOM EDITION<br>25–35 MIN<br>'+tr('Un proyector.<br>Todo el curso decide.','One projector.<br>The whole class decides.'));
 $('#progress').style.width=(state.step+1)/7*100+'%';
 $('#main').innerHTML=pages[state.step]()+teacher()+footer();bind();
}
function choiceList(){return MISSION.options.map(o=>'<label class="choice"><input type="checkbox" value="'+o.id+'" '+(state.selected.includes(o.id)?'checked':'')+' onchange="choose(\''+o.id+'\',this.checked)"><div><b>'+o.id+' · '+t(o.name)+'</b><small>'+t(o.desc)+'</small></div><span class="cost">'+o.cost+'</span></label>').join('')}
function choose(id,on){
 const item=MISSION.options.find(o=>o.id===id);if(!item)return;
 if(on&&!state.selected.includes(id)&&total()+item.cost>10){toast(tr('No alcanza el presupuesto. Revisen una elección.','Over budget. Reconsider a choice.'));render();return}
 state.selected=on?[...new Set([...state.selected,id])]:state.selected.filter(x=>x!==id);save();render();
}
function vote(v){state.vote=v;save();render()}
function setCase(id){state.case=id;state.visited=[...new Set([...state.visited,id])];save();render()}
function reveal(){state.twist=true;save();render()}
function clock(){return Math.floor(state.remaining/60)+':'+String(state.remaining%60).padStart(2,'0')}
function timerToggle(){if(state.remaining===0)state.remaining=180;state.running=!state.running;save();render()}
function timerReset(){state.remaining=180;state.running=false;save();render()}
setInterval(()=>{if(state.running&&state.remaining>0){state.remaining--;if($('#clock'))$('#clock').textContent=clock();if(state.remaining===0){state.running=false;toast(tr('Terminó el tiempo. Escuchemos los planes.','Time is up. Let’s hear the plans.'));render()}save()}},1000);
function risks(){
 let list=[];
 if(!state.selected.includes('A'))list.push(tr('La escuela sigue sin refuerzo estructural.','The school remains structurally unstrengthened.'));
 if(!state.selected.includes('B'))list.push(tr('Las viviendas conservan vulnerabilidades estructurales.','The homes retain structural vulnerabilities.'));
 if(!state.selected.includes('C'))list.push(tr('El riesgo del terreno y los cimientos de las viviendas queda pendiente.','Housing ground and foundation risks remain unaddressed.'));
 if(!state.selected.includes('D'))list.push(tr('El plan no financia preparación comunitaria.','The plan does not fund community preparedness.'));
 list.push(tr('Ninguna intervención garantiza seguridad total.','No intervention guarantees complete safety.'));
 return list;
}
function bind(){
 if($('#soil')){$('#soil').value=state.soil;$('#design').value=state.design;$('#soil').onchange=e=>{state.soil=e.target.value;save();render()};$('#design').onchange=e=>{state.design=e.target.value;save();render()};$('#run').onclick=lab;}
 for(const key of ['team','science','reflection'])if($('#'+key))$('#'+key).oninput=e=>{state[key]=e.target.value;save()};
}
function reportText(){return 'SEISMIC MISSION\n'+tr('Equipo','Team')+': '+(state.team||'-')+'\n'+new Date().toLocaleDateString()+'\n\n'+tr('Plan','Plan')+': '+(state.selected.join(' + ')||'-')+'\n'+tr('Costo ficticio','Fictional cost')+': '+total()+'/10\n\n'+tr('Razón científica','Scientific reason')+':\n'+(state.science||'-')+'\n\n'+tr('Razón social y riesgo pendiente','Social reasoning and remaining risk')+':\n'+(state.reflection||'-')+'\n\n'+risks().join('\n')+'\n\n'+tr('Conclusión: suelo y construcción influyen en los daños. También importan distancia, profundidad e intensidad local.','Conclusion: ground and construction influence damage. Distance, depth and local intensity matter too.')+'\n\nSOURCES\n'+MISSION.sources.map(x=>x.join('\n')).join('\n\n')}
function downloadReport(){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([reportText()],{type:'text/plain;charset=utf-8'}));a.href=u;a.download='seismic-mission-report.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)}
function resetMission(){if(confirm(tr('¿Borrar las decisiones y empezar otra clase?','Clear decisions and start a new class?'))){const lang=state.lang,teacher=state.teacher;state={...defaults(),lang,teacher};save();go(0)}}
function modal(html){
 if($('#modal').classList.contains('hidden'))modalFocus=document.activeElement;
 $('#modalBody').innerHTML=html;$('#modal').classList.remove('hidden');
 document.querySelector('header').inert=true;document.querySelector('.shell').inert=true;$('#close').focus();
}
function closeModal(){$('#modal').classList.add('hidden');document.querySelector('header').inert=false;document.querySelector('.shell').inert=false;if(modalFocus?.isConnected)modalFocus.focus()}
function openPaper(){modal('<h2>'+tr('Investigación original','Original research')+'</h2>'+p(tr('Texto de trabajo en inglés. Las cifras del borrador no reciben validación adicional por aparecer aquí. La misión principal utiliza las conclusiones cualitativas.','English working paper. Inclusion here does not independently validate the draft’s figures. The main mission uses the qualitative conclusions.'))+'<pre id="paperText"></pre>');$('#paperText').textContent=window.RESEARCH_TEXT||tr('No se pudo cargar el texto.','The text could not be loaded.')}
$('#close').onclick=closeModal;
$('#modal').addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(e.key==='Tab'){const items=[...$('#modal').querySelectorAll('button,a,[tabindex="0"]')];if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus()}}});
$('#sources').onclick=()=>modal('<h2>'+tr('La evidencia detrás de la misión','Evidence behind the mission')+'</h2>'+p(tr('Los expedientes son reales. La ciudad del desafío y los créditos son ficticios. Las animaciones son explicativas y no predicen daños.','The case studies are real. The challenge town and credits are fictional. Animations are explanatory and do not predict damage.'))+MISSION.sources.map(([name,url])=>p('<a href="'+url+'" target="_blank" rel="noopener">'+name+' ↗</a>')).join('')+btn(tr('Leer el trabajo completo','Read the complete paper'),'openPaper()'));
$('#lang').onclick=()=>{state.lang=state.lang==='es'?'en':'es';save();render()};
$('#teacher').onclick=()=>{state.teacher=!state.teacher;save();render()};
$('#full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{toast(tr('Este navegador no permite pantalla completa aquí.','Fullscreen is unavailable here.'))}};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT','BUTTON','SUMMARY'].includes(e.target.tagName)||!$('#modal').classList.contains('hidden'))return;if(e.key==='ArrowRight')go(state.step+1);if(e.key==='ArrowLeft')go(state.step-1)});

