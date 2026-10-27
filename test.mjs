import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

function boot(saved = null, denyStorage = false) {
  const nodes = new Map();
  const activeIntervals = new Map();
  const docListeners = new Map();
  let nextIntervalId = 1;
  let fakeNow = 1_700_000_000_000;

  function makeClassList(initialHidden = false) {
    const set = new Set(initialHidden ? ['hidden'] : []);
    return {
      add(...cls) { cls.forEach(c => set.add(c)); },
      remove(...cls) { cls.forEach(c => set.delete(c)); },
      contains(c) { return set.has(c); }
    };
  }

  function node(key) {
    if (!nodes.has(key)) {
      nodes.set(key, {
        innerHTML: '',
        textContent: '',
        value: '',
        className: '',
        style: {},
        classList: makeClassList(key === '#modal' || key === '#toast'),
        setAttribute(k, v) { this[k] = v; },
        addEventListener() {},
        focus() {},
        scrollIntoView() { this.scrolled = true; },
        inert: false
      });
    }
    return nodes.get(key);
  }

  let memory = saved;
  class FakeDate extends Date {
    constructor(...args) {
      if (args.length === 0) super(fakeNow);
      else super(...args);
    }
    static now() { return fakeNow; }
  }

  const context = {
    console,
    Blob,
    URL,
    Date: FakeDate,
    Math: Object.create(Math, {
      random: {
        value() {
          throw new Error('Randomness is forbidden in deterministic evaluation/simulation');
        }
      }
    }),
    setTimeout: () => 1,
    clearTimeout() {},
    setInterval(fn, ms) {
      const id = nextIntervalId++;
      activeIntervals.set(id, { fn, ms });
      return id;
    },
    clearInterval(id) {
      activeIntervals.delete(id);
    },
    confirm: () => true,
    matchMedia: () => ({ matches: true }),
    localStorage: {
      getItem() {
        if (denyStorage) throw new Error('disabled');
        return memory;
      },
      setItem(_k, v) {
        if (denyStorage) throw new Error('disabled');
        memory = v;
      }
    },
    document: {
      querySelector: node,
      documentElement: { lang: 'es' },
      activeElement: { tagName: 'BODY' },
      addEventListener(type, fn) {
        if (!docListeners.has(type)) docListeners.set(type, []);
        docListeners.get(type).push(fn);
      },
      body: { append() {} },
      createElement() { return { click() {}, remove() {} }; }
    },
    scrollTo() {}
  };
  context.window = context;
  vm.createContext(context);

  for (const file of ['content.js', 'research.js', 'app.js', 'visual.js', 'pages.js']) {
    vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), context, { filename: file });
  }

  return {
    run: code => vm.runInContext(code, context),
    nodes,
    activeIntervals,
    advanceTime(ms) {
      fakeNow += ms;
      for (const entry of [...activeIntervals.values()]) {
        entry.fn();
      }
    },
    keydown(eventProps) {
      let prevented = false;
      const ev = {
        key: '',
        code: '',
        repeat: false,
        ctrlKey: false,
        altKey: false,
        metaKey: false,
        target: { tagName: 'BODY' },
        preventDefault() { prevented = true; },
        ...eventProps
      };
      for (const fn of docListeners.get('keydown') || []) fn(ev);
      return prevented;
    }
  };
}

/* 1. Render all 7 slides in ES and EN & check earlier slides still work */
{
  const app = boot();
  for (const lang of ['es', 'en']) {
    app.run(`state.lang='${lang}'`);
    for (let i = 0; i < 7; i++) {
      app.run(`go(${i})`);
      const html = app.nodes.get('#main').innerHTML;
      assert.ok(html.length > 400, `Slide ${i + 1} (${lang}) should render substantial markup`);
      assert.ok(!html.includes('undefined'), `Slide ${i + 1} (${lang}) must not render undefined`);
    }
  }
  app.run("state.lang='es'");
  app.run("go(1); vote('b')");
  assert.equal(app.run('state.vote'), 'b');
  app.run("go(2); state.soil='wet'; state.design='good'; lab()");
  assert.ok(app.nodes.get('#labResult').innerHTML.includes('terreno'));
  app.run("go(3); setCase('christchurch')");
  assert.ok(app.run("state.visited.includes('christchurch')"));
  assert.ok(app.run('window.RESEARCH_TEXT.length') > 10000);
}

