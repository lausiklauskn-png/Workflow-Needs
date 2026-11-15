#!/usr/bin/env python3
"""Echte signierte Erstinstallation von Workflow Needs Pro im Emulator, nur über die sichtbare Oberfläche (Vorbild BookLedgerPro):
App starten, Kopf „Workflow Needs Pro“ abwarten, „＋ Neuer Vorgang“ antippen (Kennung V-JJJJ-NNNN erscheint), dieselbe APK
darüber installieren – danach muss derselbe Vorgang im Reiter „Vorgänge“ wieder da sein (IndexedDB WorkflowNeeds1 erhalten).
Kein Debug-Zugang, kein JS. Schreibt <apk>.installation.json für publish-release.mjs.
"""
import hashlib, json, re, subprocess, sys, time
from pathlib import Path
import xml.etree.ElementTree as ET

apk = Path(sys.argv[1]).resolve()
package = 'de.familyprojekt.workflowneeds'
NAME = 'Workflow Needs Pro'
NEU = 'Neuer Vorgang'
KENNUNG = re.compile(r'V-\d{4}-\d{4}')

def adb(*args):
    r = subprocess.run(['adb', *map(str, args)], text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)
    if r.returncode: raise RuntimeError('ADB ' + str(args[:3]) + ': ' + (r.stdout + r.stderr)[-3000:])
    return r.stdout

anr_gesehen = []
def hierarchy():
    adb('shell', 'uiautomator', 'dump', '--compressed', '/sdcard/wn-release-probe.xml')
    root = ET.fromstring(adb('exec-out', 'cat', '/sdcard/wn-release-probe.xml'))
    anr = [n.get('text', '') for n in root.iter('node') if "isn't responding" in n.get('text', '') or 'reagiert nicht' in n.get('text', '')]
    if anr:
        if any('needs' in t.lower() for t in anr): raise RuntimeError('Die App selbst reagiert nicht: ' + repr(anr))
        if anr[0] not in anr_gesehen: anr_gesehen.append(anr[0]); print('Systemdialog gesehen:', anr[0], flush=True)
    return root

def texte(a): return {a.get('text', '').strip(), a.get('content-desc', '').strip()}

def wait_node(predicate, seconds=120):
    deadline = time.monotonic() + seconds; root = ET.Element('hierarchy')
    while time.monotonic() < deadline:
        try:
            root = hierarchy()
            for node in root.iter('node'):
                if predicate(node.attrib): return node.attrib
        except (ET.ParseError, RuntimeError) as e:
            if 'reagiert nicht' in str(e) or "isn't" in str(e): raise
        time.sleep(.5)
    sichtbar = [n.get('text', '') for n in root.iter('node') if n.get('text')]
    raise RuntimeError('Erwartetes Element fehlt; sichtbar: ' + repr(sichtbar)[-3000:])

def tap(node):
    b = list(map(int, re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', node['bounds']).groups()))
    adb('shell', 'input', 'tap', (b[0] + b[2]) // 2, (b[1] + b[3]) // 2)

def launch():
    r = adb('shell', 'am', 'start', '-W', '-n', package + '/.MainActivity')
    if 'Status: ok' not in r: raise RuntimeError('App startet nicht')
    if not adb('shell', 'pidof', package).strip(): raise RuntimeError('App-Prozess fehlt')

def kennungen():
    root = hierarchy()
    return {m for n in root.iter('node') for t in texte(n.attrib) for m in KENNUNG.findall(t)}

def diagnose():
    ziel = apk.parent
    try: (ziel / 'probe-bildschirm.png').write_bytes(subprocess.run(['adb', 'exec-out', 'screencap', '-p'], stdout=subprocess.PIPE, timeout=60).stdout)
    except Exception: pass
    try: (ziel / 'probe-logcat.txt').write_text(subprocess.run(['adb', 'logcat', '-d', '-v', 'brief', 'chromium:V', 'Capacitor:V', 'Capacitor/Console:V', 'AndroidRuntime:E', '*:S'], text=True, stdout=subprocess.PIPE, timeout=60).stdout)
    except Exception: pass

digest = hashlib.sha256(apk.read_bytes()).hexdigest()
receipt = json.loads(Path(str(apk) + '.json').read_text())
assert receipt['apkSha256'] == digest and receipt['applicationId'] == package
if 'package:' + package in adb('shell', 'pm', 'list', 'packages', package).splitlines():
    raise RuntimeError('Erstinstallation braucht einen frischen Emulator; vorhandene Daten bleiben unberührt')

adb('shell', 'settings', 'put', 'global', 'hide_error_dialogs', '1')  # nur im Wegwerf-Emulator
try:
    adb('install', apk); launch()
    wait_node(lambda a: NAME in texte(a), 180)
    vorher = kennungen()
    tap(wait_node(lambda a: any(NEU in t for t in texte(a)), 60))
    wait_node(lambda a: any(KENNUNG.search(t) and KENNUNG.search(t).group(0) not in vorher for t in texte(a)), 60)
    neu = sorted(kennungen() - vorher)
    if not neu: raise RuntimeError('Kein neuer Vorgang zu sehen')
    time.sleep(3)  # die App merkt den Vorgang nach kurzer Ruhe (IndexedDB)
    adb('shell', 'am', 'force-stop', package)
    adb('install', '-r', apk); launch()
    wait_node(lambda a: NAME in texte(a), 180)
    tap(wait_node(lambda a: any(t.endswith('Vorgänge') for t in texte(a)), 60))
    wait_node(lambda a: any(neu[0] in t for t in texte(a)), 60)
    vorher = neu[0]
except Exception:
    diagnose(); raise
proof = {'applicationId': package, 'apkSha256': digest, 'commit': receipt['commit'], 'versionCode': receipt['versionCode'],
         'api': int(adb('shell', 'getprop', 'ro.build.version.sdk').strip()), 'firstInstall': True, 'reinstallPreservesData': True,
         'developmentProbe': False, 'systemdialogeGesehen': anr_gesehen, 'vorgang': vorher,
         'probe': 'sichtbare WebView-Oberfläche; neuer Vorgang angelegt; nach Überinstallieren derselben signierten APK derselbe Vorgang im Reiter Vorgänge; kein Debug-Zugang'}
Path(str(apk) + '.installation.json').write_text(json.dumps(proof, indent=2, ensure_ascii=False) + '\n')
print(json.dumps(proof, ensure_ascii=False))
