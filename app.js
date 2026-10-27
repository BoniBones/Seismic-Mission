'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function defaultSurvival() {
  return {
    selectedIds: [],
    remainingMs: MISSION.survivalConfig.timerDurationMs,
    remainingSeconds: MISSION.survivalConfig.timerDurationSeconds,
    timerStatus: 'idle',
    phase: 'decision',
    evaluated: false,
    closingOpen: false
  };
}

function defaults() {
  return {
    step: 0,
    lang: 'es',
    teacher: false,
    vote: null,
    case: 'loma',
    soil: 'rock',
    design: 'good',
    labRuns: 0,
    visited: ['loma'],
    survival: defaultSurvival()
  };
}

function sanitizeSurvival(raw) {
  const base = defaultSurvival();
  if (!raw || typeof raw !== 'object') return base;
  const cfg = MISSION.survivalConfig;
  const validIds = new Set(MISSION.options.map(o => o.id));
  if (Array.isArray(raw.selectedIds)) {
    base.selectedIds = [...new Set(raw.selectedIds.map(Number))]
      .filter(id => Number.isInteger(id) && validIds.has(id))
      .slice(0, cfg.maxDiscards);
  }
  if (typeof raw.remainingMs === 'number' && Number.isFinite(raw.remainingMs)) {
    base.remainingMs = Math.max(0, Math.min(cfg.timerDurationMs, Math.round(raw.remainingMs)));
  } else if (typeof raw.remainingSeconds === 'number' && Number.isFinite(raw.remainingSeconds)) {
    const clampedSec = Math.max(0, Math.min(cfg.timerDurationSeconds, Math.round(raw.remainingSeconds)));
    base.remainingMs = clampedSec * 1000;
  }
  base.remainingSeconds = Math.max(0, Math.min(cfg.timerDurationSeconds, Math.ceil(base.remainingMs / 1000)));
  if (base.remainingMs <= 0) {
    base.remainingMs = 0;
    base.remainingSeconds = 0;
    base.timerStatus = 'expired';
  } else if (raw.timerStatus === 'expired') {
    base.remainingMs = 0;
    base.remainingSeconds = 0;
    base.timerStatus = 'expired';
  } else if ((raw.timerStatus === 'paused' || raw.timerStatus === 'running') && base.remainingMs < cfg.timerDurationMs) {
    base.timerStatus = 'paused';
  } else {
    base.timerStatus = 'idle';
  }
  base.evaluated = raw.evaluated === true;
  base.closingOpen = raw.closingOpen === true;
  if (base.closingOpen) {
    base.phase = 'closing';
  } else if (['decision', 'validation', 'simulation', 'closing'].includes(raw.phase)) {
    base.phase = raw.phase === 'closing' ? 'simulation' : raw.phase;
  } else {
    base.phase = base.evaluated ? 'validation' : 'decision';
  }
  return base;
}

let state = defaults(), storageAvailable = true;
try {
  const x = JSON.parse(localStorage.getItem('seismic-mission-v1') || 'null');
  if (x && typeof x === 'object') {
    state.step = Number.isInteger(x.step) && x.step >= 0 && x.step < 7 ? x.step : 0;
    state.lang = x.lang === 'en' ? 'en' : 'es';
    state.teacher = x.teacher === true;
    state.vote = ['a', 'b', 'c'].includes(x.vote) ? x.vote : null;
    state.case = x.case === 'christchurch' ? 'christchurch' : 'loma';
    state.soil = ['rock', 'soft', 'wet'].includes(x.soil) ? x.soil : 'rock';
    state.design = x.design === 'weak' ? 'weak' : 'good';
    state.labRuns = Number.isInteger(x.labRuns) && x.labRuns >= 0 ? x.labRuns : 0;
    state.visited = Array.isArray(x.visited) ? x.visited.filter(v => ['loma', 'christchurch'].includes(v)) : ['loma'];
    if (state.visited.length === 0) state.visited = ['loma'];
    state.survival = sanitizeSurvival(x.survival);
  }
} catch {
  storageAvailable = false;
}

