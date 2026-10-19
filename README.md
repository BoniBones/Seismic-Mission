# Seismic Mission

Experiencia interactiva para una clase de 3.er año (14–15 años), basada en la investigación **Why Do Earthquakes Damage Some Places More Than Others?**

## Abrir y usar

- **Sin instalación ni internet:** descargá **Seismic-Mission-offline.html** y abrilo en Chrome, Edge o Firefox. Es un único archivo con todos los recursos.
- **Como sitio web:** serví esta carpeta con cualquier alojamiento estático. El punto de entrada es **index.html** y sus rutas son relativas, por lo que funciona en una subcarpeta de GitHub Pages.
- Para publicar: Settings → Pages → Deploy from a branch → main → /(root) → Save.
- Una vez publicado, compartí https://BoniBones.github.io/Seismic-Mission/ . Copiar el código al repositorio no activa Pages automáticamente.

No requiere npm, cuentas, claves, servicios externos ni conexión para las actividades. Los enlaces de fuentes sí necesitan internet. Abrir un archivo HTML en la vista de código de GitHub no ejecuta la experiencia: hay que descargarlo o alojarlo.

## Recorrido de 25–35 minutos

1. **La llamada:** misterio que conecta con lugares del barrio.
2. **Tu apuesta:** votación a mano alzada y predicciones justificadas.
3. **El laboratorio:** terreno y estructura modificables con animación conceptual.
4. **Los expedientes:** Loma Prieta 1989, Christchurch 2011, metodología y límites.
5. **El consejo:** equipos asignan 10 créditos entre escuela, viviendas, cimientos y preparación.
6. **La decisión humana:** nueva información y aplicación de Laudato Si’ a vivienda y dignidad.
7. **El informe:** riesgos pendientes, defensa oral e informe descargable.

La persona que presenta opera una pantalla compartida. Cada equipo piensa en papel. La web registra un plan del curso, no votos sincronizados ni múltiples equipos en línea.

## Para generar participación

- Activá **Modo docente** para ver tiempos y preguntas específicas.
- Pedí primero opiniones, después evidencia, y recién al final una revisión de la opinión.
- Elegí estudiantes como operadores del laboratorio y representantes de los vecinos.
- Distribuí roles de presupuesto, ciencia y comunidad. Evitá premiar sólo a quien habla más.
- Escuchá dos planes distintos. Preguntá qué problema resuelve cada uno y qué problema deja.
- El cierre compara “lo que pensábamos” con “lo que ahora podemos justificar”.
- No pidas testimonios personales de desastres ni uses la actividad para generar miedo.

## Funciones

- Español / inglés.
- Modo docente con guía en ambas lenguas.
- Navegación por estaciones, teclado y pantalla completa.
- Laboratorio visual con tres suelos y dos tipos de estructura.
- Presupuesto que bloquea elecciones superiores a 10 créditos.
- Temporizador opcional, pausado al volver a abrir la página.
- Progreso en localStorage del navegador. No se envían datos a un servidor.
- Texto de investigación completo y enlaces a las fuentes.
- Informe TXT que incluye decisiones, razones y riesgos pendientes.
- Diseño adaptable a pantallas pequeñas y preferencia de movimiento reducido.

**Nueva clase** solicita confirmación antes de borrar el progreso local. En navegadores que bloquean localStorage la experiencia sigue funcionando, pero el progreso puede perderse al cerrar.

## Ciencia y fuentes

La ciudad, los costos, el mensaje de los vecinos y las animaciones son recursos didácticos. No calculan intensidad, probabilidades, daños ni vidas salvadas. Las intervenciones reales requieren evaluación técnica.

Los expedientes distinguen magnitud de intensidad, amplificación de licuefacción y vulnerabilidad estructural de problemas del terreno. Los estudios documentales apoyan la hipótesis, pero no aíslan todas las variables.

La aplicación de Laudato Si’ se refiere a planificación participativa y dignidad de la vivienda (§§150–152), y al cuidado de los más pobres (§158). No atribuye terremotos tectónicos a contaminación.

Fuentes principales:

- [USGS: Loma Prieta](https://www.usgs.gov/programs/earthquake-hazards/science/m-69-october-17-1989-loma-prieta-earthquake)
- [NIST: investigación de Loma Prieta](https://www.nist.gov/el/earthquake-loma-prieta-california-1989)
- [AIDR: Christchurch](https://knowledge.aidr.org.au/resources/earthquake-christchurch-new-zealand-2011/)
- [USGS: magnitud e intensidad](https://www.usgs.gov/faqs/what-difference-between-earthquake-magnitude-and-earthquake-intensity-what-modified-mercalli)
- [Francisco: Laudato Si’](https://www.vatican.va/content/francesco/en/encyclicals/documents/papa-francesco_20150524_enciclica-laudato-si.html)

El documento original en **research.js** se conserva como borrador. Sus cifras detalladas y ciertas inconsistencias bibliográficas necesitan revisión antes de una entrega académica. El recorrido principal no depende de esas cifras.

## Archivos y verificación

- **content.js:** contenido, fuentes y consignas.
- **app.js:** estado, presupuesto, temporizador, diálogos y descarga.
- **visual.js:** ilustración SVG y modelo conceptual.
- **pages.js:** las siete estaciones.
- **research.js:** texto completo en inglés.
- **style.css:** diseño, impresión y adaptación.
- **Seismic-Mission-offline.html:** copia autosuficiente generada a partir de los archivos anteriores.

Ejecutá **node test.mjs** para comprobar las pantallas en ambos idiomas, el presupuesto, los riesgos, el tratamiento de entradas como texto, el temporizador, errores de almacenamiento y la inclusión de recursos sin conexión.

Las pruebas usan un entorno DOM mínimo para verificar lógica y generación de contenido; no sustituyen una revisión visual en navegador. La revisión visual no pudo realizarse en el entorno de creación por indisponibilidad del navegador y bloqueo de la vista previa local.


Tras editar el contenido, regenerá la copia sin conexión con **node build-offline.mjs** y ejecutá **node test.mjs**.
