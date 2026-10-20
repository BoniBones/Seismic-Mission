# Seismic Mission 3.0

**Why Do Earthquakes Damage Some Places More Than Others?**

An English-language, presenter-controlled science exhibition for students aged 15–16. One computer and one projector run the entire lesson. Students predict, discuss, raise hands, explain and give peer feedback. No accounts, phones, QR codes or external services are required.

## Open it now

1. Download the project ZIP from the version 3 branch or pull request and extract it.
2. Double-click **`Seismic-Mission-offline.html`** in Chrome, Edge or Firefox. This is the recommended classroom file; it contains the whole application and original research.
3. Open **Session**. Set the presentation date, optional class label and optional number of students.
4. Use **Fullscreen**, then **Begin the investigation**. Run the discussion with students speaking and raising hands; the presenter controls everything.

No installation or internet connection is needed for the standalone file. You can also open `index.html` directly if its neighbouring CSS/JS files remain together. Source bibliography links need internet; they are not required to teach the lesson.

**Before presenting:** open the file on the actual presentation computer, check fullscreen/projector readability, make a test tally and export a backup. Start a new empty class afterwards. Real-browser/projector QA was unavailable in the development environment; see [testing.md](docs/testing.md) for the exact verification boundary.

## Run the lesson

| Chapters | Purpose | Approximate time |
|---|---|---:|
| 1–2: Briefing and prediction | Compare fictional neighbourhoods; record a prediction and reason | 3 min |
| 3–4: Source to site; ground laboratory | Distinguish magnitude/intensity and change one assumption at a time | 5 min |
| 5–7: Liquefaction, cases, connections | Explain mechanisms; examine Loma Prieta and Christchurch | 8 min |
| 8: Earthquake investigator | Two knowledge checks with tallies, reasons and answer reveals | 3 min |
| 9–10: Council and fairness | Allocate 10 fictional credits; consider residents and residual risk | 5 min |
| 11–12: Class pulse and peer reflection | Five short rubric rounds, new concepts, spoken explanation and peer feedback | 3–5 min |
| 13: Faculty review | Teacher scores/reviews/confirms on the same computer | 3–5 min; can return later |
| 14–15: Learning evidence and debrief | Review results, export and answer the original question | 2 min |

The teacher review can be skipped during the lesson and completed later. Any activity or question can be skipped without breaking navigation. Use **Chapters** to return to an activity; entered data stays saved. Keep **Guide** off for the cleanest projection; its optional prompts are deliberately suitable for the audience.

### Presenter controls

- Next/previous: buttons, **→ / ←**, **Page Down / Page Up**, or **Space** to advance.
- **Home / End**: first/final chapter. **M**: chapter menu. **G**: discussion guide.
- **F**: fullscreen; **E**: faculty rubric; **Escape**: close a dialog.
- Keyboard shortcuts do not interrupt inputs, links, buttons or dialogs.
- The discussion timer cycles between 30, 60 and 180 seconds. Start/pause/reset it explicitly. It pauses when navigating or opening a dialog and never advances a section automatically.
- Motion is restrained and can be disabled in Session. System reduced-motion preferences are respected. Every mechanism also has a text explanation.
- Long sections and teacher forms scroll rather than clip at smaller sizes. The layout has a 16:9 desktop design with responsive mobile fallbacks.

## Participation and honest assessment

### Voting

Tell students to choose **one option per question**, raise their hand only for that option, and lower it before the next option. Voting is visible and **not anonymous**. Enter counts directly or use `+` / `−`; no student types answers.

Use **Complete tally** when counting is finished, then **Reveal explanation** on prediction/knowledge questions. Record a short class reason before revealing when possible. Skipping unlocks a demonstration without pretending votes were collected. Correcting a completed tally returns it to “in progress”; complete it again after correction. Clearing one tally requires a separate confirmation.

Class size, if entered, prevents incremental overcounting. An incomplete tally can still be completed, but its sample size and unrecorded count remain explicit. Draft or skipped tallies are excluded from summary metrics. “Not sure / pass” is included in knowledge-check denominators. For rubric questions, pass is not a fifth rating level.

### Peer feedback and reflection

Five 1–4 dimensions cover understanding, explaining a concept, connecting to real situations, confidence applying knowledge, and clarity/engagement. Each level has a short descriptor. These are **perceptions**, not test scores.

The required prompt is: **“What is one thing you learned today that you did not know before?”** Hear two or three responses. A partner identifies one scientific strength and one improvement. The presenter records brief paraphrases without student names.

