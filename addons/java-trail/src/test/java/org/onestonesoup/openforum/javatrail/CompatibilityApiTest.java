package org.onestonesoup.openforum.javatrail;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CompatibilityApiTest {
    @Test
    void legacyApiNamesAndReturnTypesRemainAvailableToPages() throws Exception {
        assertNotNull(Class.forName("org.onestonesoup.openforum.javatrail.JavaTrail").getConstructor().newInstance());
        assertEquals(SimpleDebugVM.class, JavaTrail.class.getMethod("connect", String.class, String.class).getReturnType());
        assertEquals(SimpleDebugVM.class, JavaTrailCam.class.getMethod("connect", String.class, String.class).getReturnType());
        assertEquals(SimpleDebugVM.class, JavaTrailSystemHelper.class.getMethod("connectJavaTrail", String.class, String.class).getReturnType());
        assertNotNull(SimpleDebugVM.class.getMethod("watch", String.class, String.class));
        assertNotNull(SimpleDebugVM.class.getMethod("checkForChanges"));
        assertNotNull(SimpleDebugVM.class.getMethod("getMatchingClasses", String.class, int.class));
        assertNotNull(SimpleDebugVM.class.getMethod("getFieldNames", String.class));
        assertNotNull(SimpleDebugVM.class.getMethod("disconnect"));
    }

    @Test
    void adapterUsesIndependentConfigAndRetainsErrorContract() {
        JavaTrailCam.Config config = JavaTrailCam.Config.fromString(
            "{\"port\":\"5005\",\"startClass\":\"example.App\",\"startMethod\":\"run\"}");
        assertEquals("localhost", config.getHost());
        assertEquals("example.App", config.getStartClass());
        assertTrue(new JavaTrailCam().processUsingConfig("{}").startsWith("Exception: "));
    }
}
