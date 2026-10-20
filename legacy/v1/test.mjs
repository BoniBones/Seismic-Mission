import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
function boot(saved=null,denyStorage=false){
 const nodes=new Map(),timers=[];
 function node(key){if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',value:'',style:{},classList:{add(){},remove(){},contains(){return true}},setAttribute(){},addEventListener(){},focus(){},inert:false});return nodes.get(key)}
 let memory=saved;
 const context={console,Blob,URL,Date,setTimeout:()=>1,clearTimeout(){},setInterval:f=>timers.push(f),confirm:()=>true,matchMedia:()=>({matches:true}),
 localStorage:{getItem(){if(denyStorage)throw Error('disabled');return memory},setItem(k,v){if(denyStorage)throw Error('disabled');memory=v}},
 document:{querySelector:node,documentElement:{lang:'es'},addEventListener(){},body:{append(){}},createElement(){return{click(){},remove(){}}}},
 scrollTo(){}};
 context.window=context;
 vm.createContext(context);
 for(const file of ['content.js','research.js','app.js','visual.js','pages.js'])vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),context,{filename:file});
 return {run:code=>vm.runInContext(code,context),nodes,timers};
}
const app=boot();
for(const lang of ['es','en']){
 app.run("state.lang='"+lang+"'");
 for(let i=0;i<7;i++){app.run('go('+i+')');assert.ok(app.nodes.get('#main').innerHTML.length>500);assert.ok(!app.nodes.get('#main').innerHTML.includes('undefined'))}
}
app.run("choose('B',true);choose('C',true);choose('D',true)");
assert.equal(app.run('total()'),10);
app.run("choose('A',true)");
assert.equal(app.run('total()'),10);
assert.equal(app.run("state.selected.includes('A')"),false);
assert.equal(app.run('risks().length'),2);
app.run("choose('B',true)");assert.equal(app.run('total()'),10);
app.run("choose('C',false);choose('D',false);choose('A',true)");
assert.equal(app.run('total()'),9);
assert.equal(app.run("state.selected.includes('A')"),true);
app.run("state.team='<img src=x onerror=alert(1)>';state.science='<script>alert(1)</script>';go(6)");
assert.ok(!app.nodes.get('#main').innerHTML.includes('<img src=x'));
assert.ok(app.nodes.get('#main').innerHTML.includes('&lt;script&gt;'));
assert.ok(app.run('reportText()').includes('A'));
app.run("state.soil='wet';state.design='good';go(2);lab()");
assert.ok(app.nodes.get('#labResult').innerHTML.includes('ground'));
app.run("state.remaining=1;state.running=true");app.timers[0]();
assert.equal(app.run('state.remaining'),0);assert.equal(app.run('state.running'),false);
app.run("setCase('christchurch');reveal()");
assert.ok(app.run("state.visited.includes('christchurch')"));assert.equal(app.run('state.twist'),true);
assert.ok(app.run('window.RESEARCH_TEXT.length')>10000);
assert.ok(app.run("window.RESEARCH_TEXT.includes('Laudato')"));
const corrupted=boot('{"step":999,"selected":["A","B","C","D","X"],"lang":"xx","remaining":-2}');
assert.equal(corrupted.run('state.step'),0);assert.equal(corrupted.run('total()'),0);
const unavailable=boot(null,true);unavailable.run('go(6)');assert.equal(unavailable.run('storageAvailable'),false);
const invalidJSON=boot('{bad');assert.equal(invalidJSON.run('state.step'),0);
const offline=fs.readFileSync(path.join(dir,'Seismic-Mission-offline.html'),'utf8');
assert.ok(!offline.includes('<script src='));
assert.ok(!offline.includes('href="style.css"'));
console.log('PASS: 14 bilingual screens, budget caps, risk feedback, escaped input, timer, source text, corrupt/blocked storage, offline embedding.');

