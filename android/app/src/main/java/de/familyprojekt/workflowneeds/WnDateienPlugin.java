package de.familyprojekt.workflowneeds;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * „Speichern unter …“ für Workflow Needs Pro (Klaus 15.11.2026): die Android-WebView kann kein <a download> (Auftragsdatei,
 * Sicherung, Bauauftrag, Anhänge, Tabellen). native/wn-native.js fängt jeden solchen Klick ab und reicht den Inhalt hierher.
 * Übernommen aus Datei-Organizer Pro / BookLedgerPro BlpFilesPlugin (Befund SD-Karte 03.11.: Inhalt vor dem Dialog in den
 * Zwischenspeicher, sonst bleibt bei einem Abbruch eine leere Datei stehen; schlägt das Schreiben fehl, wird die angelegte Datei
 * wieder gelöscht). Gespeichert wird nur dorthin, wo der Mensch im Android-Dialog hinzeigt.
 */
@CapacitorPlugin(name = "WnDateien")
public final class WnDateienPlugin extends Plugin {
    static final int MAX_BYTES = 100 * 1024 * 1024;
    private final PluginWorker worker = new PluginWorker("dateien");
    private File offen() { return new File(new File(getContext().getCacheDir(), "speichern"), "offen.bin"); }

    @PluginMethod public void speichern(PluginCall call) {
        String data = call.getString("data");
        byte[] bytes;
        try { bytes = data == null || data.length() > MAX_BYTES / 3 * 4 + 8 ? null : Base64.decode(data, Base64.DEFAULT); }
        catch (IllegalArgumentException kaputt) { bytes = null; }
        if (bytes == null) { call.reject("WN_DATEI_UNGUELTIG"); return; }
        File datei = offen();
        try {
            File dir = datei.getParentFile();
            if (dir != null && !dir.isDirectory() && !dir.mkdirs()) throw new java.io.IOException();
            try (FileOutputStream out = new FileOutputStream(datei)) { out.write(bytes); out.getFD().sync(); }
        } catch (Exception keinPlatz) { datei.delete(); call.reject("WN_KEIN_PLATZ"); return; }
        String mime = call.getString("mime", "application/octet-stream");
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
            .setType(NativeUtil.mime(mime))
            .putExtra(Intent.EXTRA_TITLE, NativeUtil.dateiname(call.getString("name", "Workflow-Needs.json")));
        startActivityForResult(call, intent, "gespeichert");
    }

    @ActivityCallback private void gespeichert(PluginCall call, ActivityResult result) {
        File datei = offen();
        Intent data = result.getData();
        if (result.getResultCode() != Activity.RESULT_OK || data == null || data.getData() == null) {
            datei.delete();
            if (call != null) call.resolve(new JSObject().put("gespeichert", false));
            return;
        }
        Uri uri = data.getData();
        Runnable schreiben = () -> {
            if (!datei.isFile()) { loeschen(uri); if (call != null) call.reject("WN_SPEICHERN_FEHLER"); return; }
            long soll = datei.length();
            try {
                OutputStream out;
                try { out = getContext().getContentResolver().openOutputStream(uri, "wt"); }
                catch (Exception keinWt) { out = getContext().getContentResolver().openOutputStream(uri, "w"); } // frisch angelegt, also leer
                if (out == null) throw new java.io.IOException("WN_SPEICHERN_FEHLER");
                try (OutputStream o = out; InputStream in = new FileInputStream(datei)) {
                    byte[] puffer = new byte[65536]; int n;
                    while ((n = in.read(puffer)) != -1) o.write(puffer, 0, n);
                    o.flush();
                }
                if (soll > 0 && groesse(uri) == 0) throw new java.io.IOException("WN_SPEICHERN_FEHLER");
                datei.delete();
                if (call != null) call.resolve(new JSObject().put("gespeichert", true));
            } catch (Exception error) {
                datei.delete(); loeschen(uri);
                if (call != null) call.reject("WN_SPEICHERN_FEHLER");
            }
        };
        if (call == null) worker.execute(schreiben); else worker.submit(call, schreiben);
    }
    private void loeschen(Uri uri) { try { DocumentsContract.deleteDocument(getContext().getContentResolver(), uri); } catch (Exception egal) { /* gemeldet */ } }
    private long groesse(Uri uri) {
        try (Cursor c = getContext().getContentResolver().query(uri, new String[] { OpenableColumns.SIZE }, null, null, null)) {
            if (c != null && c.moveToFirst() && !c.isNull(0)) return c.getLong(0);
        } catch (Exception unbekannt) { /* manche Anbieter nennen keine Größe */ }
        return -1;
    }

    @PluginMethod public void appInfo(PluginCall call) {
        try {
            android.content.pm.PackageInfo info = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            call.resolve(new JSObject().put("version", info.versionName == null ? "" : info.versionName).put("plattform", "android"));
        } catch (Exception error) { call.reject("APP_INFO_UNAVAILABLE"); }
    }

    @Override protected void handleOnDestroy() { worker.close(() -> { }); }
}
