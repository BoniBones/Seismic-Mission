/* Seismic Mission 3.0 — educational content, independent of rendering. */
'use strict';
window.SM = window.SM || {};
SM.content = {
  title: 'Seismic Mission 3.0',
  question: 'Why Do Earthquakes Damage Some Places More Than Others?',
  chapters: [
    ['Briefing', 'Curiosity', '1 min', 'Ask for two possible explanations. The opening neighbourhoods are fictional; the case studies are real.'],
    ['First prediction', 'Curiosity', '2 min', 'Think silently for 10 seconds, compare ideas with a neighbour, then raise one hand for one option. Ask what information would change the prediction.'],
    ['Source to site', 'Foundations', '2 min', 'Point to the source, the path, the local ground and the building. Ask which factors change between two sites during the same earthquake.'],
    ['Ground laboratory', 'Foundations', '3 min', 'Keep the reference fixed. Change only ground or structure. Hear a prediction before revealing the mechanism. This diagram is not a damage calculator.'],
    ['Below the surface', 'Foundations', '2 min', 'Step through the mechanism. Ask: does the soil literally turn into water? No. Susceptible saturated soil loses strength.'],
    ['Real case files', 'Evidence', '4 min', 'Visit both case files. Ask one group to cite a ground observation and another to cite a structural observation. Separate evidence from an inference.'],
    ['Connections matter', 'Evidence', '2 min', 'Compare load paths and connections, not just the age of buildings. Modern does not mean invulnerable.'],
    ['Earthquake investigator', 'Application', '3 min', 'For each check: think, discuss, tally, record a reason, close voting, then reveal. These are group responses, not individual grades.'],
    ['The town council', 'Application', '3 min', 'Groups of 3–4 propose a plan aloud. Hear two plans. Record one class decision, its scientific reason and an unresolved risk. There is no single winning budget.'],
    ['Who gets protected?', 'Application', '2 min', 'Reveal the fictional residents’ situation. Invite a peer to name one strength and one improvement to the class explanation. Revise the plan if needed.'],
    ['Class pulse', 'Reflection', '2 min', 'Count each student at most once per question. Five short rubric rounds plus a new-concept vote; the final example vote is optional. Skip any item if time is short.'],
    ['Explain it back', 'Reflection', '2 min', 'Hear two or three new-learning statements and one application explanation. A neighbour gives one scientific strength and one improvement. Record short paraphrases without names.'],
    ['Faculty review', 'Evaluation', '3–5 min', 'The teacher can use this computer or dictate. Each criterion can be scored or marked not observed. Review the whole response before confirming. This can be skipped and revisited.'],
    ['Learning evidence', 'Evaluation', '1 min', 'Check completed sample sizes and distinguish confidence from demonstrated answers. Export a backup and a printable report before clearing anything.'],
    ['Mission debrief', 'Conclusion', '1 min', 'Return to the opening question. Ask the class to explain a cause, cite evidence and name one uncertainty.']
  ],
  sources: [
    {id:'paper', title:'Original project research', note:'Preserved in full; documentary comparison of Loma Prieta and Christchurch.'},
    {id:'usgs-intensity',title:'USGS · Magnitude and intensity',url:'https://www.usgs.gov/faqs/what-difference-between-earthquake-magnitude-and-earthquake-intensity-what-modified-mercalli',note:'Earthquake size at the source versus shaking and effects at a location.'},
    {id:'usgs-liquefaction',title:'USGS · What is liquefaction?',url:'https://www.usgs.gov/faqs/what-liquefaction',note:'Strength loss in loose, waterlogged sediment under strong shaking.'},
    {id:'usgs-loma',title:'USGS · Loma Prieta, 1989',url:'https://www.usgs.gov/programs/earthquake-hazards/science/m-69-october-17-1989-loma-prieta-earthquake',note:'Original bibliography source; local geology and earthquake effects.'},
    {id:'nist',title:'NIST · Loma Prieta engineering investigation',url:'https://www.nist.gov/el/earthquake-loma-prieta-california-1989',note:'17 October 1989, magnitude 6.9; structural failures including Cypress Street Viaduct.'},
    {id:'geonet',title:'GeoNet / GNS Science · Christchurch, 2011',url:'https://www.geonet.org.nz/earthquake/story/3468575',note:'22 February 2011; proximity and shallow depth contributed to severe city shaking. Its heading reports M6.2; its narrative also gives local magnitude ML6.3.'},
    {id:'aidr',title:'AIDR · Christchurch disaster record',url:'https://knowledge.aidr.org.au/resources/earthquake-christchurch-new-zealand-2011/',note:'Historical account used by the original paper. Counts and magnitude conventions differ across sources; they are not compared as identical measures here.'},
    {id:'damage',title:'USGS · Why damage differs between earthquakes',url:'https://www.usgs.gov/faqs/why-do-earthquakes-other-countries-seem-cause-more-damage-and-casualties-earthquakes-us',note:'The original bibliography labels this link as NZHistory; the destination is a USGS FAQ.'},
    {id:'laudato',title:'Francis (2015) · Laudato Si’, §§150–152, 158',url:'https://www.vatican.va/content/francesco/en/encyclicals/documents/papa-francesco_20150524_enciclica-laudato-si.html',note:'Housing, residents’ participation and concern for people in poverty. Applied here as an ethical perspective, not a seismic mechanism.'}
  ],
  polls: [
    {id:'prediction',kind:'prediction',title:'Which neighbourhood is generally less vulnerable under these assumptions?',options:['Riverside: loose saturated sand + unreinforced homes','Hilltop: firm rock + well-designed seismic connections','I need more evidence / not sure'],answer:1,explanation:'Hilltop is generally less vulnerable under the stated conditions. This is not a guarantee: actual shaking, foundations, design details and construction quality still matter. The two neighbourhoods belong to the same earthquake; they do not have different source magnitudes.'},
    {id:'investigator',kind:'knowledge',title:'Sand appears at the surface. Foundations settle, while some walls remain intact. Which explanation best fits?',options:['Only the age of the building matters','Liquefaction and ground movement may have damaged the foundations','The earthquake had a different magnitude at each house','Not sure / pass'],answer:1,explanation:'In susceptible saturated soils, shaking can cause strength loss. Settlement and lateral movement can damage foundations. These clues support liquefaction, but an engineering investigation must also examine the structure and local shaking.'},
    {id:'transfer',kind:'knowledge',title:'Two similar buildings, at similar fault distances, experience the same earthquake. One stands on soft soil. What can we conclude?',options:['They must have identical damage because magnitude is the same','The soft-soil building must collapse','Local ground can change shaking; damage also depends on the structure','Not sure / pass'],answer:2,explanation:'The earthquake’s magnitude describes the source. Local ground can alter shaking, and structural response matters. Soft soil does not guarantee collapse and rock does not guarantee safety.'},
    {id:'understanding',kind:'rubric',title:'I understand why damage can vary within one earthquake.',options:['1 · I still need an explanation','2 · I can name a factor with help','3 · I can explain the main factors','4 · I can connect the factors and their limits','Pass / not rated']},
    {id:'explain',kind:'rubric',title:'I could explain one new scientific concept to a classmate.',options:['1 · I cannot explain it yet','2 · I can explain part with help','3 · I can explain it with an example','4 · I can explain it and correct a misconception','Pass / not rated']},
    {id:'connect',kind:'rubric',title:'I can connect the research to a real place or building.',options:['1 · I cannot make a link yet','2 · I can make a link with a prompt','3 · I can connect one case to a real situation','4 · I can compare cases and say what is uncertain','Pass / not rated']},
    {id:'confidence',kind:'rubric',title:'I feel confident applying this learning to a new situation.',options:['1 · Not confident yet','2 · Confident with guidance','3 · Confident explaining a likely outcome','4 · Confident explaining both an outcome and a limit','Pass / not rated']},
    {id:'clarity',kind:'rubric',title:'The explanations and activities helped me follow the research.',options:['1 · Mostly difficult to follow','2 · Some parts helped','3 · Mostly clear and engaging','4 · Clear and engaging throughout','Pass / not rated']},
    {id:'newconcept',kind:'concept',title:'Which ONE concept was new to you today?',options:['Magnitude is different from local intensity','Soft soil can amplify some shaking','Liquefaction can damage foundations','Connections and reinforcement matter','Several factors interact / unequal access to protection','None of these / pass']},
    {id:'example',kind:'experience',optional:true,title:'Which example helped you understand most?',options:['The ground and building laboratory','Loma Prieta','Christchurch','The town council and peer discussion','Not sure / pass']}
  ],
  faculty: [
    {id:'accuracy',title:'Scientific accuracy',levels:['Major errors or unsupported claims','Some errors or important qualifications missing','Accurate core ideas; minor gaps','Accurate, sourced and appropriately qualified']},
    {id:'clarity',title:'Clarity of explanations',levels:['Mostly inaccessible for this age group','Several explanations need support','Mostly clear with useful examples','Clear, precise and accessible throughout']},
    {id:'engagement',title:'Student engagement',levels:['Little opportunity to participate','Participation limited or uneven','Most students had useful opportunities','Inclusive thinking, discussion and explanation']},
    {id:'value',title:'Educational value',levels:['Little relevant learning evidence','Some learning; important gaps remain','Relevant concepts demonstrated','Application and reasoning clearly demonstrated']},
    {id:'structure',title:'Presentation structure',levels:['Sequence difficult to follow','Some weak links or pacing issues','Logical sequence and workable pace','Coherent progression with effective transitions']},
    {id:'activities',title:'Effectiveness of interactive activities',levels:['Activities obscure the learning goal','Activities partly support understanding','Activities support the key concepts','Predictions, feedback and reasoning deepen learning']},
    {id:'quality',title:'Visual and technical quality',levels:['Readability or reliability prevents use','Several usability or technical problems','Clear and reliable with minor issues','Readable, accessible and technically smooth']}
  ],
  budget: [
    {id:'school',cost:5,title:'Strengthen the school',detail:'An older brick school on firm ground. Improve vulnerable structural connections.'},
    {id:'homes',cost:4,title:'Strengthen the homes',detail:'Improve housing structures on loose saturated sand. Ground risk remains.'},
    {id:'ground',cost:4,title:'Improve ground & foundations',detail:'Specialist intervention for those same homes. Structural weaknesses may remain.'},
    {id:'prepare',cost:2,title:'Prepare the community',detail:'Accessible information and drills. These do not prevent structural collapse.'}
  ]
};