/* 2. Old budget/credits system completely absent from slides 5, 6, 7 & no secret tags leaked on slide 5 */
{
  const app = boot();
  for (const step of [4, 5, 6]) {
    app.run(`go(${step})`);
    const html = app.nodes.get('#main').innerHTML;
    assert.ok(!/créditos|presupuesto|fictional cost|costo ficticio/i.test(html), `Slide ${step + 1} must not mention credits or budget`);
    assert.ok(!html.includes('class="cost"'), `Slide ${step + 1} must not render old cost spans`);
  }
  app.run('go(4)');
  const slide5Html = app.nodes.get('#main').innerHTML;
  assert.ok(slide5Html.includes('PLAN DE CONTINGENCIA'));
  assert.ok(slide5Html.includes('Cinco medidas propuestas. Dos son trampas técnicas o mitos ineficaces.'));
  assert.ok(slide5Html.includes('Descartes: 0/2'));
  assert.ok(!/\[VALID\]|\[TRAP\]|is-trap|data-type/i.test(slide5Html), 'Slide 5 must not leak internal trap/valid classifications');
  assert.equal(app.run('typeof cost'), 'undefined');
  assert.equal(app.run('typeof total'), 'undefined');
}

/* 3. Timer lifecycle: starts stopped at 30s, timestamp countdown, pause/resume single interval, reset, non-negative, cleanup on slide leave */
{
  const app = boot();
  app.run('go(4)');
  assert.equal(app.run('state.survival.remainingSeconds'), 30);
  assert.equal(app.run('state.survival.timerStatus'), 'idle');
  assert.equal(app.activeIntervals.size, 0, 'Timer must start stopped on entering Slide 5');

  // Start timer; repeated calls must not duplicate intervals
  app.run('timerStart()');
  app.run('timerStart()');
  assert.equal(app.activeIntervals.size, 1, 'Must never create duplicate intervals');
  assert.equal(app.run('state.survival.timerStatus'), 'running');

  // Advance 12.4 seconds via real timestamps -> ceil(17.6) = 18s
  app.advanceTime(12_400);
  assert.equal(app.run('state.survival.remainingSeconds'), 18);

  // Pause & resume multiple times -> still at most 1 active interval
  app.run('timerPause()');
  assert.equal(app.activeIntervals.size, 0, 'Pause must clear interval');
  assert.equal(app.run('state.survival.timerStatus'), 'paused');

  app.advanceTime(5_000); // Time passing while paused must not reduce remaining time
  assert.equal(app.run('state.survival.remainingSeconds'), 18);

  app.run('timerStart()');
  assert.equal(app.activeIntervals.size, 1, 'Resume creates exactly one interval');

  // Enter warning zone (<= 10s)
  app.advanceTime(8_000); // 17.6s - 8s = 9.6s -> 10s
  assert.equal(app.run('state.survival.remainingSeconds'), 10);
  assert.ok(app.nodes.get('#srTimerBox').className.includes('is-warning'), 'Last 10 seconds must trigger warning visual state');

  // Accidental navigation away from Slide 5 must stop hidden interval
  app.run('go(3)');
  assert.equal(app.activeIntervals.size, 0, 'Navigating away from Slide 5 must clean up active interval');
  assert.equal(app.run('state.survival.timerStatus'), 'paused');

  // Resume on Slide 5 and jump way past zero -> never negative
  app.run('go(4); timerStart()');
  app.advanceTime(95_000);
  assert.equal(app.run('state.survival.remainingMs'), 0);
  assert.equal(app.run('state.survival.remainingSeconds'), 0);
  assert.equal(app.run('state.survival.timerStatus'), 'expired');
  assert.equal(app.activeIntervals.size, 0, 'Expiration must clean up interval');

  // Reset restores 30s and unlocks session
  app.run('timerReset()');
  assert.equal(app.run('state.survival.remainingSeconds'), 30);
  assert.equal(app.run('state.survival.remainingMs'), 30_000);
  assert.equal(app.run('state.survival.timerStatus'), 'idle');
  assert.equal(app.run('isDecisionLocked()'), false);
}

