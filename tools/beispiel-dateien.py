#!/usr/bin/env python3
"""Baut die Beispiel-Anhänge für den Vorgang „Tomys Hub — Gesamtprogramm“ (Klaus 2026-10-07:
„Beispiel Bilder und PDFs mit einfügen … PDFs und EMLs … bei Tomys Workflow reingepackt“).

ALLES ERFUNDEN: Namen „… Beispiel“, Adressen „Musterstraße“, Mailadressen *.example,
Telefonnummern aus dem Berliner Block 030 23125 …, den die Bundesnetzagentur für
Film und Fernsehen freihält. Keine echte Person, keine echten Preise.

Aufruf:  python3 tools/beispiel-dateien.py      (Pillow + reportlab)
Schreibt beispiele/tomys-gesamt/* und assets/daten/beispiel-unterschriften.js.
Wer etwas ändert, baut neu und erhöht CACHE_VERSION (die Dateien stehen im Vorrat)."""
import base64, io, math, os, random
from email.message import EmailMessage
from email.utils import format_datetime
import datetime as dt
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIEL = os.path.join(WURZEL, "beispiele", "tomys-gesamt")
os.makedirs(ZIEL, exist_ok=True)
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SANSB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SERIFI = "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"
pdfmetrics.registerFont(TTFont("S", SANS)); pdfmetrics.registerFont(TTFont("SB", SANSB))
random.seed(7)
TZ = dt.timezone(dt.timedelta(hours=2))

KUNDE = {"firma": "Tomys Hub", "person": "Max Beispiel", "mail": "kontakt@tomys-hub.example",
         "tel": "030 23125456", "strasse": "Musterstraße 12", "ort": "12345 Musterstadt"}
WERKSTATT = {"firma": "Werkstatt Beispiel", "person": "Paula Beispiel", "mail": "werkstatt@werkstatt-beispiel.example"}


def f(groesse, fett=False):
    return ImageFont.truetype(SANSB if fett else SANS, groesse)


# ── Bilder ──
def auftragszettel():
    """Foto eines Papier-Auftragszettels (so arbeitete der Betrieb vorher)."""
    w, h = 1000, 1300
    im = Image.new("RGB", (w, h), (247, 244, 236))
    d = ImageDraw.Draw(im)
    for y in range(160, h - 60, 46):
        d.line([(60, y), (w - 60, y)], fill=(190, 205, 225), width=2)
    d.line([(120, 0), (120, h)], fill=(225, 160, 160), width=2)
    d.text((140, 50), "AUFTRAGSZETTEL  Nr. 0417", font=f(44, True), fill=(30, 30, 30))
    hand = ImageFont.truetype(SERIFI, 38)
    zeilen = [("Kunde:", "Sportverein Beispiel e. V."), ("Ansprechpartner:", "Frau Beispiel, 030 23125457"),
              ("Artikel:", "50 T-Shirts, Brust links gestickt"), ("Motiv:", "Vereinslogo — kommt per Mail"),
              ("Farben:", "Navy / Weiß, Garn 2 Farben"), ("Größen:", "S 10 · M 20 · L 15 · XL 5"),
              ("Termin:", "bis Freitag (Turnier!)"), ("Preis:", "noch rechnen"), ("Erledigt:", "")]
    y = 186
    for k, v in zeilen:
        d.text((140, y - 34), k, font=f(26, True), fill=(60, 60, 60))
        d.text((420, y - 40), v, font=hand, fill=(20, 40, 120))
        y += 92
    d.text((140, y + 10), "Notiz: Mail mit Logo ist im Postfach, NICHT verlieren!", font=hand, fill=(170, 30, 30))
    im = im.rotate(-2.2, resample=Image.BICUBIC, expand=True, fillcolor=(120, 110, 100))
    im = im.filter(ImageFilter.GaussianBlur(0.6))
    sch = Image.new("L", im.size, 0)
    ImageDraw.Draw(sch).rectangle([0, 0, im.size[0], im.size[1]], fill=0)
    return im


