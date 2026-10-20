/* Pure state, validation and reporting logic. No DOM, storage or network access. */
'use strict';
window.SM = window.SM || {};
SM.core = (() => {
  const C = SM.content, VERSION = 3, KEY = 'seismic-mission-v3', BACKUP = KEY + '-previous';
  const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  const text = (v, n = 1200) => typeof v === 'string' ? v.slice(0, n) : '';
  const int = (v, lo = 0, hi = 500) => Number.isFinite(Number(v)) ? Math.max(lo, Math.min(hi, Math.floor(Number(v)))) : lo;
  const sum = a => a.reduce((x, y) => x + y, 0);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const localDate = (d = new Date()) => [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  const validDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v;
  const iso = v => typeof v === 'string' && !isNaN(Date.parse(v)) ? new Date(v).toISOString() : '';
  const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,10));
  const emptyPoll = p => ({counts:p.options.map(()=>0),status:'not_started',revealed:false,reason:''});
  function create() {
    return {version:VERSION,session:{id:uid(),date:localDate(),label:'',size:null,createdAt:new Date().toISOString()},
      ui:{slide:0,feedback:0,check:0,case:'loma',labAxis:'ground',ground:'soft',structure:'weak',labRevealed:false,liquidStep:0,motion:true,guide:false,fit:true},
      polls:Object.fromEntries(C.polls.map(p=>[p.id,emptyPoll(p)])),
      council:{selected:[],reason:'',risk:'',equity:'',residents:false,before:[]},
      reflections:[],reflectionDraft:{text:'',kind:'learning',peerStrength:'',peerNext:'',criteria:[false,false,false]},
      teacher:{scores:Object.fromEntries(C.faculty.map(c=>[c.id,null])),overall:null,strengths:'',improvements:'',comments:'',name:'',date:localDate(),status:'draft',reviewedAt:'',confirmedAt:''},timer:60};
  }
  function normalize(input) {
    const a = obj(input), d = create(), s = obj(a.session), u = obj(a.ui);
    d.session = {id:text(s.id,80)||d.session.id,date:validDate(s.date)?s.date:d.session.date,label:text(s.label,80),size:s.size === null || s.size === '' || s.size === undefined ? null : int(s.size,1),createdAt:iso(s.createdAt)||d.session.createdAt};
    d.ui = {slide:int(u.slide,0,C.chapters.length-1),feedback:int(u.feedback,0,6),check:int(u.check,0,1),case:u.case==='christchurch'?'christchurch':'loma',labAxis:u.labAxis==='structure'?'structure':'ground',ground:['rock','soft','wet'].includes(u.ground)?u.ground:'soft',structure:u.structure==='designed'?'designed':'weak',labRevealed:u.labRevealed===true,liquidStep:int(u.liquidStep,0,2),motion:u.motion!==false,guide:u.guide===true,fit:u.fit!==false};
    C.polls.forEach(p=>{
      const v=obj(obj(a.polls)[p.id]), supplied=Array.isArray(v.counts)?v.counts:[];
      const counts=p.options.map((_,i)=>int(supplied[i]));
      const bad=supplied.length!==p.options.length || supplied.some(x=>typeof x!=='number'||!Number.isInteger(x)||x<0||x>500);
      let status=['draft','completed','skipped'].includes(v.status)?v.status:'not_started';
      if(status==='completed' && (bad || !sum(counts) || (d.session.size && sum(counts)>d.session.size)))status='draft';
      d.polls[p.id]={counts,status,revealed:v.revealed===true,reason:text(v.reason,600)};
    });
    const c=obj(a.council);let spent=0;
    const allowed=Array.isArray(c.selected)?c.selected:[];
    d.council={selected:C.budget.filter(x=>allowed.includes(x.id)&&spent+x.cost<=10&&(spent+=x.cost)).map(x=>x.id),reason:text(c.reason),risk:text(c.risk),equity:text(c.equity),residents:c.residents===true,before:C.budget.filter(x=>Array.isArray(c.before)&&c.before.includes(x.id)).map(x=>x.id)};
    const cleanReflection = v => {const x=obj(v);return {id:text(x.id,80)||uid(),text:text(x.text,700),kind:x.kind==='application'?'application':'learning',peerStrength:text(x.peerStrength,400),peerNext:text(x.peerNext,400),criteria:[0,1,2].map(i=>Array.isArray(x.criteria)&&x.criteria[i]===true)}};
    d.reflections=(Array.isArray(a.reflections)?a.reflections:[]).slice(0,6).map(cleanReflection).filter(x=>x.text.trim());
    d.reflectionDraft=cleanReflection(a.reflectionDraft);
    const t=obj(a.teacher), scores=obj(t.scores);
    const rate=v=>v==='na'?'na':Number.isInteger(v)&&v>=1&&v<=4?v:null;
    d.teacher={scores:Object.fromEntries(C.faculty.map(c=>[c.id,rate(scores[c.id])])),overall:rate(t.overall),strengths:text(t.strengths),improvements:text(t.improvements),comments:text(t.comments),name:text(t.name,80),date:validDate(t.date)?t.date:d.session.date,status:'draft',reviewedAt:iso(t.reviewedAt),confirmedAt:iso(t.confirmedAt)};
    if(t.status==='confirmed' && C.faculty.every(c=>d.teacher.scores[c.id]!==null) && d.teacher.confirmedAt && d.teacher.reviewedAt)d.teacher.status='confirmed';
    d.timer=int(a.timer,0,600);
    return d;
  }
  function parse(raw) {
    if(raw===null||raw===undefined||raw==='')return {state:create(),warning:'',raw:null,blocked:false};
    try {const a=JSON.parse(raw);if(a?.version!==VERSION||!a.session||!a.polls)throw Error('schema');
      const state=normalize(a);
      const repaired=C.polls.some(p=>JSON.stringify(state.polls[p.id])!==JSON.stringify(a.polls[p.id])) || (a.teacher?.status==='confirmed'&&state.teacher.status!=='confirmed');
      return {state,warning:repaired?'Some saved values were invalid and have been repaired. Review tallies before using the report.':'',raw:null,blocked:false};
    } catch {return {state:create(),warning:'Saved data could not be read. It has not been overwritten. Open Session & data to recover a backup or start again.',raw,blocked:true}};
  }
  function pollStats(state,id) {
    const p=C.polls.find(x=>x.id===id),v=state.polls[id],n=sum(v.counts),invalid=!!state.session.size&&n>state.session.size;
    const completed=v.status==='completed' && n>0 && !invalid;
    const rated=p.kind==='rubric'?sum(v.counts.slice(0,4)):null;
    return {n,completed,invalid,rated,missing:state.session.size===null?null:Math.max(0,state.session.size-n),correct:completed&&p.kind==='knowledge'?v.counts[p.answer]:null,percent:completed&&p.kind==='knowledge'?Math.round(v.counts[p.answer]/n*100):null};
  }
  function setVote(state,id,index,value) {
    const p=C.polls.find(x=>x.id===id);if(!p||!Number.isInteger(index)||index<0||index>=p.options.length)return 'Unknown voting option.';
    const v=state.polls[id],next=int(value),n=sum(v.counts)-v.counts[index]+next;
    if(state.session.size!==null&&n>state.session.size&&next>v.counts[index])return 'That would exceed the class size. Correct the tallies or change the class size in Session & data.';
    v.counts[index]=next;v.status='draft';return '';
  }
  function completePoll(state,id) {
    const st=pollStats(state,id);if(!st.n)return 'Record at least one response, or skip this question.';
    if(st.invalid)return 'The tally exceeds the class size. Correct it before completing.';
    state.polls[id].status='completed';return '';
  }
  function toggleBudget(state,id) {
    const option=C.budget.find(x=>x.id===id);if(!option)return 'Unknown option.';
    const selected=state.council.selected;
    if(selected.includes(id)){state.council.selected=selected.filter(x=>x!==id);return ''}
    if(budgetTotal(state)+option.cost>10)return 'This plan exceeds 10 credits. Remove an option before adding this one.';
    selected.push(id);return '';
  }
  const budgetTotal = s => C.budget.filter(x=>s.council.selected.includes(x.id)).reduce((n,x)=>n+x.cost,0);
  const risks = s => [
    !s.council.selected.includes('school')&&'The school remains structurally unstrengthened.',
    !s.council.selected.includes('homes')&&'Housing structural vulnerabilities remain.',
    !s.council.selected.includes('ground')&&'Housing ground and foundation risks remain.',
    !s.council.selected.includes('prepare')&&'Community preparedness is not funded.',
    'No plan guarantees complete safety.'
  ].filter(Boolean);
  function editTeacher(state){state.teacher.status='draft';state.teacher.reviewedAt='';state.teacher.confirmedAt=''}
  function reviewTeacher(state){if(C.faculty.some(c=>state.teacher.scores[c.id]===null))return 'Score each criterion or select Not observed before reviewing.';state.teacher.reviewedAt=new Date().toISOString();return ''}
  function confirmTeacher(state){if(!state.teacher.reviewedAt||C.faculty.some(c=>state.teacher.scores[c.id]===null))return 'Review the completed rubric before confirming.';state.teacher.status='confirmed';state.teacher.confirmedAt=new Date().toISOString();return ''}
  function evidence(s) {
    return {format:'seismic-mission-evidence',version:VERSION,title:C.title,researchQuestion:C.question,exportedAt:new Date().toISOString(),session:{...s.session},
      method:'Non-anonymous hand-raising entered by the presenter. One response per student per question; no individual tracking. Incomplete tallies are not evidence of a whole-class result.',
      polls:C.polls.map(p=>{const st=pollStats(s,p.id);return {id:p.id,type:p.kind,question:p.title,options:p.options,counts:[...s.polls[p.id].counts],status:s.polls[p.id].status,responses:st.n,unrecorded:st.missing,eligibleForSummary:st.completed,answerRevealed:s.polls[p.id].revealed,reason:s.polls[p.id].reason,correctOption:p.kind==='knowledge'?p.options[p.answer]:null,correctResponses:st.correct,correctPercentOfRecordedHands:st.percent}}),
      reflections:s.reflections.map(x=>({...x,observation:x.kind==='application'?'Presenter-coded features of this spoken sample, not an individual grade':'Self-reported learning; not independently verified'})),
      council:{...s.council,fictitiousBudget:true,spent:budgetTotal(s),remainingRisks:risks(s)},
      faculty:{...s.teacher,criteria:C.faculty.map(c=>({criterion:c.title,score:s.teacher.scores[c.id],descriptor:typeof s.teacher.scores[c.id]==='number'?c.levels[s.teacher.scores[c.id]-1]:s.teacher.scores[c.id]==='na'?'Not observed':'Not rated'}))},
      interpretation:'Confidence and reflection ratings describe perceptions. Knowledge tallies show responses to specific questions. Counts across questions are repeated responses, not unique students. No learning-gain or whole-class mastery claim is calculated.'};
  }
  const csvCell = v => {let s=String(v??'');if(/^[\s\uFEFF]*[=+\-@]/.test(s)||/^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
  function csv(state) {
    const e=evidence(state),rows=[['section','item','option_or_descriptor','value','status','recorded_n','class_size']];
    rows.push(['session','title','',e.title,'','',''],['session','date','',e.session.date,'','',''],['session','label','',e.session.label,'','',''],['session','class_size','',e.session.size??'not entered','','','']);
    e.polls.forEach(p=>{p.options.forEach((o,i)=>rows.push([p.type,p.question,o,p.counts[i],p.status,p.responses,e.session.size??'']));if(p.correctResponses!==null)rows.push(['knowledge_result',p.question,'correct / recorded hands',p.correctResponses+' / '+p.responses,p.status,p.responses,e.session.size??'']);if(p.reason)rows.push(['class_reason',p.question,'',p.reason,p.status,p.responses,e.session.size??''])});
    e.reflections.forEach((r,i)=>{rows.push(['reflection '+(i+1),r.kind,'spoken response',r.text,'recorded','',''],['peer_feedback',String(i+1),'scientific strength',r.peerStrength,'recorded','',''],['peer_feedback',String(i+1),'suggested improvement',r.peerNext,'recorded','','']);if(r.kind==='application')r.criteria.forEach((v,j)=>rows.push(['observed_application',String(i+1),['ground mechanism','structural factor','uncertainty / limit'][j],v?'observed':'not recorded','presenter-coded','','']))});
    rows.push(['council','plan','fictional credits',budgetTotal(state)+'/10','recorded','',''],['council','choices','',e.council.selected.join(', '),'recorded','',''],['council','reason','',e.council.reason,'recorded','',''],['council','remaining risk','',e.council.risk,'recorded','',''],['council','equity','',e.council.equity,'recorded','','']);
    e.faculty.criteria.forEach(c=>rows.push(['faculty',c.criterion,c.descriptor,c.score??'',e.faculty.status,'','']));
    for(const key of ['date','overall','strengths','improvements','comments','name','confirmedAt'])rows.push(['faculty',key,'',e.faculty[key]??'',e.faculty.status,'','']);
    return '\ufeff'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');
  }
  function backup(s){return JSON.stringify({format:'seismic-mission-backup',version:VERSION,exportedAt:new Date().toISOString(),state:s,evidence:evidence(s)},null,2)}
  function importBackup(raw){const x=JSON.parse(raw);if(x.format!=='seismic-mission-backup'||x.version!==VERSION||x.state?.version!==VERSION||!x.state.session||!x.state.polls)throw Error('Choose a Seismic Mission 3.0 backup JSON file.');return normalize(x.state)}
  return {VERSION,KEY,BACKUP,create,normalize,parse,esc,text,int,sum,uid,localDate,validDate,pollStats,setVote,completePoll,toggleBudget,budgetTotal,risks,editTeacher,reviewTeacher,confirmTeacher,evidence,csv,csvCell,backup,importBackup};
})();