function tr(es, en) { return state.lang === 'es' ? es : en; }
function t(pair) { return pair[state.lang === 'es' ? 0 : 1]; }
const box = (c, x) => '<div class="' + c + '">' + x + '</div>';
const p = (x, c = '') => '<p' + (c ? ' class="' + c + '"' : '') + '>' + x + '</p>';
const h = x => '<h3>' + x + '</h3>';
function btn(label, action, cls = '', extra = '') {
  return '<button type="button"' + (cls ? ' class="' + cls + '"' : '') + (extra ? ' ' + extra : '') + ' onclick="' + action + '">' + label + '</button>';
}
function detail(title, body) { return '<details><summary>' + title + '</summary>' + p(body) + '</details>'; }
function head(label, title, body = '') {
  return box('eyebrow', label) + '<h2 tabindex="-1" id="pageTitle">' + title + '</h2>' + (body ? p(body, 'lede') : '');
}
function save() {
  try { localStorage.setItem('seismic-mission-v1', JSON.stringify(state)); } catch { storageAvailable = false; }
}

let toastTimeout, labTimeout, modalFocus;
let survivalTimerId = null;
let survivalDeadlineMs = 0;

function nowMs() {
  return Date.now();
}

function stopSurvivalInterval() {
  if (survivalTimerId !== null) {
    if (typeof clearInterval === 'function') clearInterval(survivalTimerId);
    survivalTimerId = null;
  }
}

function formatSurvivalClock(seconds = state.survival.remainingSeconds) {
  const safe = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return '00:' + String(safe).padStart(2, '0');
}

function isDecisionLocked(session = state.survival) {
  return Boolean(session.evaluated || session.timerStatus === 'expired');
}

function canEvaluatePlan(session = state.survival) {
  return Boolean(
    session.evaluated ||
    session.selectedIds.length === MISSION.survivalConfig.maxDiscards ||
    session.timerStatus === 'expired'
  );
}

function getTimerVisualMeta(session = state.survival) {
  const cfg = MISSION.survivalConfig;
  const pct = Math.max(0, Math.min(100, (session.remainingMs / cfg.timerDurationMs) * 100));
  const isExpired = session.timerStatus === 'expired' || session.remainingSeconds <= 0;
  const isWarning = !isExpired && session.remainingSeconds <= cfg.warningThresholdSeconds;
  let stateClass = 'is-normal';
  let statusText = tr('Detenido · Listo para iniciar', 'Stopped · Ready to start');
  if (session.evaluated) {
    stateClass = 'is-locked';
    statusText = tr('Evaluación confirmada · Decisiones bloqueadas', 'Evaluation confirmed · Decisions locked');
  } else if (isExpired) {
    stateClass = 'is-expired';
    statusText = tr('Tiempo agotado · Selecciones bloqueadas', 'Time expired · Selections locked');
  } else if (session.timerStatus === 'running' && isWarning) {
    stateClass = 'is-warning';
    statusText = tr('⚠ Últimos 10 segundos · Cierren descartes', '⚠ Final 10 seconds · Lock in discards');
  } else if (session.timerStatus === 'running') {
    stateClass = 'is-running';
    statusText = tr('Cuenta regresiva en curso', 'Countdown running');
  } else if (session.timerStatus === 'paused') {
    stateClass = isWarning ? 'is-warning' : 'is-paused';
    statusText = tr('En pausa · Podés reanudar', 'Paused · Ready to resume');
  }
  return { pct, isExpired, isWarning, stateClass, statusText };
}

function syncTimerDOM() {
  const clockEl = $('#srClock');
  const barEl = $('#srTimerBar');
  const trackEl = $('#srTimerTrack');
  const boxEl = $('#srTimerBox');
  const statusEl = $('#srTimerStatus');
  const meta = getTimerVisualMeta(state.survival);
  if (clockEl) clockEl.textContent = formatSurvivalClock(state.survival.remainingSeconds);
  if (barEl && barEl.style) barEl.style.width = meta.pct.toFixed(1) + '%';
  if (trackEl && trackEl.setAttribute) trackEl.setAttribute('aria-valuenow', String(state.survival.remainingSeconds));
  if (statusEl) statusEl.textContent = meta.statusText;
  if (boxEl) boxEl.className = 'sr-timer panel ' + meta.stateClass;
}

