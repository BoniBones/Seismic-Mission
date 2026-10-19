'use strict';
window.MISSION = {
  labels: [['La llamada','The call'],['Tu apuesta','Your prediction'],['El laboratorio','The laboratory'],['Los expedientes','The case files'],['El consejo','The council'],['La decisión humana','The human decision'],['El informe','The debrief']],
  sources: [
    ['USGS · Loma Prieta, 1989','https://www.usgs.gov/programs/earthquake-hazards/science/m-69-october-17-1989-loma-prieta-earthquake'],
    ['NIST · Loma Prieta engineering investigation','https://www.nist.gov/el/earthquake-loma-prieta-california-1989'],
    ['AIDR · Christchurch, 2011','https://knowledge.aidr.org.au/resources/earthquake-christchurch-new-zealand-2011/'],
    ['USGS · Magnitude and intensity','https://www.usgs.gov/faqs/what-difference-between-earthquake-magnitude-and-earthquake-intensity-what-modified-mercalli'],
    ['Francis (2015) · Laudato Si’, §§150–152, 158','https://www.vatican.va/content/francesco/en/encyclicals/documents/papa-francesco_20150524_enciclica-laudato-si.html']
  ],
  options: [
    {id:'A',cost:5,name:['Reforzar la escuela','Strengthen the school'],desc:['Escuela antigua de ladrillo sobre terreno firme.','Older brick school on firm ground.']},
    {id:'B',cost:4,name:['Reforzar las viviendas','Strengthen the homes'],desc:['Mejorar las estructuras de viviendas sobre arena saturada.','Improve housing structures on saturated sand.']},
    {id:'C',cost:4,name:['Mejorar terreno y cimientos','Improve ground and foundations'],desc:['Intervención especializada en esas mismas viviendas.','Specialist intervention for those same homes.']},
    {id:'D',cost:2,name:['Preparar a la comunidad','Prepare the community'],desc:['Simulacros e información accesible. No evita colapsos.','Drills and accessible information. Does not prevent collapse.']}
  ],
  cases: {
    loma: {
      date:'17 OCT 1989 / CALIFORNIA',year:'1989',
      title:['Daños lejos del epicentro','Damage far from the epicentre'],
      intro:['La magnitud 6,9 no explica por sí sola por qué algunos lugares de San Francisco y Oakland sufrieron tanto.','Magnitude 6.9 alone cannot explain why parts of San Francisco and Oakland suffered so much.'],
      clue:['La distancia importa. El terreno también.','Distance matters. So does the ground.'],
      ground:['Suelos blandos amplificaron el movimiento. Arena saturada y rellenos de la bahía sufrieron licuefacción. El Marina District mostró problemas de soporte y de sacudida.','Soft soils amplified shaking. Saturated sand and bay fills experienced liquefaction. The Marina District showed both shaking and ground-support problems.'],
      buildings:['Edificios sin refuerzo y estructuras vulnerables sufrieron daños graves. El colapso del Cypress Street Viaduct muestra por qué también importa el diseño estructural.','Unreinforced buildings and vulnerable structures suffered serious damage. The Cypress Street Viaduct collapse shows why structural design matters too.'],
      limits:['La cercanía a la falla no explica todos los contrastes. Geología local y debilidades estructurales se combinan con el movimiento sísmico.','Fault distance does not explain every contrast. Local geology and structural weaknesses combine with earthquake motion.'],
      source:0
    },
    christchurch: {
      date:'22 FEB 2011 / NEW ZEALAND',year:'2011',
      title:['Cuando falla el apoyo','When the ground gives way'],
      intro:['Christchurch sufrió daños más graves que durante el terremoto de Darfield de 2010, de mayor magnitud.','Christchurch suffered more severe damage than during the larger-magnitude Darfield earthquake in 2010.'],
      clue:['Una casa puede dañarse porque el suelo se mueve.','A house can be damaged because its ground moves.'],
      ground:['En suburbios orientales, arena y agua salieron a la superficie. Grietas, hundimientos y movimientos laterales afectaron viviendas, calles y redes de servicios.','In eastern suburbs, sand and water reached the surface. Cracks, settlement and lateral movement affected homes, roads and infrastructure.'],
      buildings:['La mampostería sin refuerzo fue vulnerable. También colapsaron dos edificios modernos de oficinas de hormigón: moderno no significa invulnerable.','Unreinforced masonry was vulnerable. Two modern concrete office buildings also collapsed: modern does not mean invulnerable.'],
      limits:['La cercanía a la ciudad y la poca profundidad contribuyeron a una sacudida extrema. Comparar solamente magnitudes da una explicación incompleta.','Proximity to the city and shallow depth contributed to extreme shaking. Comparing magnitudes alone gives an incomplete explanation.'],
      source:2
    }
  },
  science:[
    {title:['Magnitud e intensidad','Magnitude and intensity'],text:['La magnitud describe el tamaño del terremoto y se relaciona con la energía liberada. La intensidad describe sus efectos en un lugar. Un mismo terremoto puede producir intensidades distintas según el sitio.','Magnitude describes earthquake size and relates to energy released. Intensity describes effects at a location. One earthquake can produce different intensities at different sites.']},
    {title:['Amplificación y licuefacción','Amplification and liquefaction'],text:['Un suelo blando puede amplificar ciertas ondas sísmicas. En la licuefacción, el aumento de presión del agua entre los granos reduce la resistencia de suelos susceptibles y saturados. No se convierten literalmente en agua. Pueden hundirse o desplazarse lateralmente, dañando cimientos, calles y cañerías.','Soft soil can amplify certain seismic waves. In liquefaction, increased water pressure between grains reduces the strength of susceptible saturated soils. They do not literally turn into water. Settlement or lateral movement can damage foundations, roads and pipes.']},
    {title:['¿Un edificio nuevo siempre es seguro?','Is a new building always safe?'],text:['No. Importan materiales, peso, altura, conexiones, cimientos y calidad del diseño y su ejecución. El refuerzo y la ductilidad ayudan a resistir fuerzas. Incluso un buen edificio puede sufrir daños ante movimientos extremos.','No. Materials, weight, height, connections, foundations and design and construction quality matter. Reinforcement and ductility help resist forces. Even a good building can suffer damage under extreme motion.']},
    {title:['Cómo pusimos a prueba la hipótesis','How we investigated the hypothesis'],text:['La hipótesis predice más daños en terrenos débiles o edificios vulnerables. Comparamos suelo, construcción y otros factores en informes e inspecciones de dos terremotos. Es investigación documental, no un experimento controlado ni trabajo de campo propio. Ambos casos apoyan la hipótesis, pero no aíslan todos los factores ni permiten predecir cada daño.','The hypothesis predicts more damage on weak ground or in vulnerable buildings. We compared ground, construction and other factors in reports and inspections from two earthquakes. This is documentary research, not a controlled experiment or our own fieldwork. Both cases support the hypothesis, but do not isolate every factor or predict every outcome.']}
  ],
  prompts:[
    ['2 min. Preguntá: “¿Qué lugar de nuestro barrio no querrían perder?”. Escuchá dos respuestas antes de explicar. No pidas experiencias personales de desastres. La misión busca curiosidad, no miedo.','2 min. Ask: “Which place in our neighbourhood would you hate to lose?” Hear two answers before explaining. Do not ask for personal disaster experiences. Aim for curiosity, not fear.'],
    ['3 min. Pedí manos arriba y registrá la opción predominante. Preguntá qué dato les haría cambiar de opinión. Esta pantalla registra una decisión del curso, no recoge votos desde otros dispositivos.','3 min. Take a show of hands and record the leading choice. Ask what evidence would change their mind. This screen records one class decision, not votes from other devices.'],
    ['5 min. Elegí dos alumnos como operadores. Cambien una variable por vez. Comparen roca y suelo blando con el mismo edificio. Después prueben arena saturada con refuerzo: el problema de cimientos puede seguir.','5 min. Choose two students as operators. Change one variable at a time. Compare rock and soft soil with the same building. Then try saturated sand with reinforcement: foundation problems can remain.'],
    ['6 min. Un lado del aula defiende la importancia del suelo y otro la de los edificios. Cada lado cita una evidencia. Después expliquen por qué necesitamos ambas perspectivas.','6 min. One side argues for ground conditions, the other for buildings. Each side cites evidence. Then explain why both perspectives are needed.'],
    ['5 min. Equipos de 3–4: presupuesto, ciencia y vecinos. Todos escriben en papel; registrá un plan del curso en pantalla. Escuchá dos planes distintos antes de continuar.','5 min. Teams of 3–4: budget, science and residents. Everyone plans on paper; record one class plan on screen. Hear two different plans before continuing.'],
    ['4 min. Preguntá: “¿A quién no escuchamos todavía?”. No impongas una única respuesta. Vinculá solidaridad con decisiones concretas. La escuela y las viviendas tienen necesidades legítimas.','4 min. Ask whose voice is still missing. Do not impose one answer. Connect solidarity with concrete decisions. Both the school and the homes have legitimate needs.'],
    ['3 min. Evaluá 0–2 por criterio: presupuesto, ciencia, atención a vecinos vulnerables y riesgos pendientes. B+C+D=10 deja la escuela sin refuerzo. A+B=9 deja el terreno de las viviendas. Premia la argumentación, no un plan “ganador”.','3 min. Score 0–2 for each: budget, science, concern for vulnerable residents and remaining risks. B+C+D=10 leaves the school unstrengthened. A+B=9 leaves housing ground risk. Reward reasoning, not a “winning” plan.']
  ]
};

