"""Symbole der Android-App „Workflow Needs Pro“ aus Klaus' Prisma (icons/quelle/icon-prisma.jpg, dieselbe Vorlage wie
das App-Symbol der PWA, tools/icons-bauen.py). Schreibt die Launcher-Symbole (normal, rund, adaptiv: Vordergrund/Hintergrund)
und den Startbildschirm in android/app/src/main/res/, dazu die Hintergrundfarbe (Eckfarbe der Vorlage).

  python3 tools/native/symbole-bauen.py   (braucht Pillow)

Windows nimmt icons/icon-192.png unverändert (windows/tools/prepare-runtime.mjs)."""
from PIL import Image, ImageDraw
import os, re

W = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
RES = os.path.join(W, "android", "app", "src", "main", "res")
def p(*a): return os.path.join(W, *a)

ico = Image.open(p("icons", "quelle", "icon-prisma.jpg")).convert("RGB")
grund = ico.getpixel((4, 4))
farbe = "#%02X%02X%02X" % grund
def klein(img, n): return img.resize((n, n), Image.LANCZOS)

for dichte, n in {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}.items():
    d = os.path.join(RES, "mipmap-" + dichte)
    klein(ico, n).save(os.path.join(d, "ic_launcher.png"), optimize=True)
    rund = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    maske = Image.new("L", (n * 4, n * 4), 0); ImageDraw.Draw(maske).ellipse((0, 0, n * 4 - 1, n * 4 - 1), fill=255)
    rund.paste(klein(ico, n), (0, 0), maske.resize((n, n), Image.LANCZOS))
    rund.save(os.path.join(d, "ic_launcher_round.png"), optimize=True)
    a = n * 108 // 48  # adaptiv: 108 dp Fläche, sichtbar sicher sind die inneren 66 dp
    Image.new("RGB", (a, a), grund).save(os.path.join(d, "ic_launcher_background.png"), optimize=True)
    vorn = Image.new("RGBA", (a, a), (0, 0, 0, 0)); g = a * 62 // 100
    vorn.paste(klein(ico, g), ((a - g) // 2, (a - g) // 2))
    vorn.save(os.path.join(d, "ic_launcher_foreground.png"), optimize=True)

for name in os.listdir(RES):
    if not name.startswith("drawable"): continue
    f = os.path.join(RES, name, "splash.png")
    if not os.path.exists(f): continue
    b, h = Image.open(f).size
    s = Image.new("RGB", (b, h), grund); g = min(b, h) * 40 // 100
    s.paste(klein(ico, g), ((b - g) // 2, (h - g) // 2)); s.save(f, optimize=True)

for f in [os.path.join(RES, "values", "ic_launcher_background.xml"), os.path.join(RES, "drawable", "ic_launcher_background.xml")]:
    t = open(f, encoding="utf-8").read()
    t = re.sub(r"#[0-9A-Fa-f]{6}(?=</color>)", farbe, t) if f.endswith("values" + os.sep + "ic_launcher_background.xml") else re.sub(r'android:fillColor="#[0-9A-Fa-f]{6}"', 'android:fillColor="' + farbe + '"', t)
    open(f, "w", encoding="utf-8").write(t)
print("Android-Symbole gebaut, Hintergrund " + farbe)