function survivalTick() {
  if (state.survival.timerStatus !== 'running' || state.step !== 4) {
    pauseSurvivalTimer(true);
    return;
  }
  const cfg = MISSION.survivalConfig;
  const remMs = Math.max(0, survivalDeadlineMs - nowMs());
  const remSec = Math.max(0, Math.min(cfg.timerDurationSeconds, Math.ceil(remMs / 1000)));
  state.survival.remainingMs = remMs;
  state.survival.remainingSeconds = remSec;
  if (remMs <= 0) {
    stopSurvivalInterval();
    state.survival.remainingMs = 0;
    state.survival.remainingSeconds = 0;
    state.survival.timerStatus = 'expired';
    save();
    toast(tr('Tiempo agotado. Selecciones bloqueadas: ya se puede evaluar el plan.', 'Time is up. Selections locked: you may now evaluate the plan.'));
    render();
    return;
  }
  syncTimerDOM();
}

function timerStart() {
  if (state.step !== 4) return false;
  if (isDecisionLocked()) return false;
  if (state.survival.timerStatus === 'running') return false;
  if (state.survival.remainingMs <= 0) return false;
  stopSurvivalInterval();
  survivalDeadlineMs = nowMs() + state.survival.remainingMs;
  state.survival.timerStatus = 'running';
  save();
  render();
  survivalTimerId = setInterval(survivalTick, MISSION.survivalConfig.timerTickMs);
  return true;
}

function pauseSurvivalTimer(silent = false) {
  if (state.survival.timerStatus !== 'running') {
    stopSurvivalInterval();
    return false;
  }
  const cfg = MISSION.survivalConfig;
  const remMs = Math.max(0, survivalDeadlineMs - nowMs());
  stopSurvivalInterval();
  if (remMs <= 0) {
    state.survival.remainingMs = 0;
    state.survival.remainingSeconds = 0;
    state.survival.timerStatus = 'expired';
  } else {
    state.survival.remainingMs = remMs;
    state.survival.remainingSeconds = Math.max(0, Math.min(cfg.timerDurationSeconds, Math.ceil(remMs / 1000)));
    state.survival.timerStatus = 'paused';
  }
  save();
  if (!silent) render();
  return true;
}

function timerPause() {
  return pauseSurvivalTimer(false);
}

function timerReset(goDecision = false) {
  stopSurvivalInterval();
  survivalDeadlineMs = 0;
  state.survival = defaultSurvival();
  save();
  if (goDecision && state.step !== 4) go(4);
  else render();
  return true;
}

function toggleDiscard(id, viaKeyboard = false) {
  const numId = Number(id);
  const option = MISSION.options.find(o => o.id === numId);
  if (!option) return false;
  if (isDecisionLocked()) return false;

  if (state.survival.timerStatus === 'running') {
    const cfg = MISSION.survivalConfig;
    const remMs = Math.max(0, survivalDeadlineMs - nowMs());
    state.survival.remainingMs = remMs;
    state.survival.remainingSeconds = Math.max(0, Math.min(cfg.timerDurationSeconds, Math.ceil(remMs / 1000)));
    if (remMs <= 0) {
      stopSurvivalInterval();
      state.survival.timerStatus = 'expired';
      save();
      render();
      return false;
    }
  }

  const current = state.survival.selectedIds;
  if (current.includes(numId)) {
    state.survival.selectedIds = current.filter(x => x !== numId);
  } else {
    if (current.length >= MISSION.survivalConfig.maxDiscards) {
      toast(tr('Solo se permiten 2 descartes. Desmarcá una opción si querés cambiarla.', 'Maximum of 2 discards allowed. Deselect an option to change it.'));
      return false;
    }
    state.survival.selectedIds = [...current, numId];
  }
  save();
  render();
  if (viaKeyboard) $('#srCard-' + numId)?.focus({ preventScroll: true });
  return true;
}

/* --- Pure Evaluation & Resilience Domain Logic (DOM-independent) --- */

function classifyOptionDecision(realType, decision) {
  if (realType === 'trap' && decision === 'discarded') {
    return {
      outcome: 'neutralized',
      tone: 'neutralized',
      icon: '✓',
      badge: ['NEUTRALIZADA', 'NEUTRALIZED'],
      result: ['Neutralizada', 'Neutralized']
    };
  }
  if (realType === 'trap' && decision === 'retained') {
    return {
      outcome: 'active_trap',
      tone: 'active-trap',
      icon: '⚠',
      badge: ['TRAMPA ACTIVA', 'ACTIVE TRAP'],
      result: ['Trampa activa: riesgo residual', 'Active trap: residual risk']
    };
  }
  if (realType === 'valid' && decision === 'retained') {
    return {
      outcome: 'conserved',
      tone: 'conserved',
      icon: '●',
      badge: ['MEDIDA CONSERVADA', 'MEASURE CONSERVED'],
      result: ['Medida vital conservada', 'Vital measure conserved']
    };
  }
  return {
    outcome: 'critical_error',
    tone: 'critical-error',
    icon: '✕',
    badge: ['ERROR CRÍTICO', 'CRITICAL ERROR'],
    result: ['Error crítico: medida vital omitida', 'Critical error: vital measure omitted']
  };
}

