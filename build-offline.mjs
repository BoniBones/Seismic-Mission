import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const {version}=JSON.parse(read('package.json'));
let html=read('src/shell.html');
html=html.replace('<link rel="stylesheet" href="style.css">',()=>'<style>\n'+read('style.css')+'\n</style>');
html=html.replace(/<script src="([^"/]+\.js)"><\/script>/g,(_,name)=>'<script>\n'+read(name).replace(/<\/script/gi,'<\\/script')+'\n</script>');
html=html.replace('</head>',()=>'<meta name="seismic-standalone" content="'+version+'">\n</head>');
if (/<script[^>]+src=|<link[^>]+rel="stylesheet"/.test(html)) throw Error('Build contains a runtime asset dependency.');
// Publish one complete document: never combine the v3 shell with cached v1 assets.
for (const name of ['index.html','Seismic-Mission-offline.html']) fs.writeFileSync(path.join(root,name),html);
console.log('Built identical self-contained Pages and offline files ('+Buffer.byteLength(html)+' bytes each; '+version+').');
