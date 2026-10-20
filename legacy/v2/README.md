# Seismic Mission

A presenter-controlled, English-language classroom presentation based on the research *Why Do Earthquakes Damage Some Places More Than Others?* (Loma Prieta 1989 and Christchurch 2011), for 15–16-year-old students.

## Open and present
- **Offline:** open `Seismic-Mission-offline.html` (or `index.html`) in Chrome, Edge or Firefox. It is one self-contained file: no install, accounts or internet.
- **Publish:** GitHub → Settings → Pages → Deploy from a branch → `main` → `/(root)`. The site will be at https://BoniBones.github.io/Seismic-Mission/ (only the source links need internet).
- **Keys:** → / Space / PageDown next · ← / PageUp back · Home / End · **F** full screen · **E** teacher evaluation. Dots at the bottom jump to any section. Progress is saved in the browser.

## Flow (11 sections)
Mission → Concepts → Ground lab → Loma Prieta → Christchurch → Buildings → Class challenge → Class feedback → Reflection → Conclusion → Summary.
Everything is operated from one computer: students discuss and raise hands, the presenter clicks.

## Feedback and evaluation
- **Class feedback:** 3 hand-raise votes and a 5-item reflection rubric (1–4). Use + / − to record or correct counts; animated bars update live. "Skip activity" is always available. Counts are by show of hands, so they are not anonymous.
- **Reflection:** tap the concepts students mention and optionally type short answers.
- **Teacher evaluation:** discreet header button (or **E**). Seven criteria on a 1–4 scale, optional overall rating, strengths, improvements, comment and name. Review, then confirm to save. Any later edit marks it "not saved" until confirmed again.
- **Summary:** shows student results and teacher judgement separately. Download CSV or JSON, or Print report (Save as PDF).
- **Privacy:** all data stays in this browser's localStorage. Nothing is sent anywhere or committed to the repository. "Erase all data" clears it.

## Development
`node test.mjs` runs the logic tests. After editing `index.html`, run `node build-offline.mjs` to refresh the offline copy, then the tests. The previous bilingual version is kept in `legacy/`.

The ground lab is a conceptual model, not a simulation. All facts come from the research document; the five sources listed in its bibliography are linked in the conclusion.