/* 4. Selection rules: select/deselect, max 2 cap, button enablement, timeout lock & incomplete decisions */
{
  const app = boot();
  app.run('go(4)');
  assert.equal(app.run('canEvaluatePlan()'), false);
  assert.ok(app.nodes.get('#main').innerHTML.includes('id="srEvaluateBtn" disabled'));

  // Select 1 and 2
  assert.equal(app.run('toggleDiscard(2)'), true);
  assert.ok(app.nodes.get('#main').innerHTML.includes('Descartes: 1/2'));
  assert.ok(app.nodes.get('#main').innerHTML.includes('DESCARTADA'));
  assert.equal(app.run('canEvaluatePlan()'), false);

  assert.equal(app.run('toggleDiscard(4)'), true);
  assert.ok(app.nodes.get('#main').innerHTML.includes('Descartes: 2/2'));
  assert.equal(app.run('canEvaluatePlan()'), true);
  assert.ok(!app.nodes.get('#main').innerHTML.includes('id="srEvaluateBtn" disabled'));

  // 3rd selection blocked
  assert.equal(app.run('toggleDiscard(1)'), false);
  assert.deepEqual(Array.from(app.run('state.survival.selectedIds')), [2, 4]);

  // Deselect while still unlocked
  assert.equal(app.run('toggleDiscard(4)'), true);
  assert.deepEqual(Array.from(app.run('state.survival.selectedIds')), [2]);
  assert.equal(app.run('canEvaluatePlan()'), false);

  // Timeout with only 1 selection preserves real choice, locks cards, enables evaluate without inventing choices
  app.run('timerStart()');
  app.advanceTime(31_000);
  assert.equal(app.run('isDecisionLocked()'), true);
  assert.equal(app.run('canEvaluatePlan()'), true);
  assert.equal(app.run('toggleDiscard(4)'), false, 'Cannot add selections after timeout');
  assert.equal(app.run('toggleDiscard(2)'), false, 'Cannot remove selections after timeout');
  assert.deepEqual(Array.from(app.run('state.survival.selectedIds')), [2]);

  app.run('confirmEvaluation()');
  assert.equal(app.run('state.step'), 5);
  assert.equal(app.run('evaluateSurvivalPlan().discardCount'), 1);
  assert.equal(app.run('evaluateSurvivalPlan().items.length'), 5);
}

/* 5. Keyboard shortcuts & Spacebar state machine & repeat/input protection */
{
  const app = boot();
  app.run('go(4)');

  // Keys inside INPUT/SELECT must be ignored
  app.keydown({ key: '1', target: { tagName: 'INPUT' } });
  assert.equal(app.run('state.survival.selectedIds.length'), 0);

  // Key '2' selects Option 2; repeated keydown (e.repeat=true) is ignored
  app.keydown({ key: '2' });
  app.keydown({ key: '2', repeat: true });
  assert.deepEqual(Array.from(app.run('state.survival.selectedIds')), [2]);

  // Space with < 2 selections MUST NOT confirm incomplete evaluation
  app.keydown({ key: ' ', code: 'Space' });
  assert.equal(app.run('state.step'), 4);
  assert.equal(app.run('state.survival.evaluated'), false);

  // Select second card with key '4'
  app.keydown({ key: '4' });
  assert.deepEqual(Array.from(app.run('state.survival.selectedIds')), [2, 4]);

  // Space on focused BUTTON must not trigger global shortcut duplicate transition
  app.keydown({ key: ' ', code: 'Space', target: { tagName: 'BUTTON' } });
  assert.equal(app.run('state.step'), 4);

  // Space on Slide 5 with 2 selections confirms evaluation -> moves to Slide 6 (step 5)
  app.keydown({ key: ' ', code: 'Space' });
  assert.equal(app.run('state.step'), 5);
  assert.equal(app.run('state.survival.evaluated'), true);

  // Repeated Space (e.repeat=true) does not skip Slide 6
  app.keydown({ key: ' ', code: 'Space', repeat: true });
  assert.equal(app.run('state.step'), 5);

  // Space on Slide 6 advances to Simulation -> Slide 7 (step 6)
  app.keydown({ key: ' ', code: 'Space' });
  assert.equal(app.run('state.step'), 6);
  assert.equal(app.run('state.survival.closingOpen'), false);

  // Space on Slide 7 opens final closing section (#cierre) once, and second press does not duplicate transition
  const firstClose = app.keydown({ key: ' ', code: 'Space' });
  assert.equal(firstClose, true);
  assert.equal(app.run('state.survival.closingOpen'), true);
  assert.ok(app.nodes.get('#main').innerHTML.includes('id="cierre"'));
  const secondClose = app.keydown({ key: ' ', code: 'Space' });
  assert.equal(secondClose, false, 'Repeated Space on Slide 7 after closing is open must be a no-op');
}

