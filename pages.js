'use strict';

function renderItemList(items, emptyEs, emptyEn) {
  if (!items.length) return '<p class="sr-empty">' + tr(emptyEs, emptyEn) + '</p>';
  return '<ul class="sr-mini-list">' + items.map(item => '<li><strong>' + tr('Opción ', 'Option ') + item.id + ':</strong> ' + esc(t(item.title)) + '</li>').join('') + '</ul>';
}

const pages = [
  function intro() {
    return box('hero', '<div>' + box('eyebrow', tr('Un misterio bajo tus pies', 'A mystery beneath your feet')) + '<h1 tabindex="-1" id="pageTitle">' + tr('La misma sacudida.<br><em>Distintas historias.</em>', 'The same earthquake.<br><em>Different stories.</em>') + '</h1>' + p(tr('Tu escuela sigue en pie. A unas cuadras, las casas se hundieron. ¿Qué cambió? Hoy el curso es el equipo que tiene que investigarlo.', 'Your school is still standing. A few streets away, homes have sunk. What changed? Today your class is the team investigating why.'), 'lede') + box('actions', btn(tr('Entrar a la misión', 'Enter the mission') + ' →', 'go(1)', 'primary')) + '</div><div>' + city() + '</div>');
  },
  function prediction() {
    return head(tr('01 / Pensar antes de saber', '01 / Predict before you know'), tr('¿Dónde vivirías vos?', 'Where would you live?'), tr('Mismo terremoto. Distancia parecida a la falla. Dos barrios. Conversalo con quien tenés al lado durante 30 segundos.', 'Same earthquake. Similar fault distance. Two neighbourhoods. Discuss with the person next to you for 30 seconds.')) + box('split', box('flat', box('tag', 'A / ' + tr('RIBERA', 'RIVERSIDE')) + h(tr('Arena húmeda + ladrillo sin refuerzo', 'Wet sand + unreinforced brick')) + p(tr('Casas antiguas sobre arena suelta saturada. Conexiones débiles entre paredes y techos.', 'Older homes on loose saturated sand. Weak connections between walls and roofs.'))) + box('flat', box('tag', 'B / ' + tr('COLINA', 'HILLTOP')) + h(tr('Roca firme + diseño sísmico', 'Firm rock + seismic design')) + p(tr('Edificios con conexiones y refuerzos diseñados para resistir fuerzas sísmicas.', 'Buildings with connections and reinforcement designed to resist seismic forces.')))) + box('poll', [
      ['a', tr('A · Me quedo en Ribera', 'A · Riverside'), tr('Ribera es la opción más vulnerable: la arena húmeda puede amplificar la sacudida o licuarse, y el ladrillo sin refuerzo resiste poco.', 'Riverside is the more vulnerable choice: wet sand can amplify shaking or liquefy, and unreinforced brick resists poorly.')],
      ['b', tr('B · Elijo Colina', 'B · Hilltop'), tr('Colina suele ser menos vulnerable: roca firme y diseño sísmico. Pero ninguna combinación garantiza seguridad total.', 'Hilltop is generally less vulnerable: firm rock and seismic design. But no combination guarantees complete safety.')]
    ].map(([id, label, feedback]) => '<div class="poll-option">' + btn(label, "vote('" + id + "')", state.vote === id ? 'chosen' : '') + (state.vote ? box('answer', feedback) : '') + '</div>').join(''));
  },
  function laboratory() {
    return head(tr('02 / Laboratorio de ideas', '02 / Idea laboratory'), tr('El suelo también participa', 'The ground matters too'), tr('Cambiá una condición por vez. Antes de activar el modelo, predecí qué problema aparecerá.', 'Change one condition at a time. Before running the model, predict what problem might appear.')) + box('split', '<div><div id="labScene">' + city(state.soil, state.design) + '</div></div><div>' + box('control', '<label for="soil">' + tr('Terreno', 'Ground') + '</label><select id="soil"><option value="rock">' + tr('Roca firme', 'Firm rock') + '</option><option value="soft">' + tr('Suelo blando', 'Soft soil') + '</option><option value="wet">' + tr('Arena suelta saturada', 'Loose saturated sand') + '</option></select>') + box('control', '<label for="design">' + tr('Estructura', 'Structure') + '</label><select id="design"><option value="good">' + tr('Diseño y conexiones sísmicas', 'Seismic design and connections') + '</option><option value="weak">' + tr('Mampostería sin refuerzo', 'Unreinforced masonry') + '</option></select>') + '<button type="button" class="primary" id="run">' + tr('Activar modelo', 'Run model') + '</button><div id="labResult" aria-live="polite"></div></div>') + MISSION.science.slice(0, 3).map(x => detail(t(x.title), t(x.text))).join('');
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

    const consignaBlock =
      '<div class="sr-consigna panel">' +
        '<div class="sr-consigna-main">' +
          '<p class="sr-directive">' +
            tr(
              '«Cinco medidas propuestas. Dos son trampas técnicas o mitos ineficaces. Seleccionen las dos opciones que deben <strong>DESCARTARSE</strong>».',
              '“Five proposed measures. Two are technical traps or ineffective myths. Select the two options that must be <strong>DISCARDED</strong>.”'
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

    const evalBlock =
      '<div class="actions sr-stage-actions">' +
        btn(tr('Evaluar Plan Sísmico', 'Evaluate Seismic Plan'), 'confirmEvaluation()', 'primary sr-eval-btn', 'id="srEvaluateBtn"' + (!canEval ? ' disabled' : '')) +
        btn(tr('Reiniciar selección', 'Reset selection'), 'timerReset()', '', 'id="srResetBtn"') +
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

    return (
      head(
        tr('04 / Survival Run · Descarte de mitos y trampas', '04 / Survival Run · Myth and trap discard'),
        tr('PLAN DE CONTINGENCIA', 'CONTINGENCY PLAN')
      ) +
      consignaBlock +
      '<div class="sr-cards" role="group" aria-label="' + tr('Opciones del plan de contingencia', 'Contingency plan options') + '">' +
        cardsHtml +
      '</div>' +
      evalBlock
    );
  },
  function validationSlide() {
    const ev = evaluateSurvivalPlan();

    const summaryBar =
      '<div class="sr-summary-strip panel">' +
        '<span class="sr-stat-chip is-neutralized">✓ <strong>' + ev.neutralized.length + '/2</strong> ' + tr('Trampas descartadas', 'Traps discarded') + '</span>' +
        '<span class="sr-stat-chip is-conserved">● <strong>' + ev.conserved.length + '/3</strong> ' + tr('Medidas conservadas', 'Measures kept') + '</span>' +
      '</div>';

    const reportCards = ev.items.map(item =>
      '<article class="sr-val-card is-' + item.tone + '">' +
        '<div class="sr-val-top">' +
          '<h3 class="sr-val-title">' + tr('Opción ', 'Option ') + item.id + ' — ' + esc(t(item.title)) + '</h3>' +
          '<span class="sr-status-pill is-' + item.tone + '">' + item.icon + ' ' + esc(t(item.badge)) + '</span>' +
        '</div>' +
        '<p class="sr-val-impact">' + esc(t(item.short)) + '</p>' +
      '</article>'
    ).join('');

    return (
      head(
        tr('05 / Survival Run · Validación', '05 / Survival Run · Validation'),
        tr('¿Cómo les fue?', 'How did you do?')
      ) +
      summaryBar +
      '<div class="sr-validation-list">' + reportCards + '</div>'
    );
  },
  function simulationSlide() {
    return (
      '<section id="cierre" class="sr-closing" aria-labelledby="pageTitle">' +
        head(
          tr('06 / Cierre', '06 / Closing'),
          tr('Conclusión', 'Conclusion')
        ) +
        p(tr(
          'El daño de un terremoto no depende solo de su magnitud: también importan el suelo donde se construye, la calidad de los edificios y saber cómo actuar.',
          'Earthquake damage does not depend on magnitude alone: the ground we build on, the quality of buildings and knowing how to act also matter.'
        ), 'lede') +
        box('flat',
          h(tr('Última ronda', 'Final round')) +
          p(tr('«Antes pensábamos ___. Ahora sostenemos ___, porque la evidencia ___.»', '“We used to think ___. Now we argue ___, because the evidence ___.”'), 'quote')
        ) +
        box('actions',
          btn(tr('Descargar informe de la misión', 'Download mission report'), 'downloadReport()', 'primary') +
          btn(tr('Investigación completa', 'Full research paper'), 'openPaper()') +
          btn(tr('Fuentes documentales', 'Documentary sources'), 'openSources()') +
          btn(tr('Nueva clase', 'New class'), 'resetMission()')
        ) +
      '</section>'
    );
  }
];

render();
