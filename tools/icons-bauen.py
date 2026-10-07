"""Baut App-Icons, Favicon und das große Bild aus Klaus' Vorlagen (2026-10-07).

  icons/quelle/icon-prisma.jpg           → Icon und Favicon (das schlichte Prisma)
  icons/quelle/bild-prisma-splitter.jpg  → Bild in der App und für die Werbung

python3 tools/icons-bauen.py   (braucht Pillow). Danach CACHE_VERSION in sw.js
erhöhen und node tools/cache-stand.mjs — die Bilder stehen im Vorrat."""
from PIL import Image
import os

W = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
def p(*a): return os.path.join(W, *a)

ico = Image.open(p("icons", "quelle", "icon-prisma.jpg")).convert("RGB")
def klein(img, n): return img.resize((n, n), Image.LANCZOS)

klein(ico, 512).save(p("icons", "icon-512.png"), optimize=True)
klein(ico, 192).save(p("icons", "icon-192.png"), optimize=True)
klein(ico, 180).save(p("icons", "apple-touch-icon.png"), optimize=True)
# Favicon: enger geschnitten, damit das Prisma bei 32 px erkennbar bleibt
s = ico.size[0]; r = int(s * 0.08)
eng = ico.crop((r, r, s - r, s - r))
klein(eng, 32).save(p("icons", "favicon-32.png"), optimize=True)
klein(eng, 48).save(p("icons", "favicon-48.png"), optimize=True)
# Maskierbar: das ganze Bild in die sichere Zone (80 %), Rand in der Eckfarbe
grund = ico.getpixel((4, 4))
mask = Image.new("RGB", (512, 512), grund)
mask.paste(klein(ico, 410), (51, 51))
mask.save(p("icons", "maskable-512.png"), optimize=True)

bild = Image.open(p("icons", "quelle", "bild-prisma-splitter.jpg")).convert("RGB")
klein(bild, 900).save(p("assets", "bild-prisma.webp"), quality=82, method=6)
klein(bild, 1200).save(p("icons", "werbung-1200.jpg"), quality=88)
print("Icons und Bild gebaut.")
