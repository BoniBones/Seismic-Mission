# Verification record

Version 3.0, checked in the development environment on 2026-10-20 UTC.

## Completed checks

- `node build-offline.mjs`: generated the standalone HTML from the current source modules.
- `node test.mjs`: **30 tests passed, 0 failed**. Tests use Node’s test runner, pure state functions and a lightweight simulated DOM.
- JavaScript syntax checks for the source files passed.
- Parsed all 15 generated presentation sections, the faculty form and a blank report with an HTML parser. Checked duplicate IDs, label targets, form labels and SVG accessible names.
- Rendered the hero, saturated-ground comparison and liquefaction SVGs as images for visual inspection. Corrected filled bracing paths, kept grain size constant between steps and checked diagram labels. This is diagram inspection, not a screenshot of the complete site.
- Inspected source and standalone build for critical external dependencies and network upload APIs. There are no runtime fetches, remote fonts, remote imagery or analytics. The only external URLs are optional source links.

## Requirement coverage

| Requirement | Verified by | Boundary |
|---|---|---|
| Every section has real content | Render functions for 15 sections; variants of feedback, lab and cases | Browser typography/overflow not measured |
| Mouse and keyboard navigation | Simulated control events, keyboard input exclusions, chapter jumps and dialog logic | Native browser focus and fullscreen require a device check |
| Single-computer activities | Full simulated lesson from prediction to conclusion | Live-class pacing not observed |
| Vote entry and corrections | Count ceilings, negative values, direct entry, previous questions, skipped/draft status | One-person-one-vote relies on presenter procedure |
| Reflection preservation | Save/reload, edit-in-progress restoration, sample replacement, peer comments | Browser-specific `file:` storage must be checked locally |
| Faculty evaluation | Seven criteria, not observed, review/confirm, post-confirmation edit invalidation | No teacher opinions were collected during development |
| Report correctness | Same evidence model for screen, HTML, JSON and CSV; sample sizes, drafts, missing data | No real classroom dataset was fabricated |
| Exports | Blob contents, filenames, JSON roundtrip, formula-safe CSV, complete report HTML | Native download dialogs and PDF pagination not exercised |
| Invalid storage | Malformed JSON, incompatible schema, bounded nested values, blocked writes, previous-save recovery | Storage/browser eviction cannot be prevented |
| Injection protection | Escaped hostile strings in report, forms, reflections and council; CSV formula guards | No external security audit |
| 1920 × 1080 usability | Responsive CSS rules, minimum type sizes, scroll fallback, component structure | **Full-page visual browser verification pending** |
| Offline operation | Generated inline scripts/styles match source; no runtime network API dependency; local-file paths | **Actual disconnected-browser run pending** |
| GitHub Pages | Relative local paths, root `index.html`, `.nojekyll`, no server/build requirement | **No production deployment performed** |
| Functional controls | Every rendered `data-action` resolves to a handler; representative full flow | Real-device acceptance still required |

The automated lesson includes: class/date/size setup; initial prediction and reveal; lab controls; both case tabs; two knowledge checks with reasoning; a valid 10-credit budget; residents’ context; rubric feedback with skips; a peer-reviewed application sample; teacher scores/comments/review/confirmation; report creation; CSV, HTML and JSON exports; and restoring the saved state after reload. Additional tests cover failed storage, corruption recovery, deliberate reset, timer behavior and editing an unfinished reflection across reload.

## Environment limitation

The Sites skill’s managed-preview instructions require the Browser plugin’s `control-browser` capability for browser QA and explicitly require skipping browser QA when that capability is unavailable. It was not available in this session. No alternate browser-control route was used. The simulated DOM is not a browser and does not establish visual rendering, screen-reader behavior, actual print output or cross-browser compatibility.

## Brief classroom acceptance run

On the actual presentation computer:

1. Open `Seismic-Mission-offline.html` in the intended browser, disconnect the network, and navigate all 15 sections at 1920 × 1080. Check text size on the actual projector; scroll if necessary.
2. Test fullscreen, Tab/Shift+Tab within a dialog, Escape, arrow navigation from the slide title, and typing in fields without moving the presentation.
3. Enter a few explicitly temporary tallies, correct one, complete it, reload and verify that it returns. Check reduced motion.
4. Save a temporary peer sample and faculty evaluation, then edit the faculty comment and verify it becomes draft.
5. Download JSON and restore it after reviewing the candidate; print the report to PDF and inspect page breaks. Try CSV in the spreadsheet app you will use.
6. Clear the temporary session deliberately before collecting real results. Enter the correct session date and class size.

No real evaluation, student reflection, signature, participation record or deployment success is claimed by this development test record.