function evaluateSurvivalPlan(selectedIds = state.survival.selectedIds) {
  const validOptionIds = new Set(MISSION.options.map(o => o.id));
  const cleanDiscards = Array.isArray(selectedIds)
    ? [...new Set(selectedIds.map(Number))].filter(id => validOptionIds.has(id)).sort((a, b) => a - b)
    : [];
  const discardedSet = new Set(cleanDiscards);

  const items = MISSION.options.map(option => {
    const decision = discardedSet.has(option.id) ? 'discarded' : 'retained';
    const meta = classifyOptionDecision(option.type, decision);
    return {
      id: option.id,
      indicatorKey: option.indicatorKey,
      realType: option.type,
      decision,
      outcome: meta.outcome,
      tone: meta.tone,
      icon: meta.icon,
      title: option.title,
      statement: option.statement,
      decisionLabel: decision === 'discarded'
        ? ['Descartada por el equipo', 'Discarded by team']
        : ['No descartada (conservada)', 'Not discarded (retained)'],
      realClassLabel: option.type === 'valid'
        ? ['Medida preventiva válida', 'Valid preventive measure']
        : ['Trampa técnica / mito ineficaz', 'Technical trap / ineffective myth'],
      badge: meta.badge,
      result: meta.result,
      explanation: decision === 'discarded' ? option.validation.discarded : option.validation.retained,
      simulationData: option.simulation
    };
  });

  return {
    selectedIds: cleanDiscards,
    discardCount: cleanDiscards.length,
    items,
    conserved: items.filter(i => i.outcome === 'conserved'),
    neutralized: items.filter(i => i.outcome === 'neutralized'),
    criticalErrors: items.filter(i => i.outcome === 'critical_error'),
    activeTraps: items.filter(i => i.outcome === 'active_trap')
  };
}

function calculateResilience(evaluationOrSelectedIds = state.survival.selectedIds) {
  const evaluation = evaluationOrSelectedIds && Array.isArray(evaluationOrSelectedIds.items)
    ? evaluationOrSelectedIds
    : evaluateSurvivalPlan(evaluationOrSelectedIds);
  const cfg = MISSION.survivalConfig;
  const validRetained = evaluation.conserved.length;
  const trapsDiscarded = evaluation.neutralized.length;
  const rawScore = (cfg.validKeepPoints * validRetained) + (cfg.trapDiscardPoints * trapsDiscarded);
  const score = Math.round(rawScore);

  let level = 'critical';
  let label = ['CRÍTICO', 'CRITICAL'];
  if (rawScore >= cfg.optimalMinScore) {
    level = 'optimal';
    label = ['ÓPTIMO', 'OPTIMAL'];
  } else if (rawScore >= cfg.compromisedMinScore) {
    level = 'compromised';
    label = ['COMPROMETIDO', 'COMPROMISED'];
  }

  return {
    validRetained,
    trapsDiscarded,
    rawScore,
    score,
    level,
    label
  };
}

