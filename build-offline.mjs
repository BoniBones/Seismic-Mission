import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
let html=await fs.readFile(path.join(dir,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+await fs.readFile(path.join(dir,'style.css'),'utf8')+'</style>');
for(const file of ['content.js','research.js','app.js','visual.js','pages.js']){
 const js=(await fs.readFile(path.join(dir,file),'utf8')).replace(/<\/script/gi,'<\\/script');
 html=html.replace('<script src="'+file+'"></script>',()=>'<script>'+js+'</script>');
}
await fs.writeFile(path.join(dir,'Seismic-Mission-offline.html'),html,'utf8');
console.log('Updated Seismic-Mission-offline.html');