Also collect an application explanation comparing two ground conditions. The presenter may mark whether the spoken sample included a ground mechanism, structural factor and uncertainty. Up to six samples can be saved, edited and removed. These are qualitative samples, not an individual grade or evidence of whole-class mastery.

### Faculty evaluation

Seven criterion-specific 1–4 scales cover accuracy, clarity, engagement, value, structure, interactive activities, and visual/technical quality. **Not observed** is available for each criterion. Optional fields: overall score, strengths, improvements, comments and name.

The teacher can operate the computer or dictate. Address every criterion, select **Review before confirming**, then **Confirm evaluation**. Editing any answer returns the evaluation to draft and requires a new review. Confirmation is not a verified identity or signature. No aggregate average is inferred.

## Evidence reports, backup and privacy

From **Learning evidence** or **Review / print report**:

- **Print / Save as PDF:** prints the complete evidence report, regardless of the currently visible chapter. Select Save as PDF in the browser print dialog. The report uses A4 print CSS; no PDF library or online converter is required.
- **Printable HTML:** downloads a self-contained report you can open offline and print later.
- **CSV:** includes session details, every question’s status and sample size, votes, class reasoning, peer reflections, budget reasoning, faculty scores and comments. Formula-leading text is neutralised for spreadsheet import.
- **JSON backup:** includes restorable session state plus a readable evidence object. Import it through **Session → Restore**, review the candidate and confirm replacement.

The dashboard starts empty and reports only entered information. Knowledge answers and self-reports remain separate. There is no pooled participation percentage, made-up reflection, average across different questions, learning-gain estimate, fabricated teacher opinion or signature.

All session data is stored in this browser under `seismic-mission-v3`; a previous valid save is kept under `seismic-mission-v3-previous`. No analytics, API calls, automatic uploads or student identifiers are used. A storage failure is shown visibly, and work stays in memory so it can be exported. Corrupted or incompatible storage is left untouched until recovery or an explicit reset. An update from another tab pauses saving to avoid overwriting it.

Browser local storage may be cleared or behave differently for local `file:` URLs, private browsing or a moved file. **Download a JSON backup before closing, moving the file or changing computers.** To start another class, type `CLEAR` in the dedicated reset dialog. This clears version 3 data and its recovery save, not other applications or legacy versions.

## Publish with GitHub Pages

This is a static site with relative paths and `.nojekyll`; no framework, package installation, server, secret, build service or database is needed.

The version 3 work is delivered on a dedicated branch and pull request. **Main is not changed or deployed automatically.** After reviewing and merging the PR yourself:

1. In GitHub, open the repository’s **Settings → Pages**.
2. Choose **Deploy from a branch**.
3. Select `main` and `/(root)`, then save.
4. Use the Pages URL shown by GitHub after its deployment completes. For the existing repository, the expected project path is `https://BoniBones.github.io/Seismic-Mission/`; check GitHub’s displayed status before sharing it.

A branch ZIP is source code, not a deployed website. For classroom reliability, keep the standalone HTML locally even when using a hosted version. The hosted page does not install a service worker: a first visit without network is not supported. Offline use is provided by the downloaded standalone file (or the complete local project).

## Maintain the project

Runtime dependencies: **none**. For development checks, Node.js 18 or newer is sufficient.

```sh
node build-offline.mjs
node test.mjs
# Equivalent commands:
npm run build
npm test
```

Run the offline builder after editing source files. It embeds the CSS, modules and full original research into `Seismic-Mission-offline.html`. The tests check that the generated file matches the sources.

| File | Responsibility |
|---|---|
| `content.js` | Chapters, poll questions, teacher descriptors, sources and fictional budget options |
| `core.js` | Versioned state validation, vote rules, evidence model, CSV and JSON backup logic |
| `visual.js` | Accessible, labelled SVG mechanism diagrams |
| `pages.js` | Presentation and form rendering; user text is escaped |
| `app.js` | Navigation, local persistence, input handling, timer, dialogs and downloads |
| `report.js` | Complete screen/HTML/print report generated from the evidence model |
| `research.js` | Unaltered original project paper |
| `style.css` | Design system, responsive layouts, reduced motion and print rules |
| `tests/` | Pure logic and simulated-DOM classroom-flow tests |
| `legacy/v1/`, `legacy/v2/` | Preserved previous implementations for reference |

See [comparison.md](docs/comparison.md) for the 10-dimension review and retained/redesigned features, [science-notes.md](docs/science-notes.md) for source decisions, and [testing.md](docs/testing.md) for what was and was not verified.