def logo():
    """Logo-Entwurf, wie ihn ein Kunde im Gestalter hochlädt."""
    s = 800
    im = Image.new("RGBA", (s, s), (255, 255, 255, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([60, 60, s - 60, s - 60], fill=(20, 40, 80, 255))
    d.ellipse([110, 110, s - 110, s - 110], outline=(240, 180, 60, 255), width=18)
    t = "TOMYS"
    d.text((s / 2, s / 2 - 70), t, font=f(150, True), fill=(255, 255, 255, 255), anchor="mm")
    d.text((s / 2, s / 2 + 80), "HUB · Beispiel", font=f(60, True), fill=(240, 180, 60, 255), anchor="mm")
    for i in range(12):
        a = i / 12 * 2 * math.pi
        x, y = s / 2 + math.cos(a) * 300, s / 2 + math.sin(a) * 300
        d.ellipse([x - 8, y - 8, x + 8, y + 8], fill=(240, 180, 60, 255))
    return im


def skizze():
    """Bildschirm-Skizze des Schaufensters aus dem Bedarfsgespräch."""
    w, h = 1200, 800
    im = Image.new("RGB", (w, h), "white")
    d = ImageDraw.Draw(im)
    d.rectangle([20, 20, w - 20, h - 20], outline=(40, 40, 40), width=4)
    d.rectangle([20, 20, w - 20, 100], fill=(230, 235, 245), outline=(40, 40, 40), width=4)
    d.text((50, 45), "Tomys Hub — Du gestaltest, wir drucken", font=f(30, True), fill=(20, 30, 60))
    schritte = ["1  Motiv wählen", "2  Vorlage gestalten", "3  Angebot erhalten", "4  Wir drucken"]
    for i, s in enumerate(schritte):
        x = 50 + i * 285
        d.rounded_rectangle([x, 140, x + 255, 330], radius=18, outline=(40, 40, 40), width=3)
        d.text((x + 128, 235), s, font=f(24, True), fill=(30, 30, 30), anchor="mm")
        if i < 3:
            d.line([(x + 258, 235), (x + 282, 235)], fill=(200, 120, 30), width=5)
    d.rectangle([50, 370, 690, 740], outline=(40, 40, 40), width=3)
    d.line([(50, 370), (690, 740)], fill=(170, 170, 170), width=2); d.line([(690, 370), (50, 740)], fill=(170, 170, 170), width=2)
    d.text((370, 555), "Galerie / Videos", font=f(28), fill=(80, 80, 80), anchor="mm")
    d.rectangle([730, 370, 1150, 740], outline=(40, 40, 40), width=3)
    d.text((760, 395), "Kontakt", font=f(28, True), fill=(30, 30, 30))
    for i, z in enumerate(["Name", "E-Mail", "Was soll gedruckt werden?", "[ Anfrage senden ]"]):
        d.rectangle([760, 450 + i * 70, 1120, 495 + i * 70], outline=(120, 120, 120), width=2)
        d.text((772, 460 + i * 70), z, font=f(20), fill=(110, 110, 110))
    d.text((w - 40, h - 45), "Skizze aus dem Bedarfsgespräch — Beispiel", font=f(18), fill=(150, 60, 60), anchor="ra")
    return im


def unterschrift(saat, breite=600, hoehe=150):
    """Eine erfundene Unterschrift als durchsichtiges PNG (wie aus dem Unterschriftsfeld der App)."""
    r = random.Random(saat)
    im = Image.new("RGBA", (breite, hoehe), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    pkt = []
    x = 40
    while x < breite - 80:
        y = hoehe * 0.55 + math.sin(x / (18 + r.random() * 10)) * (22 + r.random() * 18) + r.uniform(-6, 6)
        pkt.append((x, y)); x += r.uniform(5, 9)
    for a, b in zip(pkt, pkt[1:]):
        d.line([a, b], fill=(10, 10, 30, 255), width=3)
    d.line([(60, hoehe * 0.78), (breite - 120, hoehe * 0.72)], fill=(10, 10, 30, 255), width=3)
    b = io.BytesIO(); im.save(b, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(b.getvalue()).decode()


# ── PDFs ──
def preisliste(pfad):
    c = canvas.Canvas(pfad, pagesize=A4)
    c.setTitle("Preisliste Beispiel — Tomys Hub"); c.setAuthor("Tomys Hub (Beispiel)")
    W, H = A4
    c.setFont("SB", 20); c.drawString(20 * mm, H - 25 * mm, "Tomys Hub — Preisliste (Beispiel)")
    c.setFont("S", 10); c.drawString(20 * mm, H - 32 * mm, f"{KUNDE['strasse']} · {KUNDE['ort']} · {KUNDE['tel']} · {KUNDE['mail']}")
    c.drawString(20 * mm, H - 38 * mm, "Alle Preise erfunden, nur für das Beispiel. Netto zzgl. USt.")
    zeilen = [("Digitaldruck", ""), ("T-Shirt, Druck einseitig A4", "12,00 €"), ("T-Shirt, Druck beidseitig", "17,50 €"),
              ("Folienplot je Farbe", "4,00 €"), ("Stickerei", ""), ("Stick bis 8.000 Stiche", "6,50 €"),
              ("Stick bis 15.000 Stiche", "9,80 €"), ("Einrichtung je Motiv (einmalig)", "35,00 €"),
              ("Kleinwerbeartikel", ""), ("Kugelschreiber mit Logo, ab 100 Stk.", "0,85 €"),
              ("Tasse bedruckt", "7,90 €"), ("Aufkleber 5 × 5 cm, ab 250 Stk.", "0,32 €"),
              ("Vorlagenarbeit", ""), ("Druckvorlage erstellen (je angef. 15 Min.)", "14,00 €"),
              ("Vorlage vom Kunden aus dem Gestalter", "0,00 €")]
    y = H - 55 * mm
    for k, v in zeilen:
        if not v:
            y -= 3 * mm; c.setFont("SB", 12); c.drawString(20 * mm, y, k); c.line(20 * mm, y - 1.5 * mm, W - 20 * mm, y - 1.5 * mm)
        else:
            c.setFont("S", 11); c.drawString(25 * mm, y, k); c.drawRightString(W - 20 * mm, y, v)
        y -= 8 * mm
    c.setFont("S", 9); c.drawString(20 * mm, 20 * mm, "Diese Preisliste ist ein erfundenes Beispiel für Workflow-Needs.")
    c.showPage(); c.save()


def ablauf(pfad):
    c = canvas.Canvas(pfad, pagesize=A4)
    c.setTitle("Ablauf vom Motiv zur Rechnung — Beispiel"); c.setAuthor("Tomys Hub (Beispiel)")
    W, H = A4
    c.setFont("SB", 18); c.drawString(20 * mm, H - 25 * mm, "Ablauf: vom Kundenmotiv bis zur Rechnung")
    c.setFont("S", 10); c.drawString(20 * mm, H - 32 * mm, "Aufgenommen im Bedarfsgespräch mit Tomys Hub (Beispiel). Wer macht was, mit welchem Werkzeug.")
    stufen = [("Anfrage", "Kunde · Schaufenster / E-Mail", "Internetseite, Posteingang im WorkFloh"),
              ("Vorlage", "Kunde · Gestalter", "Druckvorlage 300 dpi, KI-Prompt freiwillig"),
              ("Angebot", "Inhaber · Angebots-Werkzeug", "Katalogpreise, PDF ans Kundenpostfach"),
              ("Freigabe", "Kunde", "Unterschrift / Bestätigung per Mail"),
              ("Produktion", "Mitarbeiter · WorkFloh", "Auftragszettel digital, Zeit je Mitarbeiter"),
              ("Fertig", "Mitarbeiter", "Dateien am Auftrag, Übergabe"),
              ("Rechnung", "Inhaber · BookLedgerPro", "Übernahme ohne Abtippen, GoBD, DATEV-Export")]
    y = H - 50 * mm
    for i, (k, wer, wie) in enumerate(stufen):
        c.roundRect(20 * mm, y - 14 * mm, W - 40 * mm, 18 * mm, 3 * mm)
        c.setFont("SB", 13); c.drawString(25 * mm, y - 3 * mm, f"{i + 1}. {k}")
        c.setFont("S", 10); c.drawString(70 * mm, y - 3 * mm, wer); c.drawString(70 * mm, y - 9 * mm, wie)
        if i < len(stufen) - 1:
            c.line(W / 2, y - 14 * mm, W / 2, y - 19 * mm)
        y -= 26 * mm
    c.setFont("S", 9); c.drawString(20 * mm, 20 * mm, "Erfundenes Beispiel für Workflow-Needs. Keine echten Kundendaten.")
    c.showPage(); c.save()


# ── E-Mails ──
def mail(von, an, betreff, datum, text, anhang=None):
    m = EmailMessage()
    m["From"] = von; m["To"] = an; m["Subject"] = betreff
    m["Date"] = format_datetime(datum); m["Message-ID"] = f"<{datum.strftime('%Y%m%d%H%M')}.beispiel@tomys-hub.example>"
    m.set_content(text)
    if anhang:
        m.add_attachment(anhang[1], maintype=anhang[2].split("/")[0], subtype=anhang[2].split("/")[1], filename=anhang[0])
    return bytes(m)


def main():
    out = {}
    def schreib(name, daten):
        with open(os.path.join(ZIEL, name), "wb") as fh: fh.write(daten)
        out[name] = len(daten)
    b = io.BytesIO(); auftragszettel().convert("RGB").resize((750, 975)).save(b, "JPEG", quality=72); schreib("Auftragszettel-Papier.jpg", b.getvalue())
    b = io.BytesIO(); logo().resize((400, 400)).save(b, "PNG", optimize=True); schreib("Logo-Entwurf-Kunde.png", b.getvalue())
    b = io.BytesIO(); skizze().resize((900, 600)).convert("P", palette=Image.ADAPTIVE, colors=32).save(b, "PNG", optimize=True); schreib("Skizze-Schaufenster.png", b.getvalue())
    p = os.path.join(ZIEL, "Preisliste-Beispiel.pdf"); preisliste(p); out["Preisliste-Beispiel.pdf"] = os.path.getsize(p)
    p = os.path.join(ZIEL, "Ablauf-Motiv-bis-Rechnung.pdf"); ablauf(p); out["Ablauf-Motiv-bis-Rechnung.pdf"] = os.path.getsize(p)
    k = f"{KUNDE['person']} <{KUNDE['mail']}>"; w = f"{WERKSTATT['person']} <{WERKSTATT['mail']}>"
    schreib("Anfrage-Tomys-Hub.eml", mail(k, w, "Anfrage: ein System für Aufträge, Zeiten und Rechnungen",
        dt.datetime(2026, 6, 2, 9, 14, tzinfo=TZ),
        "Hallo Frau Beispiel,\n\nwir sind ein kleiner Betrieb für Digitaldruck, Stickerei und Werbeartikel.\n"
        "Unsere Aufträge laufen über Papierzettel, die Motive kommen per Mail und gehen oft verloren.\n"
        "Die Arbeitszeit je Auftrag schreiben wir nicht auf, und die Rechnungen tippen wir für die\n"
        "Buchhaltung ein zweites Mal ab.\n\nKönnen wir uns dazu einmal zusammensetzen? Ein Foto von einem\n"
        "unserer Auftragszettel lege ich bei.\n\nViele Grüße\nMax Beispiel\nTomys Hub · Musterstraße 12 · 12345 Musterstadt · 030 23125456\n",
        ("Auftragszettel-Papier.jpg", open(os.path.join(ZIEL, "Auftragszettel-Papier.jpg"), "rb").read(), "image/jpeg")))
    csv = ("Kundennummer;Firma;Ort;Letzter Auftrag\nKD-0001;Sportverein Beispiel e. V.;Musterstadt;2026-05-28\n"
           "KD-0002;Bäckerei Beispiel;Musterdorf;2026-05-30\nKD-0003;Café Beispiel;Musterstadt;2026-06-01\n").encode("utf-8")
    schreib("Rueckfrage-Buchhaltung.eml", mail(k, w, "Re: Bedarfsgespräch — Buchhaltung und Kundenliste",
        dt.datetime(2026, 6, 4, 17, 2, tzinfo=TZ),
        "Hallo Frau Beispiel,\n\ndanke für das Gespräch. Zu Ihren Fragen:\n\n"
        "1. Die Buchhaltung machen wir selbst (EÜR), die Steuerberaterin will eine DATEV-Datei.\n"
        "2. Die Kundenliste aus unserem alten Programm hängt als CSV an.\n"
        "3. Auf dem Tablet sollen auch die Mitarbeiter arbeiten — jeder mit eigener PIN.\n\n"
        "Viele Grüße\nMax Beispiel\n",
        ("Kundenliste-alt.csv", csv, "text/csv")))
    with open(os.path.join(WURZEL, "assets", "daten", "beispiel-unterschriften.js"), "w") as fh:
        fh.write("/* Erfundene Unterschriften für den Beispielvorgang „Tomys Hub — Gesamtprogramm“, gebaut mit\n"
                 "   tools/beispiel-dateien.py. KEINE echte Unterschrift — Wellenlinien aus einem Zufallsgenerator. */\n"
                 "(function (g) {\n  \"use strict\";\n  var WN = g.WN = g.WN || {};\n"
                 f"  WN.beispielUnterschriften = {{\n    betrieb: \"{unterschrift(11)}\",\n    kunde: \"{unterschrift(23)}\",\n  }};\n"
                 "})(typeof window !== \"undefined\" ? window : globalThis);\n")
    for n, g in out.items(): print(f"{n:34} {g/1024:6.1f} KB")


if __name__ == "__main__":
    main()
