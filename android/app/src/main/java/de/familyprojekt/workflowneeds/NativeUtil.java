package de.familyprojekt.workflowneeds;

import java.util.Locale;

/** Kleine Helfer der Hülle. Rein, ohne Android, in JVM-Proben geprüft (NativeUtilTest). */
final class NativeUtil {
    private NativeUtil() { }

    static String hex(byte[] value) {
        StringBuilder out = new StringBuilder(value.length * 2);
        for (byte b : value) out.append(String.format(Locale.ROOT, "%02x", b & 255));
        return out.toString();
    }

    /**
     * Zahl aus einem Brücken-Aufruf. Nie Capacitors getLong für kleine Zahlen: die kommen aus dem JSON als Integer an, getLong
     * gibt dann den Ersatzwert zurück (Familienakte, Gerätetest 11.11.2026: „Größe -1 statt 0“). Darum jede Zahl annehmen.
     */
    static long zahl(Object wert, long ersatz) {
        if (!(wert instanceof Number)) return ersatz;
        double d = ((Number) wert).doubleValue();
        if (!Double.isFinite(d) || d != Math.rint(d)) return ersatz;
        return ((Number) wert).longValue();
    }

    /** Dateiname für „Speichern unter“ und den Druckauftrag: keine Pfad- und Steuerzeichen, nie leer, höchstens 180 Zeichen. */
    static String dateiname(String value) {
        String name = value == null ? "" : value.replaceAll("[\\p{Cntrl}/\\\\:*?\"<>|]", "_").trim();
        while (name.endsWith(".") || name.endsWith(" ")) name = name.substring(0, name.length() - 1);
        if (name.isEmpty() || name.equals(".") || name.equals("..")) return "Workflow-Needs";
        if (name.length() > 180) name = name.substring(0, 180);
        return name;
    }

    /** Dateiart für Androids Speichern-Fenster; alles Unbekannte als Bytes. */
    static String mime(String value) {
        if (value == null) return "application/octet-stream";
        String m = value.split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
        return m.matches("[a-z0-9.+-]+/[a-z0-9.+-]+") ? m : "application/octet-stream";
    }

    /** Klaus' eigene Apps unter lausiklauskn-png.github.io (BookLedgerPro, WorkFloh) dürfen auch ohne Tipp im Browser geöffnet werden. */
    static boolean eigeneAdresse(String scheme, String host) {
        return "https".equals(scheme) && "lausiklauskn-png.github.io".equals(host);
    }
}
