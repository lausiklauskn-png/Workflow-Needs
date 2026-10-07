/* Offline-Vorrat der Workflow Bedarfsanalyse. Wer eine Datei aus CORE ändert,
   erhöht CACHE_VERSION — sonst liefert der Worker die alte Fassung weiter.
   Fremde Adressen fasst er nicht an (die App ruft keine auf). */
const CACHE_VERSION = "workflow-needs-v10";
const CORE = ["./", "index.html", "manifest.json", "assets/app.css?v=4", "modules/25_pseudonym.js",
  "assets/kern/geld.js?v=1", "assets/daten/bausteine.js?v=3", "assets/daten/markt.js?v=2", "assets/kern/bedarf.js?v=2",
  "assets/kern/rechnen.js?v=4", "assets/kern/fassungen.js?v=2", "assets/kern/aussen.js?v=3", "assets/kern/bauauftrag.js?v=2", "assets/schluesseltresor.js?v=1", "assets/kern/sicherung.js?v=1", "assets/kern/uebergabe.js?v=2",
  "assets/daten/beispiel.js?v=3", "assets/daten/beispiel-tomys.js?v=2", "assets/daten/beispiel-psb.js?v=1", "assets/daten/beispiel-alis.js?v=1", "assets/daten/beispiel-eigene.js?v=1", "assets/daten/beispiel-unterschriften.js?v=1", "assets/daten/beispiel-tomys-gesamt.js?v=2",
  "assets/texte.js?v=4", "assets/app.js?v=5", "assets/installieren.js",
  "beispiele/tomys-gesamt/Anfrage-Tomys-Hub.eml", "beispiele/tomys-gesamt/Auftragszettel-Papier.jpg", "beispiele/tomys-gesamt/Rueckfrage-Buchhaltung.eml",
  "beispiele/tomys-gesamt/Ablauf-Motiv-bis-Rechnung.pdf", "beispiele/tomys-gesamt/Preisliste-Beispiel.pdf", "beispiele/tomys-gesamt/Logo-Entwurf-Kunde.png", "beispiele/tomys-gesamt/Skizze-Schaufenster.png",
  "impressum.html", "datenschutz.html", "icons/favicon-32.png", "icons/favicon-48.png", "assets/bild-prisma.webp", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_VERSION).then((c) =>
    Promise.allSettled(CORE.map((u) => c.add(new Request(u, { cache: "reload" }))))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => /^workflow-needs-/.test(k) && k !== CACHE_VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => {
    if (r.status === 200) { const k = r.clone(); caches.open(CACHE_VERSION).then((c) => c.put(e.request, k)); }
    return r;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match("index.html"))));
});
