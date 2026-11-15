// Prüft windows/bridge/capacitor-tauri.js im echten Browser mit gestellter Tauri-Schnittstelle (ohne Windows):
// Capacitor mit Plattform „windows“, Sitzungsschlüssel in jedem Aufruf, Fehlercodes, Ereignisse (stand), nur auf der eigenen Seite.
// Dazu die Verträge: jede Methode, die native/wn-native.js aufruft, steht in contracts.json; die Hülle prüft die Liste (main.rs).
//   NODE_PATH=windows/node_modules node windows/tools/test-bruecke.mjs
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const req=createRequire(import.meta.url);
let chromium;try{chromium=req('playwright-core').chromium;}catch{chromium=req('playwright').chromium;}
let gruen=0,rot=0;const soll=(n,b,m='')=>{if(b){gruen++;console.log('  ✓ '+n);}else{rot++;console.log('  ✗ ROT: '+n+(m?' – '+m:''));}};
const bruecke=await readFile(join(root,'windows/bridge/capacitor-tauri.js'),'utf8');
const vertr=JSON.parse(await readFile(join(root,'windows/bridge/contracts.json'),'utf8'));
const main=await readFile(join(root,'windows/src-tauri/src/main.rs'),'utf8');
console.log('Verträge');
soll('main.rs liest contracts.json und prüft jede Methode',main.includes('include_str!("../../bridge/contracts.json")')&&main.includes('Err("NOT_ALLOWED".into())'));
const glue=await readFile(join(root,'native/wn-native.js'),'utf8');
for(const [p,ms] of [['WnDateien',['speichern','appInfo']],['WnUpdates',['pruefen','installieren']]])for(const m of ms)soll(`${p}.${m} im Vertrag (native/wn-native.js ruft es)`,vertr[p]?.includes(m)&&glue.includes(m+'('));
soll('Brücke kennt genau die Plugins des Vertrags',JSON.stringify(Object.keys(vertr).sort())===JSON.stringify([...bruecke.matchAll(/'(Wn[A-Za-z]+)'/g)].map(m=>m[1]).sort()));
soll('Hülle lässt nur eigene Seiten ins Fenster (App, Impressum, Datenschutz, Sicherheit)',main.includes('["/","/index.html","/impressum.html","/datenschutz.html","/sicherheit.html"]'));
const host=await readFile(join(root,'windows/src-tauri/src/host.rs'),'utf8');
soll('Prüf-Abkürzungen der Hülle nur im Prüfbau (messprobe)',[...host.matchAll(/WN_WINDOWS_TEST_/g)].length>0&&[...host.matchAll(/#\[cfg\(feature="messprobe"\)\]\s*\n\s*if (let Ok|std::env::var)/g)].length===[...host.matchAll(/std::env::var\("WN_WINDOWS_TEST_/g)].length);
console.log('Brücke im Browser');
const browser=await chromium.launch();
try{
  const ctx=await browser.newContext();
  await ctx.route('https://tauri.localhost/**',r=>r.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>x</title>'}));
  await ctx.route('https://fremd.example/**',r=>r.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>y</title>'}));
  await ctx.addInitScript(()=>{
    window.__aufrufe=[];
    window.__TAURI_INTERNALS__={invoke:async(cmd,args,opt)=>{
      window.__aufrufe.push({cmd,args,kopf:opt?.headers?.['x-wn-session']});
      if(args.method==='kaputt')throw 'WN_NICHT_GEFUNDEN';
      return {ok:true,plugin:args.plugin,method:args.method};
    }};
  });
  await ctx.addInitScript(bruecke.replace('__WN_SESSION_TOKEN__',JSON.stringify('probe-schluessel')));
  const p=await ctx.newPage();await p.goto('https://tauri.localhost/');
  soll('Capacitor mit Plattform „windows“',await p.evaluate(()=>Capacitor.isNativePlatform()&&Capacitor.getPlatform()==='windows'));
  const r=await p.evaluate(()=>Capacitor.Plugins.WnDateien.speichern({name:'a.json',data:'e30='}));
  const a=(await p.evaluate(()=>window.__aufrufe))[0];
  soll('Aufruf geht als wn_call mit Sitzungsschlüssel im Kopf',r.ok&&a.cmd==='wn_call'&&a.kopf==='probe-schluessel'&&a.args.plugin==='WnDateien'&&a.args.method==='speichern'&&a.args.options.name==='a.json');
  soll('Fehler kommen als code an (wie Capacitor)',await p.evaluate(async()=>{try{await Capacitor.Plugins.WnDateien.kaputt();return false;}catch(e){return e.code==='WN_NICHT_GEFUNDEN';}}));
  const ev=await p.evaluate(async()=>{const got=[];const h=await Capacitor.Plugins.WnUpdates.addListener('stand',d=>got.push(['stand',d.geladen]));
    for(const [name,data] of [['WnUpdates:stand',{geladen:5}],['WnUpdates:anders',{}]])window.dispatchEvent(new CustomEvent('wn-native',{detail:{name,data}}));
    await h.remove();window.dispatchEvent(new CustomEvent('wn-native',{detail:{name:'WnUpdates:stand',data:{geladen:9}}}));return got;});
  soll('Ereignisse der Engine erreichen die Hörer (stand), entfernte nicht mehr',JSON.stringify(ev)===JSON.stringify([['stand',5]]));
  soll('Capacitor ist nicht überschreibbar',await p.evaluate(()=>{try{window.Capacitor=null;}catch{} return !!window.Capacitor;}));
  soll('kein „then“ (Plugins sind keine Versprechen)',await p.evaluate(()=>Capacitor.Plugins.WnDateien.then===undefined));
  const f=await ctx.newPage();await f.goto('https://fremd.example/');
  soll('auf fremder Seite keine Brücke',await f.evaluate(()=>!window.Capacitor));
  const u=await ctx.newPage();await u.goto('https://tauri.localhost/impressum.html');
  soll('auf Nebenseiten (Impressum) keine Brücke',await u.evaluate(()=>!window.Capacitor));
}finally{await browser.close();}
console.log(`Brücke: ${gruen} grün · ${rot} ROT`);process.exit(rot?1:0);
