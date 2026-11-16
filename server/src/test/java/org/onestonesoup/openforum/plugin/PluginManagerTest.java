package org.onestonesoup.openforum.plugin;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotSame;
import static org.junit.Assert.assertSame;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;

import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.onestonesoup.openforum.filemanager.LocalDriveResourceStore;
import org.onestonesoup.openforum.filemanager.ResourceStore;

/**
 * OFS-B-002: replacing a jar on an API page must be picked up at runtime.
 */
public class PluginManagerTest {

	private static final String PAGE = "/TestPlugin";
	private static final String CLASS_NAME = "testplugin.Greeter";

	private Path root;
	private Path jar;
	private TestPluginManager pluginManager;

	private static class TestPluginManager extends PluginManager {
		private ResourceStore store;
		private List<String> initialised = new ArrayList<String>();
		private String[] apiJars = null;

		TestPluginManager(ResourceStore store) throws Throwable {
			super(null, null);
			this.store = store;
		}

		@Override
		protected ResourceStore resourceStore() {
			return store;
		}

		@Override
		protected void log(String message) {
		}

		@Override
		protected String getClassNameForApi(String pageName) {
			return PAGE.equals(pageName) ? CLASS_NAME : null;
		}

		@Override
		protected String[] getJarNamesForApi(String pageName) {
			return PAGE.equals(pageName) ? apiJars : null;
		}

		@Override
		protected void initialiseAPI(String pageName) {
			initialised.add(pageName);
		}
	}

	@Before
	public void setUp() throws Throwable {
		root = Files.createTempDirectory("plugin-manager-test");
		Files.createDirectories(root.resolve(PAGE.substring(1)));
		jar = root.resolve(PAGE.substring(1)).resolve("plugin.jar");
		pluginManager = new TestPluginManager(new LocalDriveResourceStore(root.toString(), false));
	}

	@After
	public void tearDown() throws IOException {
		Files.walk(root).sorted((a, b) -> b.compareTo(a)).map(Path::toFile).forEach(File::delete);
	}

	@Test
	public void replacedJarIsReloadedOnNextRequest() throws Throwable {
		buildJar(jar, "v1", 1_000_000_000_000L);

		Object first = pluginManager.getApi(PAGE);
		assertEquals("v1", first.toString());
		assertSame("unchanged jar keeps the same instance", first, pluginManager.getApi(PAGE));

		buildJar(jar, "v2", 1_000_000_005_000L);

		Object second = pluginManager.getApi(PAGE);
		assertEquals("v2", second.toString());
		assertNotSame(first.getClass().getClassLoader(), second.getClass().getClassLoader());
		assertSame("reloaded API is kept under its page name", second, pluginManager.getApi(PAGE));
	}

	@Test
	public void reloadRunsInitialiseAgainOncePerApi() throws Throwable {
		buildJar(jar, "v1", 1_000_000_000_000L);
		pluginManager.getApi(PAGE);
		assertEquals(1, pluginManager.initialised.size());

		buildJar(jar, "v2", 1_000_000_005_000L);
		pluginManager.getApi(PAGE);
		assertEquals(2, pluginManager.initialised.size());
	}

	@Test
	public void updateClassPathAfterReloadDoesNotFail() throws Throwable {
		buildJar(jar, "v1", 1_000_000_000_000L);
		pluginManager.getApi(PAGE);
		buildJar(jar, "v2", 1_000_000_005_000L);
		pluginManager.getApi(PAGE);

		pluginManager.updateClassPath();
		assertEquals("v2", pluginManager.getApi(PAGE).toString());
	}

	@Test
	public void apiJarsLoadsOnlyTheListedJar() throws Throwable {
		buildJar(pageFile("a.jar"), "A", 1_000_000_000_000L);
		buildJar(pageFile("b.jar"), "B", 1_000_000_000_000L);
		pluginManager.apiJars = new String[] { "b.jar" };

		assertEquals("B", pluginManager.getApi(PAGE).toString());
	}

	@Test
	public void apiJarsSkipsAMissingJar() throws Throwable {
		buildJar(pageFile("b.jar"), "B", 1_000_000_000_000L);
		pluginManager.apiJars = new String[] { "missing.jar", " b.jar " };

		assertEquals("B", pluginManager.getApi(PAGE).toString());
	}

	@Test
	public void apiJarsCanNameAJarOnAnotherPage() throws Throwable {
		Files.createDirectories(root.resolve("Shared"));
		buildJar(root.resolve("Shared").resolve("lib.jar"), "shared", 1_000_000_000_000L);
		buildJar(pageFile("a.jar"), "A", 1_000_000_000_000L);
		pluginManager.apiJars = new String[] { "/Shared/lib.jar" };

		assertEquals("shared", pluginManager.getApi(PAGE).toString());
	}

	@Test
	public void changingApiJarsInDataJsonSwitchesJarAtRuntime() throws Throwable {
		buildJar(pageFile("a.jar"), "A", 1_000_000_000_000L);
		buildJar(pageFile("b.jar"), "B", 1_000_000_000_000L);
		Path dataJson = pageFile("data.json");
		Files.write(dataJson, "{}".getBytes("UTF-8"));
		dataJson.toFile().setLastModified(1_000_000_000_000L);
		pluginManager.apiJars = new String[] { "a.jar" };
		Object first = pluginManager.getApi(PAGE);
		assertEquals("A", first.toString());

		pluginManager.apiJars = new String[] { "b.jar" };
		assertSame("no reload until data.json changes", first, pluginManager.getApi(PAGE));

		dataJson.toFile().setLastModified(1_000_000_005_000L);
		assertEquals("a.jar dropped, b.jar loaded", "B", pluginManager.getApi(PAGE).toString());
	}

	private Path pageFile(String name) {
		return root.resolve(PAGE.substring(1)).resolve(name);
	}

	private void buildJar(Path jar, String version, long lastModified) throws IOException {
		Path src = Files.createTempDirectory("plugin-src");
		try {
			Path javaFile = src.resolve("Greeter.java");
			Files.write(javaFile, ("package testplugin; public class Greeter {"
					+ " public String toString() { return \"" + version + "\"; } }").getBytes("UTF-8"));
			JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
			int result = compiler.run(null, null, null, "-d", src.toString(), javaFile.toString());
			assertEquals("compile test plugin", 0, result);

			try (JarOutputStream out = new JarOutputStream(new FileOutputStream(jar.toFile()))) {
				out.putNextEntry(new JarEntry("testplugin/Greeter.class"));
				out.write(Files.readAllBytes(src.resolve("testplugin/Greeter.class")));
				out.closeEntry();
			}
			jar.toFile().setLastModified(lastModified);
		} finally {
			Files.walk(src).sorted((a, b) -> b.compareTo(a)).map(Path::toFile).forEach(File::delete);
		}
	}
}
