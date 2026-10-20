import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url)),html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const script=html.match(/<script>([\s\S]*)<\/script>/)[1];
function boot(saved=null){const nodes=new Map();let mem=saved;
 const node=k=>(nodes.has(k)||nodes.set(k,{innerHTML:'',textContent:'',value:'',style:{},hidden:true,setAttribute(){}}),nodes.get(k));
 const ctx={console,Blob,URL,Date,setTimeout:()=>1,clearTimeout(){},requestAnimationFrame(){},addEventListener(){},confirm:()=>true,
  localStorage:{getItem:()=>mem,setItem:(k,v)=>{mem=v}},document:{querySelector:node,addEventListener(){},body:{append(){}},createElement:()=>({click(){},remove(){}})}};
 ctx.window=ctx;vm.createContext(ctx);vm.runInContext(script,ctx);return{run:c=>vm.runInContext(c,ctx),node}}
const a=boot(),N=a.run('SL.length'),teacher="rows().some(r=>String(r[0]).startsWith('teacher'))";
for(let i=0;i<N;i++){a.run('go('+i+')');const h=a.node('#stage').innerHTML;assert.ok(h.length>300,'slide '+i+' empty');assert.ok(!h.includes('undefined'),'undefined on slide '+i)}
a.run('S.q=0;vt(1,1);vt(1,1);vt(0,1);vt(0,-1);vt(0,-1)');assert.equal(a.run('cn(0).join()'),'0,2,0,0,0');
a.run('S.q=3;vt(3,1);vt(1,1)');assert.equal(a.run('av(3)'),'3.00');
assert.equal(a.run(teacher),false);
a.run('ts1(0,4);ts1(1,2)');assert.equal(a.run('tavg()'),'3.00');assert.equal(a.run(teacher),false);
a.run('tsv()');assert.equal(a.run('S.t.done'),true);assert.ok(a.run(teacher));
a.run("S.t.st='x';dn()");assert.equal(a.run('S.t.done'),false);assert.equal(a.run(teacher),false);
a.node('#ni').value='=1+1';a.run('na()');assert.equal(a.run("q('=1+1')"),'"\'=1+1"');
a.node('#ni').value='<img src=x onerror=alert(1)>';a.run('na()');a.run('go(SL.length-1)');
const h=a.node('#stage').innerHTML;assert.ok(!h.includes('<img src=x')&&h.includes('&lt;img'));
assert.equal(boot('{bad').run('S.i'),0);
const c=boot('{"i":999,"q":-5,"g":"x","nt":"oops"}');assert.equal(c.run('S.i'),N-1);assert.equal(c.run('S.q'),0);assert.equal(c.run('S.g'),'rock');assert.ok(c.run('Array.isArray(S.nt)'));
assert.ok(!/<script[^>]+src=/.test(html)&&!/<link[^>]+href/.test(html));
assert.equal(fs.readFileSync(path.join(dir,'Seismic-Mission-offline.html'),'utf8'),html);
console.log('PASS: '+N+' slides render, votes/averages, teacher save/edit, CSV-safe text, HTML escaping, corrupt storage, offline copy.');