function buildDynamicConclusion(evaluation, resilience) {
  const v = resilience.validRetained;
  const n = resilience.trapsDiscarded;
  const errs = evaluation.criticalErrors;
  const traps = evaluation.activeTraps;

  if (v === 3 && n === 2) {
    return [
      'Acierto pleno: el equipo conservó las tres barreras de ingeniería y planificación territorial y neutralizó ambos mitos operativos, logrando la máxima resiliencia del escenario.',
      'Full accuracy: the team preserved all three engineering and land-use safeguards while neutralizing both operational myths, achieving peak scenario resilience.'
    ];
  }
  if (v === 3 && n === 1) {
    const remTrap = traps[0];
    return [
      'Buen criterio estructural: se protegieron las tres medidas vitales, pero permaneció activa una trampa (' + remTrap.title[0] + '), dejando un riesgo conductual o de evacuación evitable.',
      'Strong structural judgement: all three vital measures were preserved, but one trap remained active (' + remTrap.title[1] + '), leaving an avoidable behavioural or evacuation risk.'
    ];
  }
  if (v === 3 && n === 0) {
    return [
      'Infraestructura conservada con riesgo conductual: no se descartaron medidas válidas, pero ambas trampas sísmicas quedaron activas en el protocolo de contingencia.',
      'Infrastructure preserved with behavioural risk: no valid measures were lost, yet both seismic traps stayed active in the contingency protocol.'
    ];
  }
  if (v === 2 && n === 1) {
    const lost = errs[0];
    const remTrap = traps[0];
    return [
      'Plan comprometido: se neutralizó una trampa, pero se descartó por error una medida vital (' + lost.title[0] + ') y siguió activa otra trampa (' + remTrap.title[0] + ').',
      'Compromised plan: one trap was neutralized, but a vital measure was mistakenly discarded (' + lost.title[1] + ') and another trap stayed active (' + remTrap.title[1] + ').'
    ];
  }
  if (v === 2 && n === 2) {
    const lost = errs[0];
    return [
      'Trampas neutralizadas con costo preventivo: se eliminaron los mitos, pero se omitió una medida vital (' + lost.title[0] + ').',
      'Traps neutralized with preventive loss: myths were removed, but one vital measure was omitted (' + lost.title[1] + ').'
    ];
  }
  if (v === 2 && n === 0) {
    const lost = errs[0];
    return [
      'Plan vulnerable: se perdió una medida preventiva vital (' + lost.title[0] + ') sin lograr descartar ninguna de las dos trampas sísmicas.',
      'Vulnerable plan: a vital preventive measure (' + lost.title[1] + ') was lost without discarding either seismic trap.'
    ];
  }
  return [
    'Plan en estado crítico: se descartaron medidas preventivas esenciales (' + errs.map(e => e.title[0]).join(', ') + ') debilitando de forma severa la capacidad de respuesta urbana ante el sismo.',
    'Plan in critical condition: essential preventive measures were discarded (' + errs.map(e => e.title[1]).join(', ') + '), severely weakening urban seismic resilience.'
  ];
}

function buildSimulationSummary(selectedIds = state.survival.selectedIds) {
  const evaluation = evaluateSurvivalPlan(selectedIds);
  const resilience = calculateResilience(evaluation);
  const byKey = Object.fromEntries(evaluation.items.map(item => [item.indicatorKey, item]));

  const hospitalItem = byKey.hospital;
  const gasItem = byKey.gasValves;
  const elevatorItem = byKey.elevators;
  const zoningItem = byKey.zoning;
  const doorMythItem = byKey.doorMyth;

  const indicators = [
    {
      code: 'A',
      key: 'hospitalIntegrity',
      sourceOptionId: hospitalItem.id,
      title: ['A. Integridad hospitalaria', 'A. Hospital integrity'],
      favorable: hospitalItem.decision === 'retained',
      status: hospitalItem.decision === 'retained' ? hospitalItem.simulationData.retainedStatus : hospitalItem.simulationData.discardedStatus,
      detail: hospitalItem.decision === 'retained' ? hospitalItem.simulationData.retainedDetail : hospitalItem.simulationData.discardedDetail
    },
    {
      code: 'B',
      key: 'secondaryFireRisk',
      sourceOptionId: gasItem.id,
      title: ['B. Riesgo de incendios secundarios', 'B. Secondary fire risk'],
      favorable: gasItem.decision === 'retained',
      status: gasItem.decision === 'retained' ? gasItem.simulationData.retainedStatus : gasItem.simulationData.discardedStatus,
      detail: gasItem.decision === 'retained' ? gasItem.simulationData.retainedDetail : gasItem.simulationData.discardedDetail
    },
    {
      code: 'C',
      key: 'evacuationInjuryRisk',
      sourceOptionId: elevatorItem.id,
      title: ['C. Riesgo de lesiones por evacuación', 'C. Evacuation injury risk'],
      favorable: elevatorItem.decision === 'discarded',
      status: elevatorItem.decision === 'discarded' ? elevatorItem.simulationData.discardedStatus : elevatorItem.simulationData.retainedStatus,
      detail: elevatorItem.decision === 'discarded' ? elevatorItem.simulationData.discardedDetail : elevatorItem.simulationData.retainedDetail
    },
    {
      code: 'D',
      key: 'geotechnicalRisk',
      sourceOptionId: zoningItem.id,
      title: ['D. Riesgo geotécnico y estructural', 'D. Geotechnical and structural risk'],
      favorable: zoningItem.decision === 'retained',
      status: zoningItem.decision === 'retained' ? zoningItem.simulationData.retainedStatus : zoningItem.simulationData.discardedStatus,
      detail: zoningItem.decision === 'retained' ? zoningItem.simulationData.retainedDetail : zoningItem.simulationData.discardedDetail
    }
  ];

  const doorFrameBehavioralRisk = {
    key: 'doorFrameMythRisk',
    sourceOptionId: doorMythItem.id,
    title: [
      'Conducta y refugio interior · Mito de los marcos de puertas',
      'Behaviour and interior shelter · Doorway myth'
    ],
    favorable: doorMythItem.decision === 'discarded',
    status: doorMythItem.decision === 'discarded' ? doorMythItem.simulationData.discardedStatus : doorMythItem.simulationData.retainedStatus,
    detail: doorMythItem.decision === 'discarded' ? doorMythItem.simulationData.discardedDetail : doorMythItem.simulationData.retainedDetail
  };

  return {
    evaluation,
    resilience,
    indicators,
    doorFrameBehavioralRisk,
    conclusion: buildDynamicConclusion(evaluation, resilience)
  };
}

