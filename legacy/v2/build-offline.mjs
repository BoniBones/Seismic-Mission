import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const d=path.dirname(fileURLToPath(import.meta.url));
fs.copyFileSync(path.join(d,'index.html'),path.join(d,'Seismic-Mission-offline.html'));
console.log('Updated Seismic-Mission-offline.html');