/* 6. Validation matrix (Tests 11-16) & Resilience scoring + Simulation independence (Tests 17-24) */
{
  const app = boot();

  // Case A: Perfect plan — discard traps [2, 4], keep valid [1, 3, 5] => 100 pts, ÓPTIMO
  const simOptimal = app.run('buildSimulationSummary([2, 4])');
  assert.equal(simOptimal.evaluation.items.length, 5);
  assert.equal(simOptimal.resilience.score, 100);
  assert.equal(simOptimal.resilience.label[0], 'ÓPTIMO');
  assert.equal(simOptimal.evaluation.neutralized.length, 2);
  assert.equal(simOptimal.evaluation.conserved.length, 3);
  assert.equal(simOptimal.evaluation.criticalErrors.length, 0);
  assert.equal(simOptimal.evaluation.activeTraps.length, 0);

  // Verify exact outcome classifications (Tests 11, 14)
  const byIdOpt = Object.fromEntries(simOptimal.evaluation.items.map(i => [i.id, i]));
  assert.equal(byIdOpt[2].outcome, 'neutralized');
  assert.equal(byIdOpt[2].result[0], 'Neutralizada');
  assert.equal(byIdOpt[1].outcome, 'conserved');
  assert.equal(byIdOpt[1].badge[0], 'MEDIDA CONSERVADA');

  // Case B: Worst theoretical case — discard all 3 valid [1, 3, 5], retain both traps [2, 4] => 0 pts, CRÍTICO (Test 18)
  const simZero = app.run('buildSimulationSummary([1, 3, 5])');
  assert.equal(simZero.resilience.score, 0);
  assert.equal(simZero.resilience.label[0], 'CRÍTICO');
  const byIdZero = Object.fromEntries(simZero.evaluation.items.map(i => [i.id, i]));
  assert.equal(byIdZero[1].outcome, 'critical_error');
  assert.ok(byIdZero[1].result[0].startsWith('Error crítico'));
  assert.equal(byIdZero[4].outcome, 'active_trap');
  assert.ok(byIdZero[4].result[0].startsWith('Trampa activa'));

  // Case C: Intermediate threshold checks
  // [2] => 3 valid (75) + 1 trap (12.5) = 87.5 => rounded 88, ÓPTIMO
  const sim88 = app.run('buildSimulationSummary([2])');
  assert.equal(sim88.resilience.rawScore, 87.5);
  assert.equal(sim88.resilience.score, 88);
  assert.equal(sim88.resilience.label[0], 'ÓPTIMO');

  // [] => 3 valid (75) + 0 traps (0) = 75 => COMPROMETIDO
  const sim75 = app.run('buildSimulationSummary([])');
  assert.equal(sim75.resilience.score, 75);
  assert.equal(sim75.resilience.label[0], 'COMPROMETIDO');

  // [1, 2] => 2 valid (50) + 1 trap (12.5) = 62.5 => rounded 63, COMPROMETIDO
  const sim63 = app.run('buildSimulationSummary([1, 2])');
  assert.equal(sim63.resilience.score, 63);
  assert.equal(sim63.resilience.label[0], 'COMPROMETIDO');

  // [1] => 2 valid (50) + 0 traps (0) = 50 => COMPROMETIDO
  const sim50 = app.run('buildSimulationSummary([1])');
  assert.equal(sim50.resilience.score, 50);
  assert.equal(sim50.resilience.label[0], 'COMPROMETIDO');

  // [1, 3] => 1 valid (25) + 0 traps (0) = 25 => CRÍTICO
  const sim25 = app.run('buildSimulationSummary([1, 3])');
  assert.equal(sim25.resilience.score, 25);
  assert.equal(sim25.resilience.label[0], 'CRÍTICO');

  // Determinism check (Test 16 & 22)
  const runA = JSON.stringify(app.run('buildSimulationSummary([1, 4])'));
  const runB = JSON.stringify(app.run('buildSimulationSummary([4, 1])'));
  assert.equal(runA, runB, 'Evaluation and simulation must be completely deterministic regardless of selection order');

  // Indicator independence & separate myths check (Tests 19 & 20)
  // Discard only Option 2 (doorway myth), retain Option 4 (elevators)
  const onlyDoorDiscarded = app.run('buildSimulationSummary([2])');
  const indMap1 = Object.fromEntries(onlyDoorDiscarded.indicators.map(i => [i.key, i]));
  assert.equal(onlyDoorDiscarded.doorFrameBehavioralRisk.favorable, true, 'Doorway myth discarded -> favourable');
  assert.equal(indMap1.evacuationInjuryRisk.favorable, false, 'Elevator trap retained -> vulnerable');

  // Discard only Option 4 (elevators), retain Option 2 (doorway myth)
  const onlyElevDiscarded = app.run('buildSimulationSummary([4])');
  const indMap2 = Object.fromEntries(onlyElevDiscarded.indicators.map(i => [i.key, i]));
  assert.equal(onlyElevDiscarded.doorFrameBehavioralRisk.favorable, false, 'Doorway myth retained -> vulnerable');
  assert.equal(indMap2.evacuationInjuryRisk.favorable, true, 'Elevator trap discarded -> favourable');

  // Check Hospital (1), Gas (3), Zoning (5) respond strictly to their own options
  const discardHospGas = app.run('buildSimulationSummary([1, 3])');
  const indMap3 = Object.fromEntries(discardHospGas.indicators.map(i => [i.key, i]));
  assert.equal(indMap3.hospitalIntegrity.favorable, false);
  assert.equal(indMap3.secondaryFireRisk.favorable, false);
  assert.equal(indMap3.geotechnicalRisk.favorable, true);

  const discardZoning = app.run('buildSimulationSummary([5])');
  const indMap4 = Object.fromEntries(discardZoning.indicators.map(i => [i.key, i]));
  assert.equal(indMap4.hospitalIntegrity.favorable, true);
  assert.equal(indMap4.secondaryFireRisk.favorable, true);
  assert.equal(indMap4.geotechnicalRisk.favorable, false);
}

