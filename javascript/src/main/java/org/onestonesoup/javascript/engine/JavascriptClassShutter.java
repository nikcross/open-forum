package org.onestonesoup.javascript.engine;

import org.mozilla.javascript.ClassShutter;

public class JavascriptClassShutter implements ClassShutter {

	public boolean visibleToScripts(String fullClassName) {
		//TODO
		return true;
	}
}
