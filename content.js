'use strict';
const SURVIVAL_CONFIG = Object.freeze({
  timerDurationSeconds: 30,
  timerDurationMs: 30000,
  warningThresholdSeconds: 10,
  timerTickMs: 100,
  maxDiscards: 2,
  validKeepPoints: 25,
  trapDiscardPoints: 12.5,
  optimalMinScore: 87.5,
  compromisedMinScore: 50
});

const SURVIVAL_OPTIONS = Object.freeze([
  Object.freeze({
    id: 1,
    type: 'valid',
    indicatorKey: 'hospital',
    title: ['Aislamiento sísmico', 'Seismic isolation'],
    statement: [
      'Aislamiento sísmico basal en infraestructura hospitalaria crítica',
      'Base seismic isolation in critical hospital infrastructure'
    ],
    validation: Object.freeze({
      retained: [
        'Puede reducir la transmisión de movimientos del terreno a la estructura y contribuir a proteger la continuidad operativa de hospitales diseñados, construidos y mantenidos para incorporarlo, sin eliminar por completo todos los riesgos.',
        'Can reduce ground-motion transmission into the structure and help protect the operational continuity of hospitals designed, built and maintained for it, without eliminating all risks.'
      ],
      discarded: [
        'Se pierde una medida clave de reducción de demanda sísmica en infraestructura hospitalaria crítica; aumentan las aceleraciones transmitidas a equipos, instalaciones y estructura, elevando el riesgo de interrupción operativa.',
        'Loses a key seismic-demand reduction measure in critical hospital infrastructure; transmitted accelerations to equipment, utilities and structure increase, raising the risk of operational disruption.'
      ]
    }),
    simulation: Object.freeze({
      retainedStatus: [
        'Protección estructural potencialmente mejorada',
        'Structural protection potentially improved'
      ],
      retainedDetail: [
        'Protección estructural potencialmente mejorada, siempre que el sistema esté correctamente diseñado, instalado y mantenido. Favorece la continuidad funcional hospitalaria, aunque no elimina todo riesgo ante movimientos extremos.',
        'Structural protection potentially improved, provided the system is properly designed, installed and maintained. Supports hospital continuity without eliminating every risk under extreme motion.'
      ],
      discardedStatus: [
        'Vulnerabilidad relativa mayor frente al escenario simulado',
        'Higher relative vulnerability in the simulated scenario'
      ],
      discardedDetail: [
        'Vulnerabilidad relativa mayor frente al escenario simulado por mayores aceleraciones en estructura e instalaciones críticas. Esto no implica que un hospital sin aislamiento necesariamente colapsará.',
        'Higher relative vulnerability in the simulated scenario due to stronger accelerations on structure and critical utilities. A hospital without base isolation will not necessarily collapse.'
      ]
    })
  }),
  Object.freeze({
    id: 2,
    type: 'trap',
    indicatorKey: 'doorMyth',
    title: ['Mito de las puertas', 'Doorway myth'],
    statement: [
      'Adopción general del marco de puertas como zona segura en edificios modernos',
      'General adoption of doorways as a safe zone in modern buildings'
    ],
    validation: Object.freeze({
      discarded: [
        'Recomendación ineficaz correctamente descartada: los marcos de puertas no son universalmente zonas seguras en edificios modernos; la protección depende del diseño estructural, el entorno y las recomendaciones oficiales de protección civil.',
        'Ineffective recommendation properly discarded: doorways are not universally safe zones in modern buildings; protection depends on structural design, surroundings and official civil-protection guidance.'
      ],
      retained: [
        'Permanece en el plan una pauta conductual técnicamente incorrecta: en edificios modernos los marcos de puertas no ofrecen protección estructural superior y exponen a golpes por hojas batientes, caída de objetos o refugio inadecuado.',
        'Keeps a technically flawed behavioural guideline active: in modern buildings doorways offer no superior structural protection and expose occupants to swinging doors, falling objects and inadequate shelter.'
      ]
    }),
    simulation: Object.freeze({
      discardedStatus: [
        'Mito conductual neutralizado',
        'Behavioural myth neutralized'
      ],
      discardedDetail: [
        'Se descartó la indicación general de refugiarse bajo marcos de puertas, evitando promover zonas de resguardo inadecuadas durante la sacudida.',
        'Discarded the blanket instruction to shelter in doorways, avoiding promotion of inadequate interior refuge zones during shaking.'
      ],
      retainedStatus: [
        'Riesgo activo de conducta y de refugio inadecuado',
        'Active behavioural and inadequate-shelter risk'
      ],
      retainedDetail: [
        'Permanece activa la creencia errónea sobre los marcos de puertas como zona segura general, generando riesgo de conducta y de refugio inadecuado frente a caída de elementos no estructurales.',
        'Retains the misconception of doorways as a universal safe zone, creating behavioural and inadequate-shelter risk from falling non-structural elements.'
      ]
    })
  }),
  Object.freeze({
    id: 3,
    type: 'valid',
    indicatorKey: 'gasValves',
    title: ['Corte automático de gas', 'Automatic gas shutoff'],
    statement: [
      'Red troncal con válvulas de corte automático por aceleración sísmica para redes de gas',
      'Trunk network with seismic-acceleration automatic shutoff valves for gas lines'
    ],
    validation: Object.freeze({
      retained: [
        'Pueden reducir el riesgo de fugas sostenidas e incendios secundarios después del sismo si están correctamente seleccionadas, instaladas y mantenidas, aunque no eliminan todas las posibles fuentes de ignición.',
        'Can reduce the risk of sustained leaks and post-earthquake secondary fires when properly selected, installed and maintained, though they do not eliminate all ignition sources.'
      ],
      discarded: [
        'Se pierde la capacidad de cierre automático ante aceleraciones fuertes en la red troncal; eventuales roturas de tuberías pueden mantener fugas de gas activas y elevar la probabilidad de incendios secundarios.',
        'Loses automatic trunk-line shutoff under strong shaking; pipe ruptures may sustain active gas leaks and increase the likelihood of secondary fires.'
      ]
    }),
    simulation: Object.freeze({
      retainedStatus: [
        'Riesgo relativo reducido',
        'Reduced relative risk'
      ],
      retainedDetail: [
        'Riesgo relativo reducido gracias al cierre automático por aceleración sísmica. Las válvulas seleccionadas y mantenidas reducen determinados riesgos por fugas de gas, pero no garantizan la ausencia de incendios.',
        'Reduced relative risk through seismic-acceleration shutoff. Properly maintained valves reduce specific gas-leak hazards, though they do not guarantee the absence of fires.'
      ],
      discardedStatus: [
        'Riesgo relativo incrementado',
        'Increased relative risk'
      ],
      discardedDetail: [
        'Riesgo relativo incrementado ante eventuales fugas en tuberías dañadas sin corte automático. Aún con válvulas instaladas, otras fuentes eléctricas o inflamables también requieren control.',
        'Increased relative risk from potential leaks in damaged pipes without automatic shutoff. Even with valves installed, electrical or flammable sources still require control.'
      ]
    })
  }),
  Object.freeze({
    id: 4,
    type: 'trap',
    indicatorKey: 'elevators',
    title: ['Evacuación por ascensores', 'Elevator evacuation'],
    statement: [
      'Protocolo de evacuación vertical inmediata mediante ascensores hacia el subsuelo',
      'Immediate vertical evacuation protocol using elevators toward the basement'
    ],
    validation: Object.freeze({
      discarded: [
        'Trampa peligrosa correctamente descartada: los ascensores no deben utilizarse como método general de evacuación durante el movimiento sísmico por riesgo de corte eléctrico, daños mecánicos y atrapamiento; deben seguirse los procedimientos oficiales de emergencia.',
        'Dangerous trap properly discarded: elevators must not be used as a general evacuation method during seismic shaking due to power outages, mechanical damage and entrapment; official emergency procedures must be followed.'
      ],
      retained: [
        'Permanece activo un protocolo crítico e inseguro: evacuar por ascensores durante el sismo expone a fallas electromecánicas, deformación de guías y atrapamiento vertical, contradiciendo los protocolos de protección civil.',
        'Leaves an unsafe protocol active: using elevators during shaking exposes occupants to electromechanical failure, guide-rail distortion and vertical entrapment, contradicting civil-protection protocols.'
      ]
    }),
    simulation: Object.freeze({
      discardedStatus: [
        'Riesgo específico evitado en el escenario',
        'Specific risk avoided in the scenario'
      ],
      discardedDetail: [
        'Al descartar el uso de ascensores durante el terremoto, se evita en la lógica del escenario el riesgo específico de atrapamiento vertical y lesiones asociadas a fallas de cabinas.',
        'By discarding elevator use during shaking, the specific scenario risk of vertical entrapment and elevator-shaft injuries is avoided.'
      ],
      retainedStatus: [
        'Riesgo residual elevado en el escenario simulado',
        'High residual risk in the simulated scenario'
      ],
      retainedDetail: [
        'Riesgo residual elevado en el escenario simulado: mantener la evacuación vertical por ascensores expone a interrupciones de energía, bloqueo de cabinas y lesiones durante el sismo.',
        'High residual risk in the simulated scenario: retaining immediate elevator evacuation exposes occupants to power loss, stalled cabins and injury during shaking.'
      ]
    })
  }),
  Object.freeze({
    id: 5,
    type: 'valid',
    indicatorKey: 'zoning',
    title: ['Zonificación geotécnica', 'Geotechnical zoning'],
    statement: [
      'Zonificación geotécnica restrictiva y prohibición de construcción sobre suelo licuable o relleno no compactado',
      'Restrictive geotechnical zoning and ban on construction over liquefiable soil or uncompacted fill'
    ],
    validation: Object.freeze({
      retained: [
        'Identificar y restringir adecuadamente la construcción en terrenos susceptibles a licuefacción o con rellenos deficientes reduce la exposición urbana a daños geotécnicos, asentamientos y pérdida de soporte.',
        'Properly identifying and restricting construction on liquefaction-prone ground or poor fills reduces urban exposure to geotechnical damage, settlement and loss of support.'
      ],
      discarded: [
        'Se pierde la regulación preventiva del uso del suelo sobre sectores licuables o rellenos sin compactar, aumentando la exposición de estructuras e infraestructura a fallas y deformaciones del terreno.',
        'Loses preventive land-use regulation over liquefiable areas or uncompacted fills, increasing structural and infrastructure exposure to ground failure and deformation.'
      ]
    }),
    simulation: Object.freeze({
      retainedStatus: [
        'Menor exposición a peligros geotécnicos identificados',
        'Lower exposure to identified geotechnical hazards'
      ],
      retainedDetail: [
        'Menor exposición a los peligros geotécnicos identificados al evitar nuevas edificaciones sin control en rellenos deficientes o suelos licuables; el desempeño depende también de la cimentación, la estructura y el movimiento sísmico.',
        'Lower exposure to identified geotechnical hazards by restricting uncontrolled building on poor fills or liquefiable soils; actual performance also depends on foundations, structure and ground motion.'
      ],
      discardedStatus: [
        'Mayor exposición potencial a daños asociados al suelo',
        'Higher potential exposure to ground-related damage'
      ],
      discardedDetail: [
        'Mayor exposición potencial a daños asociados al suelo. La presencia de suelo licuable no implica automáticamente un colapso: la consecuencia depende también del terreno, la cimentación, la estructura y el movimiento sísmico.',
        'Higher potential exposure to ground-related damage. Liquefiable soil does not automatically imply collapse: outcomes also depend on soil profile, foundations, structure and seismic motion.'
      ]
    })
  })
]);

