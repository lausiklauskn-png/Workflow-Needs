package de.familyprojekt.workflowneeds;

import static org.junit.Assert.*;

import org.junit.Test;

public class NativeUtilTest {
    @Test public void zahlNimmtAuchInteger() {
        // Familienakte, Gerätetest 11.11.2026: kleine Zahlen kommen als Integer – getLong gab den Ersatzwert.
        assertEquals(0L, NativeUtil.zahl(Integer.valueOf(0), -1));
        assertEquals(1048576L, NativeUtil.zahl(Integer.valueOf(1048576), -1));
        assertEquals(5000000000L, NativeUtil.zahl(Long.valueOf(5000000000L), -1));
        assertEquals(7L, NativeUtil.zahl(Double.valueOf(7.0), -1));
        assertEquals(-1L, NativeUtil.zahl(Double.valueOf(7.5), -1));
        assertEquals(-1L, NativeUtil.zahl("7", -1));
        assertEquals(-1L, NativeUtil.zahl(null, -1));
    }
    @Test public void dateinamenOhnePfadUndSteuerzeichen() {
        assertEquals("Auftrag-VG-01-F1.json", NativeUtil.dateiname("Auftrag-VG-01-F1.json"));
        assertEquals("a_b_c.md", NativeUtil.dateiname("a/b\\c.md"));
        assertEquals("x_y", NativeUtil.dateiname("x:y"));
        assertEquals("Workflow-Needs", NativeUtil.dateiname(null));
        assertEquals("Workflow-Needs", NativeUtil.dateiname(".."));
        assertEquals("Workflow-Needs", NativeUtil.dateiname("  ...  "));
        assertEquals(180, NativeUtil.dateiname(new String(new char[400]).replace('\0', 'a')).length());
    }
    @Test public void dateiart() {
        assertEquals("application/json", NativeUtil.mime("application/json"));
        assertEquals("text/markdown", NativeUtil.mime("text/markdown;charset=utf-8"));
        assertEquals("application/octet-stream", NativeUtil.mime(null));
        assertEquals("application/octet-stream", NativeUtil.mime("kein typ"));
    }
    @Test public void hexUndAdressen() {
        assertEquals("00ff10", NativeUtil.hex(new byte[] { 0, (byte) 255, 16 }));
        assertTrue(NativeUtil.eigeneAdresse("https", "lausiklauskn-png.github.io"));
        assertFalse(NativeUtil.eigeneAdresse("http", "lausiklauskn-png.github.io"));
        assertFalse(NativeUtil.eigeneAdresse("https", "example.com"));
    }
}
