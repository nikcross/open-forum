package org.onestonesoup.openforum.controller;

import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.security.Login;

public interface OpenForumScripting {
	JavascriptEngine getJavascriptEngine(Login login);
}