/* --- Phase Transitions & Navigation --- */

function confirmEvaluation() {
  if (!canEvaluatePlan()) return false;
  if (state.survival.timerStatus === 'running') {
    pauseSurvivalTimer(true);
  }
  stopSurvivalInterval();
  state.survival.evaluated = true;
  state.survival.closingOpen = false;
  state.survival.phase = 'validation';
  save();
  go(5);
  return true;
}

function advanceToSimulation() {
  if (state.survival.timerStatus === 'running') {
    pauseSurvivalTimer(true);
  }
  stopSurvivalInterval();
  state.survival.evaluated = true;
  state.survival.phase = state.survival.closingOpen ? 'closing' : 'simulation';
  save();
  go(6);
  return true;
}

function focusClosingSection() {
  const heading = $('#closingTitle');
  const section = $('#cierre');
  heading?.focus({ preventScroll: true });
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (section && typeof section.scrollIntoView === 'function') {
    section.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' });
  }
}

function continueToClosing(fromShortcut = false) {
  if (state.step !== 6) return false;
  if (state.survival.closingOpen) {
    if (fromShortcut) return false;
    focusClosingSection();
    return true;
  }
  state.survival.evaluated = true;
  state.survival.closingOpen = true;
  state.survival.phase = 'closing';
  save();
  render();
  focusClosingSection();
  return true;
}

function toast(text) {
  clearTimeout(toastTimeout);
  $('#toast').textContent = text;
  $('#toast').classList.remove('hidden');
  toastTimeout = setTimeout(() => $('#toast').classList.add('hidden'), 3500);
}

