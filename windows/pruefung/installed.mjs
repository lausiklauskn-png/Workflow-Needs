// Prüft die mit NSIS installierte Windows-App über die Prüf-Schnittstelle des Prüfbaus (messprobe, Port 9223).
// Phase „erste“: Name, Fassung, Zugriffsschutz, Verträge, Updates, neuer Vorgang über die Oberfläche, Herunterladen → Speichern unter.
// Phase „neustart“: der Vorgang aus dem ersten Start ist noch da (IndexedDB WorkflowNeeds1 im Profil der App).
// Nur im Prüfbau; der Auslieferungsbau hat keine Prüf-Schnittstelle. Vorbild Datei-Organizer Pro / BookLedgerPro windows/pruefung/installed.mjs.
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {writeFile,readFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const phase=process.argv[2]||'erste',out=resolve(process.argv[3]||'windows-bericht.json');
const report={phase,quelle:process.env.WN_SOURCE_COMMIT||'',gruen:[],fehler:[]};
const version=JSON.parse(await readFile(new URL('../src-tauri/tauri.conf.json',import.meta.url),'utf8')).version;
const ok=(name,value)=>{assert.ok(value,name);report.gruen.push(name);console.log('PASS '+name);};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
let browser,page;
async function verbinden(){for(let i=0;i<120;i++){try{browser=await chromium.connectOverCDP('http://127.0.0.1:9223');return;}catch{await pause(500);}}throw Error('Die installierte App hat die Prüf-Schnittstelle nicht geöffnet');}
const seiten=()=>browser.contexts().flatMap(c=>c.pages());
const call=(plugin,method,args={})=>page.evaluate(async({plugin,method,args})=>{try{return await Capacitor.Plugins[plugin][method](args);}catch(e){return {fehler:e.code||String(e)};}},{plugin,method,args});
const vorgaenge=()=>page.evaluate(()=>new Promise((ok)=>{const r=indexedDB.open('WorkflowNeeds1');r.onerror=()=>ok([]);r.onsuccess=()=>{const db=r.result;try{const q=db.transaction('vorgaenge').objectStore('vorgaenge').getAllKeys();q.onsuccess=()=>{ok(q.result.map(String));db.close();};q.onerror=()=>ok([]);}catch{ok([]);}};}));
try{
  await verbinden();
  for(let i=0;i<120&&!page;i++){page=seiten().find(p=>/^https:\/\/tauri\.localhost\/(index\.html)?(#.*)?$/.test(p.url()));if(!page)await pause(250);}
  assert.ok(page,'Hauptfenster gefunden');
  page.on('pageerror',e=>report.fehler.push(String(e.stack||e.message).slice(0,800)));
  await page.waitForFunction(()=>window.Capacitor&&document.getElementById('app-name')?.textContent==='Workflow Needs Pro',null,{timeout:90000});
  ok('Hülle meldet Windows',await page.evaluate(()=>Capacitor.getPlatform()==='windows'&&Capacitor.isNativePlatform()&&window.WN_PRO?.plattform==='windows'));
  ok('Name „Workflow Needs Pro“ in Kopf und Titel',await page.evaluate(()=>document.getElementById('app-name').textContent==='Workflow Needs Pro'&&document.title==='Workflow Needs Pro'));
  ok('Fassung der App = tauri.conf.json',(await call('WnDateien','appInfo')).version===version);
  ok('kein Service Worker in der App',await page.evaluate(async()=>!(await navigator.serviceWorker?.getRegistration?.())));
  ok('kein Installieren-Knopf zu sehen',await page.evaluate(()=>[...document.querySelectorAll('[data-install-knopf]')].every(k=>k.offsetParent===null)));
  ok('Aufruf ohne Sitzungsschlüssel wird verweigert',await page.evaluate(async()=>{try{await __TAURI_INTERNALS__.invoke('wn_call',{plugin:'WnDateien',method:'appInfo',options:{}});return false;}catch(e){return String(e).includes('NOT_ALLOWED');}}));
  ok('Methode außerhalb der Verträge wird verweigert',(await call('WnDateien','loeschen')).fehler==='NOT_ALLOWED');
  // Solange kein öffentlicher Update-Schlüssel eingetragen ist: UPDATE_NICHT_EINGERICHTET; danach ohne Feed ein anderer UPDATE_-Fehler,
  // nach der ersten Veröffentlichung „aktuell“. Nie ein Angebot für einen Prüfbau, nie ein Download ohne geprüftes Angebot.
  { const u=await call('WnUpdates','pruefen'); report.update=u; console.log('Update-Prüfung meldet: '+JSON.stringify(u));
    ok('Updates: Fehler UPDATE_… oder „aktuell“, nie ein Angebot für einen Prüfbau',(typeof u.fehler==='string'&&/^UPDATE_/.test(u.fehler))||(u.aktuell===true&&!u.neu));
    const i=await call('WnUpdates','installieren'); report.installieren=i; console.log('Installieren meldet: '+JSON.stringify(i));
    ok('Updates: „installieren“ ohne geprüftes Angebot wird verweigert, nie ein Download',typeof i.fehler==='string'&&/^UPDATE_/.test(i.fehler)); }
  if(phase==='erste'){
    const vorher=await vorgaenge();
    const knopf=page.locator('#neuer-vorgang');
    if(!(await knopf.isVisible().catch(()=>false)))await page.locator('#reiter button',{hasText:'Vorgänge'}).first().click();
    await knopf.waitFor({state:'visible',timeout:30000});
    await knopf.click();
    let neu=[];for(let i=0;i<60&&!neu.length;i++){neu=(await vorgaenge()).filter(k=>!vorher.includes(k));if(!neu.length)await pause(250);}
    ok('neuer Vorgang über die Oberfläche angelegt und gemerkt',neu.length===1&&/^V-\d{4}-\d{4}$/.test(neu[0]));
    report.vorgang=neu[0];
    // Herunterladen wie laden() in assets/app.js: <a download> mit Blob → Klebstoff → Speichern unter (Prüfordner statt Dialog).
    await page.evaluate(()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['{"probe":"Windows ä"}'],{type:'application/json'}));a.download='WN-Probe.json';document.body.append(a);a.click();a.remove();});
    let text='';for(let i=0;i<60&&!text;i++){text=await readFile(resolve(process.env.WN_WINDOWS_TEST_SAVE_FOLDER,'WN-Probe.json'),'utf8').catch(()=>'');if(!text)await pause(250);}
    ok('Herunterladen geht an „Speichern unter …“ und schreibt die Datei',text==='{"probe":"Windows ä"}');
  }else{
    const erste=JSON.parse(await readFile(resolve(dirname(out),'erste.json'),'utf8'));
    ok('nach Neustart: Vorgang aus dem ersten Start ist noch da',typeof erste.vorgang==='string'&&(await vorgaenge()).includes(erste.vorgang));
  }
  ok('keine Skriptfehler in der Seite',report.fehler.length===0);
}catch(error){report.fehler.push(String(error.stack||error.message));process.exitCode=1;console.error(error);}
finally{
  await mkdir(dirname(out),{recursive:true});await writeFile(out,JSON.stringify(report,null,2)+'\n');
  if(browser)await browser.close().catch(()=>{});
}
