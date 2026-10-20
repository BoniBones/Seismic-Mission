/* Lightweight DOM contract harness, not a browser or a layout engine. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
export const plain=value=>JSON.parse(JSON.stringify(value));
export function logic(){const ctx={console,Date,Math,JSON,crypto:{randomUUID:()=>Math.random().toString(36)},setTimeout,clearTimeout};ctx.window=ctx;vm.createContext(ctx);for(const name of ['content.js','core.js','visual.js','research.js','report.js','pages.js','layout.js'])vm.runInContext(read(name),ctx,{filename:name});return ctx.SM}
function decode(s){return String(s).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')}
export function boot({saved,previous,failStorage=false,standalone=false,bundle=false}={}){
 const memory=new Map(),events=new Map(),downloads=[],timers=[];
 if(saved!==undefined)memory.set('seismic-mission-v3',saved);
 if(previous!==undefined)memory.set('seismic-mission-v3-previous',previous);
 let storageThrows=failStorage;
 const attr=(text,key)=>{const m=text.match(new RegExp('(?:^|\\s)'+key+'(?:="([^"]*)"|=\'([^\']*)\'|(?=\\s|$))'));return m?decode(m[1]??m[2]??''):null};
 const doc={nodes:new Map(),activeElement:null,fullscreenElement:null,addEventListener(type,fn){events.set(type,[...(events.get(type)||[]),fn])},getElementById(id){return this.nodes.get(id)||null},querySelector(selector){return this.body.querySelector(selector)},querySelectorAll(selector){return this.body.querySelectorAll(selector)}};
 class Node{
  constructor(tag='div',attrs=''){this.tagName=tag.toUpperCase();this.attrs=attrs;this.id=attr(attrs,'id')||'';this.dataset={};for(const m of attrs.matchAll(/data-([\w-]+)="([^"]*)"/g))this.dataset[m[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=decode(m[2]);this.value=attr(attrs,'value')||'';this.type=attr(attrs,'type')||'';this.disabled=/\sdisabled(?:\s|$)/.test(' '+attrs);this.hidden=/\shidden(?:\s|$)/.test(' '+attrs);this.checked=/\schecked(?:\s|$)/.test(' '+attrs);this.open=false;this.isConnected=true;this.children=[];this.textContent='';this._html='';this.style={setProperty:(k,v)=>this.style[k]=v};this.classes=new Set((attr(attrs,'class')||'').split(' '));this.classList={toggle:(k,v)=>{if(v===undefined)v=!this.classes.has(k);v?this.classes.add(k):this.classes.delete(k)},contains:k=>this.classes.has(k),add:k=>this.classes.add(k)};this.scrollTop=0;if(this.id)doc.nodes.set(this.id,this)}
  set innerHTML(html){for(const child of this.children){child.isConnected=false;if(child.id&&doc.nodes.get(child.id)===child)doc.nodes.delete(child.id)}this._html=html;this.children=[];for(const m of html.matchAll(/<([a-z][\w-]*)(\s[^<>]*?)?>/gi)){const n=new Node(m[1],m[2]||'');n.parent=this;this.children.push(n)}}
  get innerHTML(){return this._html}
  matches(selector){return selector.split(',').some(raw=>{const s=raw.trim();if(s.startsWith('#'))return this.id===s.slice(1);if(s.startsWith('.'))return this.classes.has(s.slice(1));if(s==='[data-action]')return !!this.dataset.action;if(s==='[contenteditable="true"]')return false;const tag=s.match(/^([a-z]+)/i)?.[1];if(tag&&this.tagName!==tag.toUpperCase())return false;if(s.includes(':not([disabled])')&&this.disabled)return false;if(s.includes('[href]')&&attr(this.attrs,'href')===null)return false;if(s.includes('[tabindex="0"]')&&attr(this.attrs,'tabindex')!=='0')return false;return !!tag})}
  closest(selector){return this.matches(selector)?this:this.parent?.closest(selector)||null}
  querySelectorAll(selector){return this.children.flatMap(n=>[...(n.matches(selector)?[n]:[]),...n.querySelectorAll(selector)])}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null}
  setAttribute(k,v){if(k==='aria-pressed')this.pressed=v;this[k]=v}
  focus(){doc.activeElement=this}
  setSelectionRange(a,b){this.selectionStart=a;this.selectionEnd=b}
  showModal(){this.open=true}
  close(){this.open=false}
  addEventListener(type,fn){this['on'+type]=fn}
  append(node){node.parent=this;this.children.push(node)}
  click(){if(this.tagName==='A'&&this.download)downloads.push({name:this.download,url:this.href});else fire('click',this)}
  remove(){this.isConnected=false;if(this.id)doc.nodes.delete(this.id)}
 }
 const markup=read(bundle?'index.html':'src/shell.html');
 doc.body=new Node('body');doc.body.innerHTML=markup.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');doc.documentElement=new Node('html');doc.documentElement.requestFullscreen=async()=>{doc.fullscreenElement=doc.documentElement};doc.exitFullscreen=async()=>{doc.fullscreenElement=null};doc.createElement=tag=>new Node(tag);doc.activeElement=doc.body;
 if(standalone)doc.body.children.push(new Node('meta','name="seismic-standalone"'));
 // Parsed controls live in their container for selector/focus tests.
 const stage=doc.getElementById('stage'),dialog=doc.getElementById('dialog'),dialogBody=doc.getElementById('dialog-body');
 dialog.children.push(new Node('button','data-action="close-modal"'),dialogBody);dialogBody.parent=dialog;
 const blobs=new Map();let nextBlob=0;
 const ctx={console,Date,Math,JSON,Blob,document:doc,location:{protocol:'file:'},crypto:{randomUUID:()=>Math.random().toString(36)},localStorage:{getItem:k=>{if(storageThrows)throw Error('blocked storage');return memory.get(k)??null},setItem:(k,v)=>{if(storageThrows)throw Error('quota');memory.set(k,v)},removeItem:k=>{if(storageThrows)throw Error('blocked');memory.delete(k)}},URL:{createObjectURL:blob=>{const key='blob:test-'+nextBlob++;blobs.set(key,blob);return key},revokeObjectURL:key=>blobs.delete(key)},setTimeout:fn=>{timers.push(fn);return timers.length},clearTimeout:()=>{},setInterval:fn=>{ctx.tick=fn;return 1},addEventListener:(type,fn)=>doc.addEventListener(type,fn),print:()=>{ctx.printed=true}};
 ctx.window=ctx;vm.createContext(ctx);
 if(bundle){for(const [i,m] of [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].entries())vm.runInContext(m[1],ctx,{filename:'index.html script '+i})}
 else for(const name of ['content.js','core.js','visual.js','research.js','report.js','pages.js','layout.js','app.js'])vm.runInContext(read(name),ctx,{filename:name});
 async function fire(type,target,extra={}){const event={target,key:'',prevented:false,preventDefault(){this.prevented=true},...extra};for(const fn of events.get(type)||[])await fn(event);return event}
 function control(action,values={}){const found=[...stage.querySelectorAll('[data-action]'),...dialog.querySelectorAll('[data-action]'),...doc.body.querySelectorAll('[data-action]')].find(n=>n.dataset.action===action&&Object.entries(values).every(([k,v])=>n.dataset[k]===String(v)));if(!found)throw Error('Control not rendered: '+action+' '+JSON.stringify(values));return found}
 return {SM:ctx.SM,ctx,doc,memory,downloads,blobs,fire,control,click:async(action,values={})=>{const el=control(action,values);if(el.disabled)throw Error('Control disabled: '+action);await fire('click',el)},input:async(id,value,type='input')=>{const node=doc.getElementById(id);if(!node)throw Error('Input not rendered: '+id);node.value=String(value);await fire(type,node)},setStorageFailure:v=>storageThrows=v,read};
}
