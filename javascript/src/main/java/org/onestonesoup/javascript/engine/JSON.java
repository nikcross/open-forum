package org.onestonesoup.javascript.engine;

import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.NativeJSON;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.json.JsonParser;

public class JSON {
	private  JavascriptEngine jsEngine;

	public JSON(JavascriptEngine jsEngine) {
		this.jsEngine=jsEngine;
	}
	public Object stringify(Object value) {
		return stringify(value,null,null);
	}
	public Object stringify(Object value, Object replacer, Object space) {
		return NativeJSON.stringify(jsEngine.getJsContext(), jsEngine.getJsScope(), value, replacer, space);
	}
	
	public Object parse(String jtext) throws Throwable {
		return parse(jtext,null);
	}
	
	/*
	 * OFS-B-009: this used to run the text as a script ("result = "+jtext), so anyone who could send
	 * text to a service that parses it could run code on the server. The text is now only ever read
	 * as JSON, and text that is not strict JSON is refused with a SyntaxError. The one exception is a
	 * block comment before the JSON: the FileManager and Publisher scripts write new data.json files as
	 * a comment followed by {}, and every server has some.
	 */
	public Object parse(String jtext, Callable reviver) throws Throwable {
		if(jtext==null) {
			return null; // As before, and as JSON.parse(null) in a browser
		}
		if(jtext.length()>0 && jtext.charAt(0)=='\uFEFF') {
			jtext = jtext.substring(1); // Byte order mark left by some editors
		}

		jtext = skipLeadingComments(jtext);

		Scriptable scope = jsEngine.getJsScope();
		Context context = Context.getCurrentContext();
		boolean entered = context==null;
		if(entered) {
			context = Context.enter();
		}
		try {
			if(reviver!=null) {
				return NativeJSON.parse(context, scope, jtext, reviver);
			}
			return new JsonParser(context, scope).parseValue(jtext);
		} catch(JsonParser.ParseException e) {
			throw ScriptRuntime.constructError("SyntaxError", "JSON.parse: " + e.getMessage());
		} finally {
			if(entered) {
				Context.exit();
			}
		}
	}

	private static String skipLeadingComments(String text) {
		int start = 0;
		while(true) {
			while(start<text.length() && Character.isWhitespace(text.charAt(start))) {
				start++;
			}
			if(text.startsWith("/*", start)==false) {
				return text.substring(start);
			}
			int end = text.indexOf("*/", start+2);
			if(end==-1) {
				return text; // Not closed, so it will be refused
			}
			start = end+2;
		}
	}
}
