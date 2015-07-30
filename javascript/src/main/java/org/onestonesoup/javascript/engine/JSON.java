package org.onestonesoup.javascript.engine;

import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.NativeJSON;
import org.mozilla.javascript.Scriptable;

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
	
	public Object parse(String jtext, Callable reviver) throws Throwable {
		//return NativeJSON.parse(jsEngine.getJsContext(), jsEngine.getJsScope(), jtext, reviver);
		return jsEngine.evaluateJavascript("JSON.parse", "result = "+jtext);
	}
}
