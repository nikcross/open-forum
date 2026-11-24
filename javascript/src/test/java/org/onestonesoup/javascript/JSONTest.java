package org.onestonesoup.javascript;

import junit.framework.TestCase;

import org.mozilla.javascript.Context;
import org.onestonesoup.javascript.engine.JSON;
import org.onestonesoup.javascript.engine.JavascriptEngine;

/*
 * OFS-B-009: JSON.parse must only ever read JSON. It must never run its text as a script.
 */
public class JSONTest extends TestCase {

	private JavascriptEngine engine;

	public void setUp() {
		engine = new JavascriptEngine();
		engine.mount("JSON", new JSON(engine));
	}

	private String run(String script) throws Throwable {
		return "" + engine.runJavascript("test.sjs", script);
	}

	private void refused(String text) throws Throwable {
		engine.mount("text", text);
		assertEquals(text, "refused", run("var out='accepted'; try { JSON.parse(''+text); } catch(e) { out='refused'; } out;"));
	}

	public void testValidJson() throws Throwable {
		assertEquals("1,2,x,null,true,-1.5,nested", run("var o=JSON.parse('{\"a\":[1,2],\"b\":\"x\",\"c\":null,\"d\":true,\"e\":-1.5,\"f\":{\"g\":\"nested\"}}'); [o.a[0],o.a[1],o.b,''+o.c,o.d,o.e,o.f.g].join(',');"));
	}

	public void testValuesAreOrdinaryJavascriptValues() throws Throwable {
		assertEquals("number,string,boolean,object,true,3,ab", run("var o=JSON.parse('{\"n\":1,\"s\":\"a\",\"t\":true,\"l\":[1,2,3]}'); [typeof o.n,typeof o.s,typeof o.t,typeof o.l,o.l instanceof Array,o.l.length,o.s.concat('b')].join(',');"));
		assertEquals("true", run("JSON.parse('{\"n\":1}').n === 1;"));
		assertEquals("true", run("JSON.parse('{\"s\":\"a\"}').s === 'a';"));
		assertEquals("a,b", run("var k=[]; for(var i in JSON.parse('{\"a\":1,\"b\":2}')) k.push(i); k.join(',');"));
	}

	public void testArraysWork() throws Throwable {
		assertEquals("2", run("var n=0; JSON.parse('[1,1]').forEach(function(v) { n+=v; }); n;"));
		assertEquals("0", run("JSON.parse('[]').length;"));
	}

	public void testUnicodeAndEscapes() throws Throwable {
		engine.mount("text", "{\"a\":\"caf\u00e9 \\u2713 \\n \\\" \u2028\"}");
		assertEquals("caf\u00e9 \u2713 \n \" \u2028", run("JSON.parse(''+text).a;"));
	}

	public void testWhiteSpaceAndByteOrderMark() throws Throwable {
		engine.mount("text", "\uFEFF \r\n\t{ \"a\" : 1 }\n");
		assertEquals("1", run("JSON.parse(''+text).a;"));
	}

	public void testNullGivesNull() throws Throwable {
		assertNull(new JSON(engine).parse(null));
		assertEquals("true", run("JSON.parse('null') === null;"));
		assertEquals("true", run("JSON.parse(null) === null;"));
	}

	public void testReviver() throws Throwable {
		assertEquals("4", run("JSON.parse('{\"a\":2}', function(k,v) { return typeof v == 'number' ? v*2 : v; }).a;"));
	}

	public void testRoundTrip() throws Throwable {
		assertEquals("{\"a\":[1,{\"b\":\"x\"}]}", run("JSON.stringify(JSON.parse('{\"a\":[1,{\"b\":\"x\"}]}'));"));
	}

	public void testTextIsNeverRun() throws Throwable {
		run("var ran = 0;");
		String[] texts = { "(ran=1)", "ran=1", "[ran=1]", "{\"a\":(ran=1)}", "function(){ ran=1; }()", "{\"a\":1};ran=1", "{\"a\":1}ran=1",
				"{get a(){ ran=1; }}", "1;ran=1", "\"x\";ran=1", "null,ran=1", "/*c*/ran=1", "{}\nran=1", "new Packages.java.util.Date()", "ran" };
		for (String text : texts) {
			refused(text);
		}
		assertEquals("0", run("ran;"));
	}

	public void testLooseTextIsRefused() throws Throwable {
		String[] texts = { "{a:1}", "{'a':1}", "{\"a\":1,}", "[1,]", "{\"a\":1} //c", "/*c*/{}", "undefined", "NaN", "", " ", "hello", "{", "\"x", "01", "{\"a\":0x1}" };
		for (String text : texts) {
			refused(text);
		}
	}

	public void testErrorIsASyntaxError() throws Throwable {
		assertEquals("SyntaxError", run("var n=''; try { JSON.parse('{a:1}'); } catch(e) { n=e.name; } n;"));
	}

	public void testDoesNotSetAGlobalResult() throws Throwable {
		assertEquals("mine", run("var result='mine'; JSON.parse('{\"a\":1}'); result;"));
	}

	// The server also parses from its own threads, where no script is running.
	public void testFromJavaWithNoContext() throws Throwable {
		final String[] outcome = new String[1];
		Thread thread = new Thread() {
			public void run() {
				try {
					assertNull(Context.getCurrentContext());
					assertNotNull(new JSON(engine).parse("{\"a\":1}"));
					assertNull(Context.getCurrentContext());
					try {
						new JSON(engine).parse("{a:1}");
						fail("Loose text was accepted");
					} catch (RuntimeException expected) {
					}
					assertNull(Context.getCurrentContext());
					outcome[0] = "ok";
				} catch (Throwable t) {
					outcome[0] = "" + t;
				}
			}
		};
		thread.start();
		thread.join();
		assertEquals("ok", outcome[0]);
	}

	public void testPrototypeIsNotChanged() throws Throwable {
		assertEquals("undefined", run("JSON.parse('{\"__proto__\":{\"x\":1},\"constructor\":{\"prototype\":{\"x\":1}}}'); typeof ({}).x;"));
	}

	public void testLargeText() throws Throwable {
		StringBuilder text = new StringBuilder("[");
		for (int i = 0; i < 50000; i++) {
			text.append(i == 0 ? "" : ",").append("{\"i\":").append(i).append("}");
		}
		engine.mount("text", text.append("]").toString());
		assertEquals("50000", run("JSON.parse(''+text).length;"));
	}
}
