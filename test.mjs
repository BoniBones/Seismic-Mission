// Compatibility entry point. Use `node test.mjs` or `npm test`.
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const r=spawnSync(process.execPath,['--test','tests/core.test.mjs','tests/flows.test.mjs'],{cwd:root,stdio:'inherit'});
process.exitCode=r.status??1;