function go(n) {
  const next = Math.max(0, Math.min(6, n));
  if (state.step === 4 && next !== 4 && state.survival.timerStatus === 'running') {
    pauseSurvivalTimer(true);
  }
  state.step = next;
  save();
  render();
  $('#pageTitle')?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

function footer() {
  let nextBtn = '<button type="button" class="primary" onclick="go(' + (state.step + 1) + ')" ' + (state.step === 6 ? 'disabled' : '') + '>' + tr('Continuar', 'Continue') + ' →</button>';
  if (state.step === 4) {
    nextBtn = '<button type="button" class="primary" onclick="confirmEvaluation()" ' + (!canEvaluatePlan() ? 'disabled' : '') + '>' + tr('Evaluar Plan Sísmico', 'Evaluate Seismic Plan') + ' →</button>';
  } else if (state.step === 5) {
    nextBtn = '<button type="button" class="primary" onclick="advanceToSimulation()">' + tr('Ejecutar Simulación de Impacto', 'Run Impact Simulation') + ' →</button>';
  } else if (state.step === 6) {
    nextBtn = '<button type="button" class="primary" onclick="continueToClosing()" ' + (state.survival.closingOpen ? 'disabled' : '') + '>' + tr('Continuar con el cierre', 'Continue to closing') + ' →</button>';
  }
  return '<div class="footer"><button type="button" onclick="go(' + (state.step - 1) + ')" ' + (state.step === 0 ? 'disabled' : '') + '>' + tr('Anterior', 'Back') + '</button><span>' + (state.step + 1) + ' / 7 · ' + tr('Decisiones compartidas', 'Shared decisions') + '</span>' + nextBtn + '</div>';
}

function teacher() {
  return state.teacher ? '<aside class="teacher">' + h(tr('Para vos, que coordinás', 'Presenter prompt')) + p(t(MISSION.prompts[state.step])) + '</aside>' : '';
}

function render() {
  clearTimeout(labTimeout);
  document.documentElement.lang = state.lang;
  $('#lang').textContent = state.lang === 'es' ? 'EN' : 'ES';
  $('#teacher').textContent = tr(state.teacher ? 'Ocultar guía' : 'Modo docente', state.teacher ? 'Hide guide' : 'Presenter mode');
  $('#teacher').setAttribute('aria-pressed', String(state.teacher));
  $('#sources').textContent = tr('Fuentes', 'Sources');
  $('#nav').innerHTML = MISSION.labels.map((label, i) => '<button type="button" class="' + (i === state.step ? 'active' : '') + '" onclick="go(' + i + ')" ' + (i === state.step ? 'aria-current="step"' : '') + '><small>0' + (i + 1) + '</small>' + t(label) + '</button>').join('') + box('navfoot', 'CLASSROOM EDITION<br>25–35 MIN<br>' + tr('Un proyector.<br>Todo el curso decide.', 'One projector.<br>The whole class decides.'));
  $('#progress').style.width = (state.step + 1) / 7 * 100 + '%';
  $('#main').innerHTML = pages[state.step]() + teacher() + footer();
  bind();
}

function vote(v) { state.vote = v; save(); render(); }
function setCase(id) { state.case = id; state.visited = [...new Set([...state.visited, id])]; save(); render(); }

function bind() {
  if ($('#soil')) {
    $('#soil').value = state.soil;
    $('#design').value = state.design;
    $('#soil').onchange = e => { state.soil = e.target.value; save(); render(); };
    $('#design').onchange = e => { state.design = e.target.value; save(); render(); };
    $('#run').onclick = lab;
  }
}

function reportText() {
  const sim = buildSimulationSummary();
  const ev = sim.evaluation;
  const res = sim.resilience;
  const lines = [
    'SEISMIC MISSION 3.0 · SURVIVAL RUN',
    new Date().toLocaleDateString(),
    '',
    tr('Descartes seleccionados', 'Selected discards') + ': ' + ev.discardCount + '/' + MISSION.survivalConfig.maxDiscards,
    tr('Índice didáctico de resiliencia urbana', 'Didactic urban resilience index') + ': ' + res.score + '% (' + t(res.label) + ')',
    tr('Nota metodológica: índice formativo basado en las decisiones tomadas; no constituye una predicción científica real de daños o víctimas.', 'Methodological note: educational index based on decisions made; not a real scientific prediction of damage or casualties.'),
    '',
    tr('VALIDACIÓN DE LAS CINCO MEDIDAS', 'VALIDATION OF THE FIVE MEASURES'),
    ...ev.items.map(item =>
      '- [' + t(item.badge) + '] ' + tr('Opción ', 'Option ') + item.id + ' — ' + t(item.title) +
      ' | ' + t(item.decisionLabel) + ' | ' + t(item.realClassLabel) + '\n  ' + t(item.explanation)
    ),
    '',
    tr('SIMULACIÓN POSTEVENTO', 'POST-EVENT SIMULATION'),
    ...sim.indicators.map(ind => '- ' + t(ind.title) + ': ' + t(ind.status) + ' — ' + t(ind.detail)),
    '- ' + t(sim.doorFrameBehavioralRisk.title) + ': ' + t(sim.doorFrameBehavioralRisk.status) + ' — ' + t(sim.doorFrameBehavioralRisk.detail),
    '',
    tr('Conclusión', 'Conclusion') + ': ' + t(sim.conclusion),
    '',
    'SOURCES',
    MISSION.sources.map(x => x.join('\n')).join('\n\n')
  ];
  return lines.join('\n');
}

function downloadReport() {
  const a = document.createElement('a');
  const u = URL.createObjectURL(new Blob([reportText()], { type: 'text/plain;charset=utf-8' }));
  a.href = u;
  a.download = 'seismic-mission-report.txt';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 1500);
}

