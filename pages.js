'use strict';

function renderItemList(items, emptyEs, emptyEn) {
  if (!items.length) return '<p class="sr-empty">' + tr(emptyEs, emptyEn) + '</p>';
  return '<ul class="sr-mini-list">' + items.map(item => '<li><strong>' + tr('Opción ', 'Option ') + item.id + ':</strong> ' + esc(t(item.title)) + '</li>').join('') + '</ul>';
}

const pages = [
  function intro() {
    return box('hero', '<div>' + box('eyebrow', tr('Un misterio bajo tus pies', 'A mystery beneath your feet')) + '<h1 tabindex="-1" id="pageTitle">' + tr('La misma sacudida.<br><em>Distintas historias.</em>', 'The same earthquake.<br><em>Different stories.</em>') + '</h1>' + p(tr('Tu escuela sigue en pie. A unas cuadras, las casas se hundieron. ¿Qué cambió? Hoy el curso es el equipo que tiene que investigarlo.', 'Your school is still standing. A few streets away, homes have sunk. What changed? Today your class is the team investigating why.'), 'lede') + box('actions', btn(tr('Entrar a la misión', 'Enter the mission') + ' →', 'go(1)', 'primary')) + p(tr('Escenario inicial ficticio · evidencia real', 'Fictional opening · real evidence'), 'small') + '</div><div>' + city() + p(tr('No necesitás saber geología. Necesitás observar, discutir y justificar.', 'You do not need to know geology. You need to observe, discuss and explain.'), 'small') + '</div>');
  },
  function prediction() {
    return head(tr('01 / Pensar antes de saber', '01 / Predict before you know'), tr('¿Dónde vivirías vos?', 'Where would you live?'), tr('Mismo terremoto. Distancia parecida a la falla. Dos barrios. Conversalo con quien tenés al lado durante 30 segundos.', 'Same earthquake. Similar fault distance. Two neighbourhoods. Discuss with the person next to you for 30 seconds.')) + box('split', box('flat', box('tag', 'A / ' + tr('RIBERA', 'RIVERSIDE')) + h(tr('Arena húmeda + ladrillo sin refuerzo', 'Wet sand + unreinforced brick')) + p(tr('Casas antiguas sobre arena suelta saturada. Conexiones débiles entre paredes y techos.', 'Older homes on loose saturated sand. Weak connections between walls and roofs.'))) + box('flat', box('tag', 'B / ' + tr('COLINA', 'HILLTOP')) + h(tr('Roca firme + diseño sísmico', 'Firm rock + seismic design')) + p(tr('Edificios con conexiones y refuerzos diseñados para resistir fuerzas sísmicas.', 'Buildings with connections and reinforcement designed to resist seismic forces.')))) + box('poll', [['a', tr('A · Me quedo en Ribera', 'A · Riverside')], ['b', tr('B · Elijo Colina', 'B · Hilltop')], ['c', tr('C · Quiero más datos', 'C · I need more evidence')]].map(([id, label]) => btn(label, "vote('" + id + "')", state.vote === id ? 'chosen' : '')).join('')) + (state.vote ? box('answer', tr('Registrado. Colina suele ser menos vulnerable bajo estas condiciones. Pero ninguna combinación garantiza seguridad: también importan intensidad local, profundidad, distancia y detalles de cada edificio.', 'Recorded. Hilltop is generally less vulnerable under these conditions. But no combination guarantees safety: local intensity, depth, distance and individual building details also matter.')) : '');
  },
  function laboratory() {
    return head(tr('02 / Laboratorio de ideas', '02 / Idea laboratory'), tr('El suelo también participa', 'The ground matters too'), tr('Cambiá una condición por vez. Antes de activar el modelo, predecí qué problema aparecerá.', 'Change one condition at a time. Before running the model, predict what problem might appear.')) + box('split', '<div><div id="labScene">' + city(state.soil, state.design) + '</div>' + p(tr('Animación conceptual. No calcula intensidad, daños ni probabilidades reales. Desplazamientos exagerados para explicar el mecanismo.', 'Conceptual animation. It does not calculate real intensity, damage or probabilities. Movement is exaggerated to explain the mechanism.'), 'small') + '</div><div>' + box('control', '<label for="soil">' + tr('Terreno', 'Ground') + '</label><select id="soil"><option value="rock">' + tr('Roca firme', 'Firm rock') + '</option><option value="soft">' + tr('Suelo blando', 'Soft soil') + '</option><option value="wet">' + tr('Arena suelta saturada', 'Loose saturated sand') + '</option></select>') + box('control', '<label for="design">' + tr('Estructura', 'Structure') + '</label><select id="design"><option value="good">' + tr('Diseño y conexiones sísmicas', 'Seismic design and connections') + '</option><option value="weak">' + tr('Mampostería sin refuerzo', 'Unreinforced masonry') + '</option></select>') + '<button type="button" class="primary" id="run">' + tr('Activar modelo', 'Run model') + '</button><div id="labResult" aria-live="polite"></div></div>') + MISSION.science.slice(0, 3).map(x => detail(t(x.title), t(x.text))).join('');
  },
  function cases() {
    const item = MISSION.cases[state.case], l = state.case === 'loma';
    return head(tr('03 / Evidencia real', '03 / Real evidence'), tr('Dos ciudades. La misma pregunta.', 'Two cities. The same question.')) + box('tabs', btn('Loma Prieta · 1989', "setCase('loma')", l ? 'selected' : '') + btn('Christchurch · 2011', "setCase('christchurch')", !l ? 'selected' : '')) + box('split', '<div>' + box('big accent', item.year) + p(item.date, 'tag') + h(t(item.title)) + p(t(item.intro), 'lede') + '</div>' + box('panel', box('tag', tr('PISTA CENTRAL', 'KEY CLUE')) + p(t(item.clue), 'quote') + '<a target="_blank" rel="noopener" href="' + MISSION.sources[item.source][1] + '">' + tr('Abrir fuente original', 'Open original source') + ' ↗</a>')) + box('evidence', [['ground', tr('Terreno', 'Ground')], ['buildings', tr('Construcción', 'Construction')], ['limits', tr('Otras variables', 'Other variables')]].map(([key, label]) => '<article>' + h(label) + p(t(item[key])) + '</article>').join('')) + detail(t(MISSION.science[3].title), t(MISSION.science[3].text)) + box('actions', btn(tr('Leer la investigación completa', 'Read the complete research'), 'openPaper()')) + p(tr('Texto original en inglés, con el desarrollo completo y su bibliografía.', 'Original English text, including the full argument and bibliography.'), 'small');
  },
  function decisionSlide() {
    const session = state.survival;
    const cfg = MISSION.survivalConfig;
    const count = session.selectedIds.length;
    const locked = isDecisionLocked(session);
    const canEval = canEvaluatePlan(session);
    const meta = getTimerVisualMeta(session);
    const startLabel = session.timerStatus === 'paused' ? tr('Reanudar', 'Resume') : tr('Iniciar', 'Start');
    const disableStart = session.timerStatus === 'running' || locked || session.remainingMs <= 0;
    const disablePause = session.timerStatus !== 'running';

    const consignaBlock =
      '<div class="sr-consigna panel">' +
        '<div class="sr-consigna-main">' +
          '<p class="sr-directive">' +
            tr(
              '«Cinco medidas propuestas. Dos son trampas técnicas o mitos ineficaces. Seleccionen las dos opciones que deben <strong>DESCARTARSE</strong> antes de que el tiempo expire».',
              '“Five proposed measures. Two are technical traps or ineffective myths. Select the two options that must be <strong>DISCARDED</strong> before time expires.”'
            ) +
          '</p>' +
          '<div class="sr-req-row">' +
            '<span class="sr-req-pill">' + tr('Seleccionar exactamente 2 opciones para descartar', 'Select exactly 2 options to discard') + '</span>' +
            '<span class="sr-counter ' + (count === cfg.maxDiscards ? 'is-complete' : '') + '" id="srDiscardCounter" aria-live="polite">' +
              tr('Descartes: ', 'Discards: ') + count + '/' + cfg.maxDiscards +
            '</span>' +
          '</div>' +
        '</div>' +
      '</div>';

    const timerBlock =
      '<div class="sr-timer panel ' + meta.stateClass + '" id="srTimerBox">' +
        '<div class="sr-timer-top">' +
          '<div class="sr-clock-wrap">' +
            '<span class="sr-clock" id="srClock">' + formatSurvivalClock(session.remainingSeconds) + '</span>' +
            '<span class="sr-timer-status" id="srTimerStatus" aria-live="polite">' + meta.statusText + '</span>' +
          '</div>' +
          '<div class="sr-timer-controls">' +
            btn(startLabel, 'timerStart()', 'sr-btn-start', 'id="srStartBtn"' + (disableStart ? ' disabled' : '')) +
            btn(tr('Pausar', 'Pause'), 'timerPause()', '', 'id="srPauseBtn"' + (disablePause ? ' disabled' : '')) +
            btn('Reset', 'timerReset()', '', 'id="srResetBtn"') +
            btn(
              tr('Evaluar Plan Sísmico', 'Evaluate Seismic Plan'),
              'confirmEvaluation()',
              'primary sr-eval-btn',
              'id="srEvaluateBtn"' + (!canEval ? ' disabled' : '')
            ) +
          '</div>' +
        '</div>' +
        '<div class="sr-timer-track" id="srTimerTrack" role="progressbar" aria-label="' + tr('Tiempo restante', 'Remaining time') + '" aria-valuemin="0" aria-valuemax="' + cfg.timerDurationSeconds + '" aria-valuenow="' + session.remainingSeconds + '">' +
          '<div class="sr-timer-fill" id="srTimerBar" style="width:' + meta.pct.toFixed(1) + '%"></div>' +
        '</div>' +
      '</div>';

    const cardsHtml = MISSION.options.map(opt => {
      const isDiscarded = session.selectedIds.includes(opt.id);
      const isMaxedOut = !locked && !isDiscarded && count >= cfg.maxDiscards;
      const cls = [
        'sr-card',
        isDiscarded ? 'is-discarded' : 'is-retained',
        locked ? 'is-locked' : '',
        isMaxedOut ? 'is-maxed' : ''
      ].filter(Boolean).join(' ');

      let badgeHtml;
      if (isDiscarded) {
        badgeHtml = '<span class="sr-card-badge is-discarded">✕ ' + tr('DESCARTADA', 'DISCARDED') + '</span>';
      } else if (locked) {
        badgeHtml = '<span class="sr-card-badge is-locked">' + tr('BLOQUEADA', 'LOCKED') + '</span>';
      } else if (isMaxedOut) {
        badgeHtml = '<span class="sr-card-badge is-muted">' + tr('CUPO 2/2', 'LIMIT 2/2') + '</span>';
      } else {
        badgeHtml = '<span class="sr-card-badge is-active">' + tr('EN PLAN', 'IN PLAN') + '</span>';
      }

      const attrs = [
        'id="srCard-' + opt.id + '"',
        'aria-pressed="' + String(isDiscarded) + '"',
        locked ? 'disabled' : (isMaxedOut ? 'aria-disabled="true"' : '')
      ].filter(Boolean).join(' ');

      return (
        '<button type="button" class="' + cls + '" ' + attrs + ' onclick="toggleDiscard(' + opt.id + ',event.detail===0)">' +
          '<div class="sr-card-head">' +
            '<span class="sr-keycap" aria-hidden="true">' + opt.id + '</span>' +
            '<strong class="sr-card-title">' + tr('Opción ', 'Option ') + opt.id + ' — ' + esc(t(opt.title)) + '</strong>' +
            badgeHtml +
          '</div>' +
          '<p class="sr-card-body">«' + esc(t(opt.statement)) + '»</p>' +
        '</button>'
      );
    }).join('');

    const shortcutHint =
      '<p class="sr-shortcuts small">' +
        tr(
          'Atajos del presentador: teclas [1]–[5] para seleccionar o deseleccionar tarjetas · [Espacio] para confirmar al tener 2 descartes · [Enter] activa el botón enfocado.',
          'Presenter shortcuts: keys [1]–[5] to select or deselect cards · [Space] to confirm when 2 discards are selected · [Enter] activates focused control.'
        ) +
      '</p>';

    return (
      head(
        tr('04 / Survival Run · Descarte de mitos y trampas', '04 / Survival Run · Myth and trap discard'),
        tr('PLAN DE CONTINGENCIA', 'CONTINGENCY PLAN')
      ) +
      consignaBlock +
      timerBlock +
      '<div class="sr-cards" role="group" aria-label="' + tr('Opciones del plan de contingencia', 'Contingency plan options') + '">' +
        cardsHtml +
      '</div>' +
      shortcutHint
    );
  },
  function validationSlide() {
    const ev = evaluateSurvivalPlan();
    const cfg = MISSION.survivalConfig;
    const incompleteNote = ev.discardCount < cfg.maxDiscards
      ? '<p class="sr-incomplete-note">' +
          tr(
            'Se registraron ' + ev.discardCount + ' de ' + cfg.maxDiscards + ' descartes posibles. Se evalúan únicamente las decisiones reales tomadas; las opciones restantes permanecieron activas en el plan.',
            'Recorded ' + ev.discardCount + ' of ' + cfg.maxDiscards + ' possible discards. Only actual decisions are evaluated; remaining options stayed active in the plan.'
          ) +
        '</p>'
      : '';

    const summaryBar =
      '<div class="sr-summary-strip panel">' +
        '<span class="sr-stat-chip"><strong>' + ev.discardCount + '/' + cfg.maxDiscards + '</strong> ' + tr('Descartes aplicados', 'Discards applied') + '</span>' +
        '<span class="sr-stat-chip is-neutralized">✓ <strong>' + ev.neutralized.length + '</strong> ' + tr('Neutralizadas', 'Neutralized') + '</span>' +
        '<span class="sr-stat-chip is-conserved">● <strong>' + ev.conserved.length + '</strong> ' + tr('Conservadas', 'Conserved') + '</span>' +
        '<span class="sr-stat-chip is-critical-error">✕ <strong>' + ev.criticalErrors.length + '</strong> ' + tr('Errores críticos', 'Critical errors') + '</span>' +
        '<span class="sr-stat-chip is-active-trap">⚠ <strong>' + ev.activeTraps.length + '</strong> ' + tr('Trampas activas', 'Active traps') + '</span>' +
      '</div>' +
      incompleteNote;

    const reportCards = ev.items.map(item =>
      '<article class="sr-val-card is-' + item.tone + '">' +
        '<div class="sr-val-top">' +
          '<div>' +
            '<h3 class="sr-val-title">' + tr('Opción ', 'Option ') + item.id + ' — ' + esc(t(item.title)) + '</h3>' +
            '<p class="sr-val-quote">«' + esc(t(item.statement)) + '»</p>' +
          '</div>' +
          '<span class="sr-status-pill is-' + item.tone + '">' + item.icon + ' ' + esc(t(item.badge)) + '</span>' +
        '</div>' +
        '<dl class="sr-val-meta">' +
          '<div><dt>' + tr('Decisión tomada', 'Decision taken') + '</dt><dd>' + esc(t(item.decisionLabel)) + '</dd></div>' +
          '<div><dt>' + tr('Clasificación técnica real', 'Real technical classification') + '</dt><dd>' + esc(t(item.realClassLabel)) + '</dd></div>' +
          '<div><dt>' + tr('Resultado', 'Outcome') + '</dt><dd>' + esc(t(item.result)) + '</dd></div>' +
        '</dl>' +
        '<p class="sr-val-impact">' + esc(t(item.explanation)) + '</p>' +
      '</article>'
    ).join('');

    const navActions =
      '<div class="actions sr-stage-actions">' +
        btn(tr('Ejecutar Simulación de Impacto', 'Run Impact Simulation') + ' →', 'advanceToSimulation()', 'primary', 'id="srRunSimBtn"') +
        btn(tr('Volver a Decisión', 'Back to Decision'), 'go(4)') +
        '<span class="small">' + tr('[Espacio]: ejecutar simulación de impacto', '[Space]: run impact simulation') + '</span>' +
      '</div>';

    return (
      head(
        tr('05 / Survival Run · Validación técnica instantánea', '05 / Survival Run · Instant technical validation'),
        tr('Diagnóstico del plan de contingencia', 'Contingency plan diagnosis'),
        tr('Informe técnico derivado exclusivamente de las decisiones registradas en la fase anterior.', 'Technical report derived exclusively from the decisions recorded in the previous phase.')
      ) +
      summaryBar +
      '<div class="sr-validation-list">' + reportCards + '</div>' +
      navActions
    );
  },
  function simulationSlide() {
    const sim = buildSimulationSummary();
    const ev = sim.evaluation;
    const res = sim.resilience;
    const rawFormatted = String(res.rawScore).replace('.', state.lang === 'es' ? ',' : '.');

    const scoreHero =
      '<div class="sr-sim-hero">' +
        '<div class="sr-score-card panel is-' + res.level + '">' +
          '<div class="eyebrow">' + tr('Índice de resiliencia urbana', 'Urban resilience index') + '</div>' +
          '<div class="sr-score-row">' +
            '<strong class="sr-score-num" id="srResilienceScore">' + res.score + '%</strong>' +
            '<span class="sr-level-pill is-' + res.level + '" id="srResilienceLevel">' + esc(t(res.label)) + '</span>' +
          '</div>' +
          '<div class="sr-meter" aria-hidden="true"><div class="sr-meter-fill is-' + res.level + '" style="width:' + res.score + '%"></div></div>' +
          '<p class="sr-formula small">' +
            tr(
              'Cálculo determinista: 25 × ' + res.validRetained + ' válidas conservadas + 12,5 × ' + res.trapsDiscarded + ' trampas neutralizadas = ' + rawFormatted + ' pts',
              'Deterministic formula: 25 × ' + res.validRetained + ' valid conserved + 12.5 × ' + res.trapsDiscarded + ' traps neutralized = ' + rawFormatted + ' pts'
            ) +
          '</p>' +
        '</div>' +
        '<div class="panel sr-conclusion-card">' +
          '<div class="tag">' + tr('CONCLUSIÓN DINÁMICA DEL ESCENARIO', 'DYNAMIC SCENARIO CONCLUSION') + '</div>' +
          '<p class="sr-conclusion-text">' + esc(t(sim.conclusion)) + '</p>' +
          '<p class="small sr-disclaimer">' +
            tr(
              'Nota metodológica: esta puntuación es un índice didáctico de las decisiones tomadas (ÓPTIMO: 87,5–100 · COMPROMETIDO: 50–87 · CRÍTICO: 0–49). No es un modelo probabilístico ni una estimación real de daños, víctimas o pérdidas.',
              'Methodological note: this score is an educational index of the decisions made (OPTIMAL: 87.5–100 · COMPROMISED: 50–87 · CRITICAL: 0–49). It is not a probabilistic model or a real estimate of damage, casualties or losses.'
            ) +
          '</p>' +
        '</div>' +
      '</div>';

    const indicatorsHtml = sim.indicators.map(ind => {
      const toneCls = ind.favorable ? 'is-favorable' : 'is-vulnerable';
      const icon = ind.favorable ? '✓' : '⚠';
      return (
        '<article class="sr-ind-card panel ' + toneCls + '" data-indicator="' + ind.key + '">' +
          '<div class="sr-ind-head">' +
            '<h3>' + esc(t(ind.title)) + '</h3>' +
            '<span class="sr-ind-badge ' + toneCls + '">' + icon + ' ' + esc(t(ind.status)) + '</span>' +
          '</div>' +
          '<p>' + esc(t(ind.detail)) + '</p>' +
        '</article>'
      );
    }).join('');

    const doorRisk = sim.doorFrameBehavioralRisk;
    const doorTone = doorRisk.favorable ? 'is-favorable' : 'is-vulnerable';
    const doorBlock =
      '<article class="sr-behavior-card panel ' + doorTone + '" id="srDoorMythCard" data-indicator="doorFrameMythRisk">' +
        '<div class="sr-ind-head">' +
          '<h3>' + esc(t(doorRisk.title)) + '</h3>' +
          '<span class="sr-ind-badge ' + doorTone + '">' + (doorRisk.favorable ? '✓ ' : '⚠ ') + esc(t(doorRisk.status)) + '</span>' +
        '</div>' +
        '<p>' + esc(t(doorRisk.detail)) + '</p>' +
      '</article>';

    const breakdownGrid =
      '<div class="sr-breakdown-grid">' +
        '<div class="panel sr-b-box is-conserved">' +
          '<h4>● ' + tr('Medidas válidas conservadas', 'Valid measures conserved') + ' (' + ev.conserved.length + '/3)</h4>' +
          renderItemList(ev.conserved, 'Ninguna medida válida conservada.', 'No valid measures conserved.') +
        '</div>' +
        '<div class="panel sr-b-box is-neutralized">' +
          '<h4>✓ ' + tr('Trampas neutralizadas', 'Neutralized traps') + ' (' + ev.neutralized.length + '/2)</h4>' +
          renderItemList(ev.neutralized, 'Ninguna trampa neutralizada.', 'No traps neutralized.') +
        '</div>' +
        '<div class="panel sr-b-box is-critical-error">' +
          '<h4>✕ ' + tr('Errores críticos cometidos', 'Critical errors committed') + ' (' + ev.criticalErrors.length + ')</h4>' +
          renderItemList(ev.criticalErrors, 'Sin errores críticos.', 'No critical errors.') +
        '</div>' +
        '<div class="panel sr-b-box is-active-trap">' +
          '<h4>⚠ ' + tr('Trampas que permanecen activas', 'Traps remaining active') + ' (' + ev.activeTraps.length + ')</h4>' +
          renderItemList(ev.activeTraps, 'Sin trampas activas.', 'No active traps.') +
        '</div>' +
      '</div>';

    const simActions =
      '<div class="actions sr-stage-actions">' +
        btn(
          tr('Continuar con el cierre', 'Continue to closing') + ' →',
          'continueToClosing()',
          'primary',
          'id="srClosingBtn"' + (state.survival.closingOpen ? ' disabled' : '')
        ) +
        btn(tr('Volver a Validación', 'Back to Validation'), 'go(5)') +
        btn(tr('Reiniciar Survival Run', 'Reset Survival Run'), 'timerReset(true)') +
        (!state.survival.closingOpen ? '<span class="small">' + tr('[Espacio]: continuar con el cierre', '[Space]: continue to closing') + '</span>' : '') +
      '</div>';

    const closingSection = state.survival.closingOpen
      ? '<section id="cierre" class="sr-closing panel" aria-labelledby="closingTitle">' +
          '<div class="eyebrow">' + tr('Sección final de la presentación', 'Final section of the presentation') + '</div>' +
          '<h3 tabindex="-1" id="closingTitle">' + tr('Síntesis final: suelo, estructuras y decisiones basadas en evidencia', 'Final synthesis: ground, structures and evidence-based decisions') + '</h3>' +
          p(tr(
            'La evidencia analizada en el laboratorio y en los expedientes reales (Loma Prieta 1989 y Christchurch 2011) confirma que los daños sísmicos dependen tanto del comportamiento del terreno y la calidad estructural como de protocolos de emergencia técnicamente rigurosos.',
            'Evidence from the laboratory and real case studies (Loma Prieta 1989 and Christchurch 2011) confirms that seismic damage depends on ground behaviour, structural quality and technically sound emergency protocols.'
          )) +
          box('flat',
            h(tr('Última ronda: 20 segundos por equipo', 'Final round: 20 seconds per team')) +
            p(tr('«Antes pensábamos ___. Ahora sostenemos ___, porque la evidencia ___.»', '“We used to think ___. Now we argue ___, because the evidence ___.”'), 'quote')
          ) +
          box('actions',
            btn(tr('Descargar informe de la misión', 'Download mission report'), 'downloadReport()', 'primary') +
            btn(tr('Investigación completa', 'Full research paper'), 'openPaper()') +
            btn(tr('Fuentes documentales', 'Documentary sources'), 'openSources()') +
            btn(tr('Nueva clase', 'New class'), 'resetMission()')
          ) +
          p(storageAvailable
            ? tr('Las decisiones se guardan localmente en este navegador. El informe registra la evaluación didáctica, no predicciones reales de daños.', 'Decisions are stored locally in this browser. The report records the educational assessment, not real damage predictions.')
            : tr('El navegador no permite guardar el progreso local. Descargá el informe antes de cerrar.', 'This browser blocks local storage. Download the report before closing.'),
            'small'
          ) +
        '</section>'
      : '';

    return (
      head(
        tr('06 / Survival Run · Simulación de impacto urbano', '06 / Survival Run · Urban impact simulation'),
        tr('Balance y consecuencias sísmicas', 'Seismic balance and consequences'),
        tr('Estado hipotético postevento calculado de forma determinista a partir del plan evaluado.', 'Hypothetical post-event status deterministically computed from the evaluated plan.')
      ) +
      scoreHero +
      '<h3 class="sr-section-heading">' + tr('Indicadores independientes del escenario postevento', 'Independent post-event scenario indicators') + '</h3>' +
      '<div class="sr-indicators-grid">' + indicatorsHtml + '</div>' +
      doorBlock +
      breakdownGrid +
      simActions +
      closingSection
    );
  }
];

render();