/* 7. State persistence across navigation 5 <-> 6 <-> 7 & Final button destination (Tests 21 & 24) */
{
  const app = boot();
  app.run('go(4); toggleDiscard(2); toggleDiscard(4); confirmEvaluation()');
  assert.equal(app.run('state.step'), 5);
  assert.ok(app.nodes.get('#main').innerHTML.includes('Ejecutar Simulación de Impacto'));

  app.run('advanceToSimulation()');
  assert.equal(app.run('state.step'), 6);
  assert.ok(app.nodes.get('#main').innerHTML.includes('100%'));
  assert.ok(app.nodes.get('#main').innerHTML.includes('ÓPTIMO'));
  assert.ok(app.nodes.get('#main').innerHTML.includes('Continuar con el cierre'));

  // Navigate back and forth between 5, 6, 7 and 2 -> decisions and score must remain intact
  app.run('go(4)');
  assert.deepEqual(Array.from(app.run('state.survival.selectedIds')), [2, 4]);
  assert.equal(app.run('isDecisionLocked()'), true);
  app.run('go(1); go(5); go(6)');
  assert.ok(app.nodes.get('#main').innerHTML.includes('100%'));
  assert.ok(app.nodes.get('#main').innerHTML.includes('ÓPTIMO'));

  // Click final button ('Continuar con el cierre') -> reveals & focuses #cierre
  app.run('continueToClosing()');
  assert.equal(app.run('state.survival.closingOpen'), true);
  assert.ok(app.nodes.get('#main').innerHTML.includes('id="cierre"'));
  assert.ok(app.run('reportText()').includes('100% (ÓPTIMO)'));
}

/* 8. Corrupt/blocked localStorage resilience & offline bundle check */
{
  const corrupted = boot('{"step":999,"survival":{"selectedIds":[1,2,3,99,"A"],"remainingMs":-500,"timerStatus":"running"}}');
  assert.equal(corrupted.run('state.step'), 0);
  assert.equal(corrupted.run('state.survival.selectedIds.length'), 2);
  assert.equal(corrupted.run('state.survival.remainingMs'), 0);
  assert.equal(corrupted.run('state.survival.timerStatus'), 'expired');

  const legacyStorage = boot('{"step":4,"selected":["A","B"],"remaining":180,"running":true}');
  assert.equal(legacyStorage.run('state.survival.remainingSeconds'), 30);
  assert.equal(legacyStorage.run('state.survival.selectedIds.length'), 0);

  const unavailable = boot(null, true);
  unavailable.run('go(6)');
  assert.equal(unavailable.run('storageAvailable'), false);

  const invalidJSON = boot('{bad');
  assert.equal(invalidJSON.run('state.step'), 0);

  const offline = fs.readFileSync(path.join(dir, 'Seismic-Mission-offline.html'), 'utf8');
  assert.ok(!offline.includes('<script src='));
  assert.ok(!offline.includes('href="style.css"'));
  assert.ok(offline.includes('PLAN DE CONTINGENCIA'));
  assert.ok(offline.includes('Ejecutar Simulación de Impacto'));
  assert.ok(offline.includes('Continuar con el cierre'));
}

console.log('PASS: All 27 Survival Run checks, bilingual slides 1–7, timer timestamps, keyboard state machine, deterministic scoring, storage safety & offline bundle verified.');
