package org.onestonesoup.javascript;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import junit.framework.TestCase;

import org.onestonesoup.javascript.engine.JavascriptEngine;

/*
 * OFS (TT-B-011): the compiled script cache must never share state between engines (each request
 * has its own engine), must compile edited text afresh, and must be safe from many threads.
 */
public class ScriptCacheTest extends TestCase {

	private static final String COUNTER = "var counter = (typeof counter == 'undefined') ? 1 : counter + 1; counter;";

	private static final String LIBRARY = "var Library = function() { var self = this; var state = 0;"
			+ " self.next = function() { state++; return state; }; };\n new Library();";

	public void setUp() {
		JavascriptEngine.clearScriptCache();
	}

	public void testEachEngineStartsFresh() throws Throwable {
		for (int i = 0; i < 5; i++) {
			JavascriptEngine engine = new JavascriptEngine();
			assertEquals("1", engine.runCachedJavascript("counter.sjs", COUNTER));
		}
		assertEquals(1, JavascriptEngine.getScriptCacheEntries());
	}

	public void testSameEngineKeepsItsOwnState() throws Throwable {
		JavascriptEngine engine = new JavascriptEngine();
		assertEquals("1", engine.runCachedJavascript("counter.sjs", COUNTER));
		assertEquals("2", engine.runCachedJavascript("counter.sjs", COUNTER));
	}

	public void testEditedTextIsCompiledAgain() throws Throwable {
		JavascriptEngine engine = new JavascriptEngine();
		assertEquals("first", engine.runCachedJavascript("edit.sjs", "'first';"));
		assertEquals("second", new JavascriptEngine().runCachedJavascript("edit.sjs", "'second';"));
		assertEquals(2, JavascriptEngine.getScriptCacheEntries());
	}

	public void testUncachedCallsDoNotFillTheCache() throws Throwable {
		JavascriptEngine engine = new JavascriptEngine();
		for (int i = 0; i < 10; i++) {
			assertEquals("" + i, engine.runJavascript("data", "" + i + ";"));
		}
		engine.evaluateJavascript("data", "var x = 1;");
		assertEquals(0, JavascriptEngine.getScriptCacheEntries());
	}

	public void testLibraryObjectsAreIndependent() throws Throwable {
		Object first = new JavascriptEngine().evaluateCachedJavascript("/Lib/Library.sjs", LIBRARY);
		Object second = new JavascriptEngine().evaluateCachedJavascript("/Lib/Library.sjs", LIBRARY);
		assertNotSame(first, second);

		JavascriptEngine engine = new JavascriptEngine();
		engine.mount("first", first);
		engine.mount("second", second);
		assertEquals("1,2,1", engine.runJavascript("use", "first.next() + ',' + first.next() + ',' + second.next();"));
	}

	public void testSyntaxErrorIsReportedAndNotCached() throws Throwable {
		try {
			new JavascriptEngine().runCachedJavascript("broken.sjs", "var x = ;");
			fail("Expected a syntax error");
		} catch (Exception e) {
			assertTrue(e.getMessage(), e.getMessage().indexOf("broken.sjs") != -1);
		}
		assertEquals(0, JavascriptEngine.getScriptCacheEntries());
	}

	public void testManyThreads() throws Throwable {
		final AtomicInteger failures = new AtomicInteger();
		final List<String> errors = new ArrayList<String>();
		List<Thread> threads = new ArrayList<Thread>();
		for (int t = 0; t < 8; t++) {
			final int id = t;
			Thread thread = new Thread(new Runnable() {
				public void run() {
					for (int i = 0; i < 50; i++) {
						try {
							JavascriptEngine engine = new JavascriptEngine();
							engine.mount("threadId", "" + id);
							String result = engine.runCachedJavascript("threads.sjs",
									"var total = 0; for (var n = 0; n < 1000; n++) total += n; threadId + ':' + total;");
							if (!result.equals(id + ":499500")) {
								failures.incrementAndGet();
								synchronized (errors) { errors.add(result); }
							}
						} catch (Throwable th) {
							failures.incrementAndGet();
							synchronized (errors) { errors.add("" + th); }
						}
					}
				}
			});
			threads.add(thread);
			thread.start();
		}
		for (Thread thread : threads) thread.join();
		assertEquals(errors.toString(), 0, failures.get());
		assertEquals(1, JavascriptEngine.getScriptCacheEntries());
	}

	// Reports how much a large library costs to compile and run, cached and not.
	public void testTiming() throws Throwable {
		StringBuilder source = new StringBuilder("var Big = function() { var self = this;\n");
		for (int i = 0; i < 3000; i++) {
			source.append("  self.f").append(i).append(" = function(a, b) { var c = a + b * ").append(i)
					.append("; if (c > 10) { return [c, a, b].join(','); } return { a: a, b: b, c: c }; };\n");
		}
		source.append("};\n new Big();");
		String script = source.toString();

		new JavascriptEngine().evaluateJavascript("warm", script);
		new JavascriptEngine().evaluateCachedJavascript("warm", script);

		int runs = 10;
		long start = System.nanoTime();
		for (int i = 0; i < runs; i++) new JavascriptEngine().evaluateJavascript("big", script);
		long uncached = (System.nanoTime() - start) / runs / 1000000;

		start = System.nanoTime();
		for (int i = 0; i < runs; i++) new JavascriptEngine().evaluateCachedJavascript("big", script);
		long cached = (System.nanoTime() - start) / runs / 1000000;

		System.out.println("ScriptCacheTest: " + (script.length() / 1024) + " KB library, uncached " + uncached
				+ " ms, cached " + cached + " ms a load");
		assertTrue("cached " + cached + " ms should be faster than uncached " + uncached + " ms", cached < uncached);
	}
}
