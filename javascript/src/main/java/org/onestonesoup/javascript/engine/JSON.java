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
	 * as JSON, and text that is not strict JSON is refused with a SyntaxError.
	 */
	public Object parse(String jtext, Callable reviver) throws Throwable {
		if(jtext==null) {
			return null; // As before, and as JSON.parse(null) in a browser
		}
		if(jtext.length()>0 && jtext.charAt(0)=='\uFEFF') {
			jtext = jtext.substring(1); // Byte order mark left by some editors
		}

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
}