window.MISSION = {
  labels: [
    ['La llamada', 'The call'],
    ['Tu apuesta', 'Your prediction'],
    ['El laboratorio', 'The laboratory'],
    ['Los expedientes', 'The case files'],
    ['Plan de contingencia', 'Contingency plan'],
    ['Validación técnica', 'Technical validation'],
    ['Simulación de impacto', 'Impact simulation']
  ],
  survivalConfig: SURVIVAL_CONFIG,
  options: SURVIVAL_OPTIONS,
  sources: [
    ['USGS · Loma Prieta, 1989', 'https://www.usgs.gov/programs/earthquake-hazards/science/m-69-october-17-1989-loma-prieta-earthquake'],
    ['NIST · Loma Prieta engineering investigation', 'https://www.nist.gov/el/earthquake-loma-prieta-california-1989'],
    ['AIDR · Christchurch, 2011', 'https://knowledge.aidr.org.au/resources/earthquake-christchurch-new-zealand-2011/'],
    ['USGS · Magnitude and intensity', 'https://www.usgs.gov/faqs/what-difference-between-earthquake-magnitude-and-earthquake-intensity-what-modified-mercalli'],
    ['Francis (2015) · Laudato Si’, §§150–152, 158', 'https://www.vatican.va/content/francesco/en/encyclicals/documents/papa-francesco_20150524_enciclica-laudato-si.html']
  ],
  cases: {
    loma: {
      date: '17 OCT 1989 / CALIFORNIA', year: '1989',
      title: ['Daños lejos del epicentro', 'Damage far from the epicentre'],
      intro: ['La magnitud 6,9 no explica por sí sola por qué algunos lugares de San Francisco y Oakland sufrieron tanto.', 'Magnitude 6.9 alone cannot explain why parts of San Francisco and Oakland suffered so much.'],
      clue: ['La distancia importa. El terreno también.', 'Distance matters. So does the ground.'],
      ground: ['Suelos blandos amplificaron el movimiento. Arena saturada y rellenos de la bahía sufrieron licuefacción. El Marina District mostró problemas de soporte y de sacudida.', 'Soft soils amplified shaking. Saturated sand and bay fills experienced liquefaction. The Marina District showed both shaking and ground-support problems.'],
      buildings: ['Edificios sin refuerzo y estructuras vulnerables sufrieron daños graves. El colapso del Cypress Street Viaduct muestra por qué también importa el diseño estructural.', 'Unreinforced buildings and vulnerable structures suffered serious damage. The Cypress Street Viaduct collapse shows why structural design matters too.'],
      limits: ['La cercanía a la falla no explica todos los contrastes. Geología local y debilidades estructurales se combinan con el movimiento sísmico.', 'Fault distance does not explain every contrast. Local geology and structural weaknesses combine with earthquake motion.'],
      source: 0
    },
    christchurch: {
      date: '22 FEB 2011 / NEW ZEALAND', year: '2011',
      title: ['Cuando falla el apoyo', 'When the ground gives way'],
      intro: ['Christchurch sufrió daños más graves que durante el terremoto de Darfield de 2010, de mayor magnitud.', 'Christchurch suffered more severe damage than during the larger-magnitude Darfield earthquake in 2010.'],
      clue: ['Una casa puede dañarse porque el suelo se mueve.', 'A house can be damaged because its ground moves.'],
      ground: ['En suburbios orientales, arena y agua salieron a la superficie. Grietas, hundimientos y movimientos laterales afectaron viviendas, calles y redes de servicios.', 'In eastern suburbs, sand and water reached the surface. Cracks, settlement and lateral movement affected homes, roads and infrastructure.'],
      buildings: ['La mampostería sin refuerzo fue vulnerable. También colapsaron dos edificios modernos de oficinas de hormigón: moderno no significa invulnerable.', 'Unreinforced masonry was vulnerable. Two modern concrete office buildings also collapsed: modern does not mean invulnerable.'],
      limits: ['La cercanía a la ciudad y la poca profundidad contribuyeron a una sacudida extrema. Comparar solamente magnitudes da una explicación incompleta.', 'Proximity to the city and shallow depth contributed to extreme shaking. Comparing magnitudes alone gives an incomplete explanation.'],
      source: 2
    }
  },
  science: [
    { title: ['Magnitud e intensidad', 'Magnitude and intensity'], text: ['La magnitud describe el tamaño del terremoto y se relaciona con la energía liberada. La intensidad describe sus efectos en un lugar. Un mismo terremoto puede producir intensidades distintas según el sitio.', 'Magnitude describes earthquake size and relates to energy released. Intensity describes effects at a location. One earthquake can produce different intensities at different sites.'] },
    { title: ['Amplificación y licuefacción', 'Amplification and liquefaction'], text: ['Un suelo blando puede amplificar ciertas ondas sísmicas. En la licuefacción, el aumento de presión del agua entre los granos reduce la resistencia de suelos susceptibles y saturados. No se convierten literalmente en agua. Pueden hundirse o desplazarse lateralmente, dañando cimientos, calles y cañerías.', 'Soft soil can amplify certain seismic waves. In liquefaction, increased water pressure between grains reduces the strength of susceptible saturated soils. They do not literally turn into water. Settlement or lateral movement can damage foundations, roads and pipes.'] },
    { title: ['¿Un edificio nuevo siempre es seguro?', 'Is a new building always safe?'], text: ['No. Importan materiales, peso, altura, conexiones, cimientos y calidad del diseño y su ejecución. El refuerzo y la ductilidad ayudan a resistir fuerzas. Incluso un buen edificio puede sufrir daños ante movimientos extremos.', 'No. Materials, weight, height, connections, foundations and design and construction quality matter. Reinforcement and ductility help resist forces. Even a good building can suffer damage under extreme motion.'] },
    { title: ['Cómo pusimos a prueba la hipótesis', 'How we investigated the hypothesis'], text: ['La hipótesis predice más daños en terrenos débiles o edificios vulnerables. Comparamos suelo, construcción y otros factores en informes e inspecciones de dos terremotos. Es investigación documental, no un experimento controlado ni trabajo de campo propio. Ambos casos apoyan la hipótesis, pero no aíslan todos los factores ni permiten predecir cada daño.', 'The hypothesis predicts more damage on weak ground or in vulnerable buildings. We compared ground, construction and other factors in reports and inspections from two earthquakes. This is documentary research, not a controlled experiment or our own fieldwork. Both cases support the hypothesis, but do not isolate every factor or predict every outcome.'] }
  ],
  prompts: [
    ['2 min. Preguntá: “¿Qué lugar de nuestro barrio no querrían perder?”. Escuchá dos respuestas antes de explicar. No pidas experiencias personales de desastres. La misión busca curiosidad, no miedo.', '2 min. Ask: “Which place in our neighbourhood would you hate to lose?” Hear two answers before explaining. Do not ask for personal disaster experiences. Aim for curiosity, not fear.'],
    ['3 min. Pedí manos arriba y registrá la opción predominante. Preguntá qué dato les haría cambiar de opinión. Esta pantalla registra una decisión del curso, no recoge votos desde otros dispositivos.', '3 min. Take a show of hands and record the leading choice. Ask what evidence would change their mind. This screen records one class decision, not votes from other devices.'],
    ['5 min. Elegí dos alumnos como operadores. Cambien una variable por vez. Comparen roca y suelo blando con el mismo edificio. Después prueben arena saturada con refuerzo: el problema de cimientos puede seguir.', '5 min. Choose two students as operators. Change one variable at a time. Compare rock and soft soil with the same building. Then try saturated sand with reinforcement: foundation problems can remain.'],
    ['6 min. Un lado del aula defiende la importancia del suelo y otro la de los edificios. Cada lado cita una evidencia. Después expliquen por qué necesitamos ambas perspectivas.', '6 min. One side argues for ground conditions, the other for buildings. Each side cites evidence. Then explain why both perspectives are needed.'],
    ['30 s de decisión (<2 min total). Iniciá el cronómetro y pedí al grupo identificar rápidamente las 2 trampas o mitos para descartar. Podés marcar con clic o teclas 1–5 y confirmar con Espacio al tener 2 descartes.', '30 s decision (<2 min total). Start the timer and ask the class to spot the 2 traps or myths to discard. Mark via click or keys 1–5 and confirm with Space once 2 discards are selected.'],
    ['40 s. Revisen en pantalla qué trampas fueron neutralizadas, qué medidas vitales se conservaron y si quedó algún riesgo residual activo. Presioná Espacio o el botón para ejecutar la simulación.', '40 s. Review which traps were neutralized, which vital measures were conserved and whether any residual risk stays active. Press Space or the button to run the simulation.'],
    ['40 s. Analicen los cuatro indicadores postevento, el riesgo conductual separado y el índice didáctico de resiliencia. Aclará que es un indicador formativo, no una predicción real de daños.', '40 s. Discuss the four post-event indicators, the separate behavioural risk and the didactic resilience index. Clarify that it is an educational metric, not a real damage prediction.']
  ]
};