function resetMission() {
  if (confirm(tr('¿Borrar las decisiones y empezar otra clase?', 'Clear decisions and start a new class?'))) {
    stopSurvivalInterval();
    survivalDeadlineMs = 0;
    const lang = state.lang, teacherMode = state.teacher;
    state = { ...defaults(), lang, teacher: teacherMode };
    save();
    go(0);
  }
}

function modal(html) {
  if ($('#modal').classList.contains('hidden')) modalFocus = document.activeElement;
  $('#modalBody').innerHTML = html;
  $('#modal').classList.remove('hidden');
  document.querySelector('header').inert = true;
  document.querySelector('.shell').inert = true;
  $('#close').focus();
}

function closeModal() {
  $('#modal').classList.add('hidden');
  document.querySelector('header').inert = false;
  document.querySelector('.shell').inert = false;
  if (modalFocus?.isConnected) modalFocus.focus();
}

function openPaper() {
  modal('<h2>' + tr('Investigación original', 'Original research') + '</h2>' + p(tr('Texto de trabajo en inglés. Las cifras del borrador no reciben validación adicional por aparecer aquí. La misión principal utiliza las conclusiones cualitativas.', 'English working paper. Inclusion here does not independently validate the draft’s figures. The main mission uses the qualitative conclusions.')) + '<pre id="paperText"></pre>');
  $('#paperText').textContent = window.RESEARCH_TEXT || tr('No se pudo cargar el texto.', 'The text could not be loaded.');
}

function openSources() {
  modal('<h2>' + tr('La evidencia detrás de la misión', 'Evidence behind the mission') + '</h2>' + p(tr('Los expedientes son reales. El escenario de simulación es didáctico. Las animaciones y puntajes son explicativos y no predicen daños reales.', 'The case studies are real. The simulation scenario is educational. Animations and scores are explanatory and do not predict real damage.')) + MISSION.sources.map(([name, url]) => p('<a href="' + url + '" target="_blank" rel="noopener">' + name + ' ↗</a>')).join('') + btn(tr('Leer el trabajo completo', 'Read the complete paper'), 'openPaper()'));
}

$('#close').onclick = closeModal;
$('#modal').addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Tab') {
    const items = [...$('#modal').querySelectorAll('button,a,[tabindex="0"]')];
    if (items.length === 0) return;
    if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0].focus(); }
  }
});
$('#sources').onclick = openSources;
$('#lang').onclick = () => { state.lang = state.lang === 'es' ? 'en' : 'es'; save(); render(); };
$('#teacher').onclick = () => { state.teacher = !state.teacher; save(); render(); };
$('#full').onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    toast(tr('Este navegador no permite pantalla completa aquí.', 'Fullscreen is unavailable here.'));
  }
};

function handleGlobalKeydown(e) {
  if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
  if (!$('#modal').classList.contains('hidden')) return;
  const target = e.target || {};
  const tag = String(target.tagName || '').toUpperCase();
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || target.isContentEditable) return;

  if (state.step === 4 && ['1', '2', '3', '4', '5'].includes(e.key)) {
    e.preventDefault();
    toggleDiscard(Number(e.key), false);
    $('#pageTitle')?.focus({ preventScroll: true });
    return;
  }

  const interactiveControl = ['BUTTON', 'SUMMARY', 'A'].includes(tag) || Boolean(target.closest && target.closest('button,summary,a'));
  if (interactiveControl) return;

  if (e.code === 'Space' || e.key === ' ') {
    if (state.step === 4) {
      if (!state.survival.evaluated && state.survival.selectedIds.length === MISSION.survivalConfig.maxDiscards) {
        e.preventDefault();
        confirmEvaluation();
      }
      return;
    }
    if (state.step === 5) {
      if (state.survival.evaluated || canEvaluatePlan()) {
        e.preventDefault();
        advanceToSimulation();
      }
      return;
    }
    if (state.step === 6) {
      if (!state.survival.closingOpen) {
        e.preventDefault();
        continueToClosing(true);
      }
      return;
    }
  }

  if (e.key === 'ArrowRight') go(state.step + 1);
  if (e.key === 'ArrowLeft') go(state.step - 1);
}

document.addEventListener('keydown', handleGlobalKeydown);
