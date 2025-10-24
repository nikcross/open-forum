package org.onestonesoup.openforum.javatrail;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class JavaTrailCamConfigTest {

    @Test
    @DisplayName("Parses minimal configuration with defaults")
    void testParsesMinimalConfigurationWithDefaults() throws IOException {
        //Given
        //A temporary JSON config containing only the required values
        Path configFile = Files.createTempFile("javatrailcam-min-config", ".json");
        Files.writeString(configFile, "{\"port\":\"5008\",\"startClass\":\"com.example.Foo\",\"startMethod\":\"run\"}");

        try {
            //When
            //The configuration loader reads the JSON file
            JavaTrailCam.Config config = JavaTrailCam.Config.load(configFile);

            //Then
            //Defaulted properties should be applied alongside the provided values
            assertEquals("localhost", config.getHost());
            assertEquals("5008", config.getPort());
            assertEquals("com.example.Foo", config.getStartClass());
            assertEquals("run", config.getStartMethod());
            assertEquals(-1, config.getMaxDepth());
            assertEquals(0L, config.getMaxDurationMillis());
            assertTrue(config.getIncludePackages().isEmpty());
            assertTrue(config.getExcludePackages().isEmpty());
            assertFalse(config.isSkipOutsideDomain());
            assertEquals(0L, config.getAwaitCompletionMillis());
            assertNull(config.getOutputFile());
            assertFalse(config.isOutputFileAbsolute());
        } finally {
            Files.deleteIfExists(configFile);
        }
    }

    @Test
    @DisplayName("Rejects configuration missing required fields")
    void testRejectsConfigurationMissingRequiredFields() throws IOException {
        //Given
        //A temporary JSON config that omits the port value
        Path configFile = Files.createTempFile("javatrailcam-missing-port", ".json");
        Files.writeString(configFile, "{\"startClass\":\"com.example.Foo\",\"startMethod\":\"run\"}");

        try {
            //When
            //The configuration loader processes the incomplete configuration
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                    () -> JavaTrailCam.Config.load(configFile));

            //Then
            //An informative message should explain the missing requirement
            assertEquals("Debug port is required", exception.getMessage());
        } finally {
            Files.deleteIfExists(configFile);
        }
    }

    @Test
    @DisplayName("Parses include and exclude packages and protects immutability")
    void testParsesIncludeAndExcludePackagesAndProtectsImmutability() throws IOException {
        //Given
        //A temporary JSON config with include/exclude arrays and additional options
        Path configFile = Files.createTempFile("javatrailcam-full-config", ".json");
        String json = "{"
                + "\"host\":\"debug.example.com\","
                + "\"port\":\"6000\","
                + "\"startClass\":\"com.example.Root\","
                + "\"startMethod\":\"execute\","
                + "\"includePackages\":[\"com.example\",\"org.sample\"],"
                + "\"excludePackages\":[\"java.\",\"sun.\"],"
                + "\"skipOutsideDomain\":true,"
                + "\"maxDepth\":5,"
                + "\"maxDurationMillis\":15000,"
                + "\"awaitCompletionMillis\":20000,"
                + "\"outputFile\":\"trace-output.json\""
                + "}";
        Files.writeString(configFile, json);

        try {
            //When
            //The configuration loader reads the fully populated file
            JavaTrailCam.Config config = JavaTrailCam.Config.load(configFile);

            //Then
            //Values should reflect the JSON content and guarded collections stay immutable
            assertEquals("debug.example.com", config.getHost());
            assertEquals(List.of("com.example", "org.sample"), config.getIncludePackages());
            assertEquals(List.of("java.", "sun."), config.getExcludePackages());
            assertTrue(config.isSkipOutsideDomain());
            assertEquals(5, config.getMaxDepth());
            assertEquals(15000L, config.getMaxDurationMillis());
            assertEquals(20000L, config.getAwaitCompletionMillis());
            assertEquals("trace-output.json", config.getOutputFile());
            assertFalse(config.isOutputFileAbsolute());

            assertThrows(UnsupportedOperationException.class,
                    () -> config.getIncludePackages().add("net.other"));
            assertThrows(UnsupportedOperationException.class,
                    () -> config.getExcludePackages().add("com.blocked"));
        } finally {
            Files.deleteIfExists(configFile);
        }
    }

    @Test
    @DisplayName("Parses include and exclude package arrays supplied as JSON")
    void testParsesIncludeAndExcludePackageArrays() {
        //Given
        //A JSON string containing includePackages and excludePackages arrays
        String json = "{"
                + "\"port\":\"5050\","
                + "\"startClass\":\"com.example.Root\","
                + "\"startMethod\":\"execute\","
                + "\"includePackages\":[\"com.example.app\",\"org.partner.feature\"],"
                + "\"excludePackages\":[\"java.\",\"javax.\"]"
                + "}";

        //When
        //The configuration is parsed from the JSON payload
        JavaTrailCam.Config config = JavaTrailCam.Config.fromString(json);

        //Then
        //Include and exclude package lists reflect the JSON arrays exactly
        assertEquals(List.of("com.example.app", "org.partner.feature"), config.getIncludePackages());
        assertEquals(List.of("java.", "javax."), config.getExcludePackages());
    }

    @Test
    @DisplayName("Ignores include and exclude package fields when not expressed as arrays")
    void testIgnoresIncludeAndExcludePackagesIfNotArrays() {
        //Given
        //A JSON string where includePackages and excludePackages are not arrays
        String json = "{"
                + "\"port\":\"5050\","
                + "\"startClass\":\"com.example.Root\","
                + "\"startMethod\":\"execute\","
                + "\"includePackages\":\"com.example\","
                + "\"excludePackages\":\"java.\""
                + "}";

        //When
        //The configuration is parsed despite the incorrect package format
        JavaTrailCam.Config config = JavaTrailCam.Config.fromString(json);

        //Then
        //Package lists remain empty, demonstrating that arrays are the required format
        assertTrue(config.getIncludePackages().isEmpty());
        assertTrue(config.getExcludePackages().isEmpty());
    }
}
