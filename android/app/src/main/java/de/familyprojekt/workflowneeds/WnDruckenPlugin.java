package de.familyprojekt.workflowneeds;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Drucken für Workflow Needs Pro (Klaus 15.11.2026): window.print() tut in der Android-WebView nichts. Die Web-App legt das Blatt
 * (Bedarfsprotokoll, Angebot, Nachtrag, Rechtsblätter, Sternebogen) in #druck und ruft window.print(); native/wn-native.js leitet
 * das hierher. Androids Druckdienst zeichnet die Seite mit ihren @media-print-Regeln (nur #druck sichtbar); „Als PDF speichern“
 * bietet Android im Druckfenster selbst an. Kein Recht nötig, nichts geht ohne Wahl des Menschen hinaus.
 */
@CapacitorPlugin(name = "WnDrucken")
public final class WnDruckenPlugin extends Plugin {
    @PluginMethod public void drucken(PluginCall call) {
        String titel = NativeUtil.dateiname(call.getString("titel", "Workflow Needs Pro"));
        getActivity().runOnUiThread(() -> {
            try {
                PrintManager druck = (PrintManager) getContext().getSystemService(Context.PRINT_SERVICE);
                WebView web = getBridge().getWebView();
                if (druck == null || web == null) { call.reject("WN_DRUCKEN_FEHLER"); return; }
                PrintDocumentAdapter adapter = web.createPrintDocumentAdapter(titel);
                druck.print(titel, adapter, new PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build());
                call.resolve(new JSObject().put("gestartet", true));
            } catch (Exception fehler) { call.reject("WN_DRUCKEN_FEHLER"); }
        });
    }
}
