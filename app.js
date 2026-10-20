/* DOM controller. Classroom data never leaves the browser except explicit downloads. */
'use strict';
(() => {
  const K=SM.core,C=SM.content,V=SM.views,e=K.esc,b=V.b,$=id=>document.getElementById(id);
  let loaded,storageFailed=false;
  try{loaded=K.parse(localStorage.getItem(K.KEY))}catch{loaded={state:K.create(),warning:'This browser cannot save locally. Keep this tab open and download a JSON backup before leaving.',blocked:false,raw:null};storageFailed=true}
  let state=loaded.state,blocked=loaded.blocked,warning=loaded.warning,rawCorrupt=loaded.raw;
  const layout=SM.layout.create($('stage'),()=>state.ui.fit);
  let modalType='',returnFocus=null,reviewing=false,pendingImport=null,pendingSource='',editingReflection=-1;
  editingReflection=state.reflections.findIndex(r=>r.id===state.reflectionDraft.id);
  let running=false,timerDuration=[30,60,180].includes(state.timer)?state.timer:60,noticeTimer;
  const reflectionEmpty=()=>({id:'',text:'',kind:'learning',peerStrength:'',peerNext:'',criteria:[false,false,false]});
  function toast(message){$('notice').textContent=message;$('notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').hidden=true,6000)}
  function storageStatus(){const node=$('save-status');node.textContent=blocked?'Recovery needed':storageFailed?'Not saved':'Saved on this computer';node.classList.toggle('warning',blocked||storageFailed);$('storage-warning').hidden=!warning;$('storage-message').textContent=warning}
  function save(){
    if(blocked){storageStatus();return false}
    try{
      const prior=localStorage.getItem(K.KEY);
      if(prior && !K.parse(prior).blocked)localStorage.setItem(K.BACKUP,prior);
      localStorage.setItem(K.KEY,JSON.stringify(state));
      if(storageFailed){warning='';storageFailed=false}
      storageStatus();return true;
    }catch{storageFailed=true;warning='Local saving failed. Your current work is still in this tab. Download a JSON backup before closing it.';storageStatus();return false}
  }
  function refreshPoll(id){
    const p=C.polls.find(x=>x.id===id),v=state.polls[id],st=K.pollStats(state,id);
    const panel=document.querySelector(`[data-poll="${id}"]`);
    if(!panel)return;
    panel.querySelectorAll('.tally').forEach((row,i)=>{const bar=row.querySelector('.track span');if(bar)bar.style.width=(v.counts[i]/(st.n||1)*100)+'%';const input=$('count-'+id+'-'+i);if(input)input.value=String(v.counts[i]);const minus=$('minus-'+id+'-'+i);if(minus)minus.disabled=v.counts[i]===0});
    const status=panel.querySelector('.status-label');if(status){status.textContent='in progress';status.className='status-label draft'}
    const note=panel.querySelector('.tally-note');if(note)note.textContent=st.n+' hands recorded'+(state.session.size!==null?' / '+state.session.size+' students · '+st.missing+' unrecorded':' · class size not entered')+'. One choice per student; count each hand once. This is a visible show of hands, not anonymous. Complete the tally to include it in the summary.'+(st.invalid?' Tally exceeds class size; excluded from summary.':'')+(v.revealed?' The explanation is visible; edits are corrections, not a fresh independent attempt.':'');
    const complete=panel.querySelector('[data-action="complete-poll"]');if(complete)complete.textContent='Complete tally';
    const reveal=panel.querySelector('[data-action="reveal-poll"]');if(reveal)reveal.disabled=true;
  }
  function clock(){const n=state.timer;$('clock').textContent=Math.floor(n/60)+':'+String(n%60).padStart(2,'0');$('timer-toggle').textContent=running?'Pause':'Start'}
  function focusSnapshot(){const a=document.activeElement;return {id:a?.id,position:a?.selectionStart}}
  function restoreFocus(f){if(!f.id)return;const a=$(f.id);if(a){a.focus({preventScroll:true});if(typeof f.position==='number'&&(['text','search','url','tel','password'].includes(a.type)||a.tagName==='TEXTAREA')){try{a.setSelectionRange(f.position,f.position)}catch{}}}}
  function render(focusTitle=false){const f=focusSnapshot(),i=state.ui.slide;document.documentElement.classList.toggle('stop-motion',!state.ui.motion);$('stage').innerHTML='<div class="slide-frame">'+V.render(state)+'</div>';layout.refresh();$('chapter-rail').innerHTML=C.chapters.map((c,j)=>b(String(j+1).padStart(2,'0'),'jump',`data-value="${j}" title="${e(c[0])}" aria-label="${j+1}. ${e(c[0])}" ${i===j?'aria-current="step"':''}`,i===j?'current':'')).join('')+'<span class="rail-word">INVESTIGATE / EXPLAIN / REFLECT</span>';$('slide-count').textContent=String(i+1).padStart(2,'0')+' / '+C.chapters.length;$('chapter-name').textContent=C.chapters[i][0];$('bottom').style.setProperty('--progress',((i+1)/C.chapters.length*100)+'%');$('previous').disabled=i===0;$('next').disabled=i===C.chapters.length-1;$('next').textContent=i===C.chapters.length-1?'Mission complete ✓':'Continue →';$('guide-button').setAttribute('aria-pressed',String(state.ui.guide));$('fit-button').setAttribute('aria-pressed',String(state.ui.fit));clock();storageStatus();if(focusTitle){$('stage').scrollTop=0;$('slide-title')?.focus({preventScroll:true})}else restoreFocus(f)}
  function go(index){state.ui.slide=K.int(index,0,C.chapters.length-1);running=false;if(modalType)closeModal();save();render(true)}
  function stopTimer(){running=false;clock()}
  function openModal(type,title,html){stopTimer();if(!$('dialog').open)returnFocus=document.activeElement;modalType=type;$('dialog-title').textContent=title;$('dialog-body').innerHTML=html.replace(/id="action-/g,'id="dialog-action-');if(!$('dialog').open)$('dialog').showModal();$('dialog').scrollTop=0;$('dialog').querySelector('button')?.focus()}
  function replaceModal(html){const f=focusSnapshot(),scroll=$('dialog').scrollTop;$('dialog-body').innerHTML=html.replace(/id="action-/g,'id="dialog-action-');$('dialog').scrollTop=scroll;restoreFocus(f)}
  function closeModal(){if($('dialog').open)$('dialog').close();modalType='';reviewing=false;pendingImport=null;render();const target=returnFocus;if(target?.isConnected)target.focus({preventScroll:true});else $('slide-title')?.focus({preventScroll:true})}
  function sessionHtml(){return `<p class="lede">All results stay in this browser. Export a backup to move or protect a session. No student names or accounts are needed.</p><div class="three"><div><label class="label" for="session.label">Class label (optional)</label><input id="session.label" data-field="session.label" maxlength="80" placeholder="e.g. Year 3" value="${e(state.session.label)}"></div><div><label class="label" for="session.date">Presentation date</label><input id="session.date" data-field="session.date" type="date" value="${e(state.session.date)}"></div><div><label class="label" for="session.size">Number of students (optional)</label><input id="session.size" data-field="session.size" type="number" min="1" max="500" step="1" placeholder="Not entered" value="${state.session.size??''}"></div></div><p class="small">The date starts from this computer’s local date. Change it if the presentation took place on another day. Class size is a ceiling check, not a participation estimate.</p>${warning?`<div class="callout warning">${e(warning)}</div>`:''}<div class="actions">${b('Download JSON backup','json','','primary')}${b('Recover previous local save','recover')}${rawCorrupt?b('Download unreadable original data','raw-export'):''}</div><label class="label" for="import-file">Restore a downloaded Seismic Mission 3.0 backup</label><input type="file" id="import-file" accept=".json,application/json" class="file-input"><p class="small">Restoring replaces the current session only after a review step. Export your current session first if you need to keep both.</p><hr style="border:0;border-top:1px solid var(--line);margin:1.4rem 0"><h3>Presentation controls</h3><p class="small">Fit slide adjusts presentation content to the available screen. Turn it off for full-size text. Long forms and reports scroll within the content area; navigation stays in view.</p><div class="actions">${b(state.ui.fit?'Fit slide: on':'Fit slide: off','fit',`aria-pressed="${state.ui.fit}"`)}${b(state.ui.motion?'Motion on · click to reduce':'Motion off · click to enable','motion',`aria-pressed="${!state.ui.motion}"`)}${b('Keyboard shortcuts','shortcuts')}${b('Open original research','research')}${b('Download offline presentation','offline-download')}</div><p class="small">The standalone offline HTML contains the full application and research. Browser storage can depend on its file location; keep a JSON backup when moving it.</p><div class="actions">${b('Clear feedback & start a new class','reset-request','','danger ghost')}</div>`}
  function openSession(){openModal('session','Session & data',sessionHtml())}
  function openTeacher(){reviewing=false;openModal('teacher','Faculty evaluation',V.teacherForm(state,false))}
  function reportModal(){openModal('report','Session evidence report',`<div class="actions" style="margin:0 0 1rem">${b('Print / Save as PDF','print','','primary')}${b('Download printable HTML','html-report')}${b('Download CSV','csv')}${b('Download JSON backup','json')}</div><style>${SM.report.css}</style>${SM.report.html(state)}`)}
  function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
  function filename(ext){return 'Seismic-Mission-'+state.session.date+'.'+ext}
  function exportJson(){download(filename('json'),K.backup(state),'application/json');toast('JSON backup downloaded. Keep it to restore this session.')}
  function printReport(){ $('print-report').innerHTML='<style>'+SM.report.css+'</style>'+SM.report.html(state);window.print() }
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else throw Error('not supported')}catch{toast('Fullscreen is unavailable here. Use your browser’s fullscreen command instead.')}}
  function showImport(candidate,source){pendingImport=candidate;pendingSource=source;openModal('import','Review session to restore',`<p class="lede">Restore this saved session on this computer?</p><div class="panel"><p><b>Date:</b> ${e(candidate.session.date)}</p><p><b>Class:</b> ${e(candidate.session.label||'Not entered')}</p><p><b>Spoken samples:</b> ${candidate.reflections.length}</p><p><b>Teacher evaluation:</b> ${e(candidate.teacher.status)}</p><p><b>Source:</b> ${e(source)}</p></div><p class="small">This replaces the active session. No data is uploaded. Download the current backup first if you want to retain both.</p><div class="actions">${b('Download current backup','json')}${b('Restore this session','import-confirm','','primary')}${b('Cancel','close-modal','','ghost')}</div>`)}
  const actions={
    next:()=>go(state.ui.slide+1),previous:()=>go(state.ui.slide-1),jump:d=>go(+d.value),
    menu:()=>openModal('menu','Choose a chapter',`<p class="small">Jump freely. Votes, drafts, reflections and your class plan are preserved.</p><div class="menu-grid">${C.chapters.map((c,i)=>b(`${String(i+1).padStart(2,'0')} · ${c[0]}<span>${c[1]} · ${c[2]}</span>`,'jump',`data-value="${i}" ${state.ui.slide===i?'aria-current="step"':''}`)).join('')}</div><div class="actions">${b('Session & data','session')}${b('Teacher rubric','teacher')}${b('Research & sources','sources')}</div>`),
    fit:()=>{state.ui.fit=!state.ui.fit;save();render();if(modalType==='session')replaceModal(sessionHtml())},
    guide:()=>{state.ui.guide=!state.ui.guide;save();render()},session:openSession,teacher:openTeacher,report:reportModal,fullscreen,
    'close-modal':closeModal,
    shortcuts:()=>openModal('shortcuts','Keyboard shortcuts',`<table><tbody><tr><th>Next / Previous</th><td>→ / ← · Page Down / Page Up · Space = next</td></tr><tr><th>First / Last chapter</th><td>Home / End</td></tr><tr><th>Chapters</th><td>M</td></tr><tr><th>Fullscreen</th><td>F</td></tr><tr><th>Discussion guide</th><td>G</td></tr><tr><th>Teacher evaluation</th><td>E</td></tr><tr><th>Close dialog</th><td>Escape</td></tr></tbody></table><p class="small">Shortcuts pause while typing, using a button or inside a dialog. The timer never advances a chapter.</p>`),
    sources:()=>openModal('sources','Research & source notes',`<p class="lede">The original project paper is the content baseline. The presentation uses qualitative findings and distinguishes observations from simplified diagrams.</p>${b('Read the complete original paper','research','','primary')}<p class="small">The paper is preserved unedited. Its numerical draft claims are not automatically validated by appearing here. The classroom presentation omits unsupported-looking damage multipliers and inspection counts.</p>${C.sources.filter(x=>x.url).map(x=>`<article class="mini-chart"><h3 style="font-size:.9rem"><a href="${e(x.url)}" target="_blank" rel="noopener noreferrer">${e(x.title)} ↗</a></h3><p class="small">${e(x.note)}</p></article>`).join('')}<p class="small">External source links require internet. The presentation, full project paper, diagrams and evaluation functions do not.</p>`),
    research:()=>openModal('research','Original project research',`<p class="small">Preserved original text, including its bibliography. This is documentary research, not a report of our own fieldwork. See source notes for numerical and bibliography qualifications.</p><div class="actions">${b('Source notes','sources')}${b('Download research text','research-download')}</div><pre>${e(window.RESEARCH_TEXT||'Research text could not be loaded.')}</pre>`),
    'research-download':()=>download('Seismic-Mission-original-research.md',window.RESEARCH_TEXT||'','text/markdown;charset=utf-8'),
    vote:d=>{const error=K.setVote(state,d.id,+d.index,state.polls[d.id].counts[+d.index]+Number(d.delta));if(error)toast(error);save();render()},
    'complete-poll':d=>{const error=K.completePoll(state,d.id);if(error)toast(error);else toast('Tally completed. You can correct counts at any time.');save();render()},
    'skip-poll':d=>{state.polls[d.id].status='skipped';save();render();toast('Question skipped. Any draft counts remain saved.')},
    'clear-poll':d=>openModal('clear-poll','Clear this tally?',`<p>${e(C.polls.find(p=>p.id===d.id).title)}</p><p class="small">Only this question’s counts, explanation and reveal state will be cleared.</p><div class="actions">${b('Clear this question','clear-poll-confirm',`data-id="${d.id}"`,'danger')}${b('Keep data','close-modal','','primary')}</div>`),
    'clear-poll-confirm':d=>{const p=C.polls.find(x=>x.id===d.id);state.polls[d.id]={counts:p.options.map(()=>0),status:'not_started',revealed:false,reason:''};closeModal();save();render()},
    'reveal-poll':d=>{const p=state.polls[d.id];if(!['completed','skipped'].includes(p.status))return toast('Complete or skip the tally before revealing.');p.revealed=!p.revealed;save();render()},
    'lab-axis':d=>{state.ui.labAxis=d.value;state.ui.labRevealed=false;save();render()},
    'lab-ground':d=>{state.ui.ground=d.value;state.ui.labRevealed=false;save();render()},
    'lab-structure':d=>{state.ui.structure=d.value;state.ui.labRevealed=false;save();render()},
    'lab-reveal':()=>{state.ui.labRevealed=true;save();render()},
    'lab-static':()=>{state.ui.motion=false;state.ui.labRevealed=true;save();render();toast('Motion is off. The explanation is the same; you can re-enable motion in Session & data.')},
    'liquid-step':d=>{state.ui.liquidStep=+d.value;save();render()},case:d=>{state.ui.case=d.value;save();render()},check:d=>{state.ui.check=+d.value;save();render()},
    'next-check':()=>{state.ui.check=1;save();render(true)},
    budget:d=>{const error=K.toggleBudget(state,d.id);if(error)toast(error);save();render()},
    residents:()=>{if(!state.council.residents){state.council.before=[...state.council.selected];state.council.residents=true}save();render()},
    'feedback-jump':d=>{state.ui.feedback=K.int(d.value,0,6);save();render()},
    'feedback-prev':()=>{state.ui.feedback=Math.max(0,state.ui.feedback-1);save();render()},
    'feedback-next':()=>{if(state.ui.feedback<6){state.ui.feedback++;save();render(true)}else go(11)},
    'skip-feedback':()=>{V.feedbackIds.slice(state.ui.feedback).forEach(id=>{if(state.polls[id].status!=='completed')state.polls[id].status='skipped'});go(11)},
    'add-reflection':()=>{const d=state.reflectionDraft;if(!d.text.trim())return toast('Record an actual spoken response before saving.');if(editingReflection<0&&state.reflections.length>=6)return toast('Six samples are already recorded. Edit or remove one to add another.');const r={...d,text:d.text.trim(),criteria:[...d.criteria],id:editingReflection>=0?state.reflections[editingReflection].id:K.uid()};if(editingReflection>=0)state.reflections[editingReflection]=r;else state.reflections.push(r);editingReflection=-1;state.reflectionDraft=reflectionEmpty();save();render();toast('Spoken sample and peer feedback saved.')},
    'edit-reflection':d=>{const i=+d.index;if(!state.reflections[i])return;if(state.reflectionDraft.text.trim())return toast('Save or clear the current reflection draft before editing another sample.');editingReflection=i;state.reflectionDraft={...state.reflections[i],criteria:[...state.reflections[i].criteria]};state.ui.slide=11;save();render(true)},
    'remove-reflection':d=>openModal('remove-reflection','Remove this spoken sample?',`<blockquote>${e(state.reflections[+d.index]?.text||'')}</blockquote><div class="actions">${b('Remove sample','remove-reflection-confirm',`data-index="${d.index}"`,'danger')}${b('Keep sample','close-modal','','primary')}</div>`),
    'remove-reflection-confirm':d=>{state.reflections.splice(+d.index,1);if(editingReflection===+d.index)state.reflectionDraft=reflectionEmpty();editingReflection=state.reflections.findIndex(r=>r.id===state.reflectionDraft.id);closeModal();save();render()},
    'clear-reflection-draft':()=>{state.reflectionDraft=reflectionEmpty();editingReflection=-1;save();render()},
    'teacher-score':d=>{state.teacher.scores[d.id]=d.value==='na'?'na':+d.value;K.editTeacher(state);reviewing=false;save();replaceModal(V.teacherForm(state,false));render()},
    'teacher-review':()=>{const error=K.reviewTeacher(state);if(error)return toast(error);reviewing=true;save();replaceModal(V.teacherForm(state,true));$('dialog').scrollTop=0;$('dialog-body').querySelector('button')?.focus()},
    'teacher-edit':()=>{reviewing=false;replaceModal(V.teacherForm(state,false))},
    'teacher-confirm':()=>{const error=K.confirmTeacher(state);if(error)return toast(error);save();closeModal();render();toast('Teacher evaluation confirmed. It remains editable.')},
    motion:()=>{state.ui.motion=!state.ui.motion;save();render();if(modalType==='session')replaceModal(sessionHtml())},
    'timer-toggle':()=>{if(state.timer===0)state.timer=timerDuration;running=!running;clock();save()},
    'timer-reset':()=>{running=false;state.timer=timerDuration;save();clock()},
    'timer-duration':()=>{running=false;timerDuration=timerDuration===30?60:timerDuration===60?180:30;state.timer=timerDuration;save();clock();toast('Discussion timer: '+timerDuration+' seconds.')},
    json:exportJson,csv:()=>{download(filename('csv'),K.csv(state),'text/csv;charset=utf-8');toast('CSV exported with question status and sample sizes.')},
    'html-report':()=>download(filename('html'),SM.report.document(state),'text/html;charset=utf-8'),print:printReport,
    'raw-export':()=>download('Seismic-Mission-unreadable-data.txt',rawCorrupt||'','text/plain;charset=utf-8'),
    recover:()=>{try{const raw=localStorage.getItem(K.BACKUP);if(!raw)return toast('No previous local save is available. Restore a downloaded JSON backup instead.');const result=K.parse(raw);if(result.blocked)return toast('The previous local save is also unreadable. It has not been changed.');showImport(result.state,'Previous local save')}catch{toast('This browser cannot read a previous save. Use a downloaded JSON backup.')}},
    'import-confirm':()=>{if(!pendingImport)return;state=K.normalize(pendingImport);blocked=false;rawCorrupt=null;warning='';editingReflection=state.reflections.findIndex(r=>r.id===state.reflectionDraft.id);closeModal();save();render(true);toast('Session restored from '+pendingSource+'.')},
    'reset-request':()=>openModal('reset','Start a new class',`<p class="lede">This clears version 3 feedback, evaluation, progress and its previous local save on this computer.</p><p class="small">Download a backup first if you need this session. Other applications and the preserved old versions are unaffected.</p><label class="label" for="reset-word">Type CLEAR to confirm</label><input id="reset-word" autocomplete="off" spellcheck="false"><div class="actions">${b('Download backup','json')}${b('Clear & start new class','reset-confirm','','danger')}${b('Cancel','close-modal','','primary')}</div>`),
    'reset-confirm':()=>{if($('reset-word')?.value!=='CLEAR')return toast('Type CLEAR exactly to confirm.');try{localStorage.removeItem(K.KEY);localStorage.removeItem(K.BACKUP)}catch{storageFailed=true}state=K.create();blocked=false;rawCorrupt=null;warning='';editingReflection=-1;running=false;closeModal();save();render(true);toast('New empty session started.')},
    'offline-download':()=>{if(location.protocol==='file:'&&document.querySelector('meta[name="seismic-standalone"]')){toast('You are already using the standalone offline file. Keep this file and a JSON backup.');return}const a=document.createElement('a');a.href='Seismic-Mission-offline.html';a.download='Seismic-Mission-offline.html';document.body.append(a);a.click();a.remove()}
  };
  document.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(!target||target.disabled)return;const fn=actions[target.dataset.action];if(fn){event.preventDefault();fn(target.dataset)}});
  const fieldPaths=new Set(['session.label','session.date','session.size','council.reason','council.risk','council.equity','reflectionDraft.text','reflectionDraft.kind','reflectionDraft.peerStrength','reflectionDraft.peerNext','teacher.overall','teacher.strengths','teacher.improvements','teacher.comments','teacher.name','teacher.date']);
  function updateField(target){const path=target.dataset.field;if(!fieldPaths.has(path))return;const [section,key]=path.split('.');let value=target.value;
    if(key==='date'){if(!K.validDate(value)){if(target.tagName==='INPUT')target.value=state[section][key];return toast('Enter a valid calendar date.')}}
    else if(path==='session.size'){value=value===''?null:K.int(value,1,500);for(const p of C.polls)if(value!==null&&K.sum(state.polls[p.id].counts)>value&&state.polls[p.id].status==='completed')state.polls[p.id].status='draft'}
    else if(path==='teacher.overall')value=value===''?null:K.int(value,1,4);
    else if(path==='reflectionDraft.kind')value=value==='application'?'application':'learning';
    else value=K.text(value,key==='name'||key==='label'?80:key==='text'?700:key==='peerStrength'||key==='peerNext'?400:1200);
    if(state[section][key]===value)return;
    state[section][key]=value;
    if(section==='teacher'){K.editTeacher(state);reviewing=false;const st=$('dialog-body').querySelector('.faculty-status');if(st)st.textContent='Draft · changes saved locally; review and confirm again.'}
    save();
  }
  document.addEventListener('input',event=>{const t=event.target;if(t.dataset.field&&!['date','number'].includes(t.type)&&t.tagName!=='SELECT')updateField(t);if(t.dataset.pollReason){state.polls[t.dataset.pollReason].reason=K.text(t.value,600);save()}});
  document.addEventListener('change',async event=>{const t=event.target;
    if(t.dataset.field){updateField(t);if(t.dataset.field.startsWith('session.'))render()}
    if(t.dataset.count){const error=K.setVote(state,t.dataset.count,+t.dataset.index,t.value);if(error)toast(error);t.value=String(state.polls[t.dataset.count].counts[+t.dataset.index]);save();if(!error){refreshPoll(t.dataset.count);layout.refresh()}}
    if(t.dataset.observed!==undefined){state.reflectionDraft.criteria[+t.dataset.observed]=t.checked;save()}
    if(t.id==='import-file'&&t.files?.[0]){const file=t.files[0];if(file.size>2_000_000)return toast('This file is too large for a classroom backup.');try{const raw=await file.text();const candidate=K.importBackup(raw);showImport(candidate,file.name)}catch(error){toast(error.message||'This backup could not be read. The current session is unchanged.')}}
  });
  document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey)return;
    if($('dialog').open){if(event.key==='Escape'){event.preventDefault();closeModal()}if(event.key==='Tab'){const items=[...$('dialog').querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),summary,[tabindex="0"]')].filter(x=>!x.hidden);const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}return}
    if(event.target.closest('input,textarea,select,button,a,summary,[contenteditable="true"]'))return;
    const key=event.key.toLowerCase(),map={arrowright:actions.next,pagedown:actions.next,' ':actions.next,arrowleft:actions.previous,pageup:actions.previous,home:()=>go(0),end:()=>go(C.chapters.length-1),f:fullscreen,e:openTeacher,g:actions.guide,m:actions.menu};if(map[key]){event.preventDefault();map[key]()}
  });
  $('dialog').addEventListener('cancel',event=>{event.preventDefault();closeModal()});
  document.addEventListener('fullscreenchange',()=>{$('full-button').textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen'});
  window.addEventListener('beforeprint',()=>{$('print-report').innerHTML='<style>'+SM.report.css+'</style>'+SM.report.html(state)});
  window.addEventListener('beforeunload',event=>{if(storageFailed||blocked){event.preventDefault();event.returnValue=''}});
  window.addEventListener('storage',event=>{if(event.key===K.KEY&&event.newValue&&event.newValue!==JSON.stringify(state)){blocked=true;warning='This session changed in another tab. Export this tab’s backup, then reload to use the other saved version. Saving here is paused to avoid overwriting it.';storageStatus()}});
  setInterval(()=>{if(!running)return;if(state.timer>0){state.timer--;clock();save()}if(state.timer===0){running=false;clock();toast('Discussion time is up. Hear a response when the class is ready.')}},1000);
  SM.app={get state(){return state},go,render,actions,save,get blocked(){return blocked}};
  render();
})();
