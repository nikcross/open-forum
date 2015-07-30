package org.onestonesoup.openforum.security.www;

import java.io.IOException;

import org.onestonesoup.core.StringHelper;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.KeyValuePair;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileServer;
import org.onestonesoup.openforum.security.Authenticator;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.servlet.ClientConnectionInterface;
import org.onestonesoup.openforum.servlet.HttpHeader;
import org.onestonesoup.openforum.transaction.HttpRequestHelper;
import org.onestonesoup.openforum.transaction.HttpResponseHeader;

public class WWWAuthenticator implements Authenticator {
	private static final String AUTHENTICATION_PAGE="/OpenForum/Authentication";
	private static final String LOGIN_SCRIPT_FILE="login.sjs";
	
	private OpenForumController controller;
	private FileServer fileServer;
	
	public Login authenticate(HttpHeader httpHeader) throws IOException {
		EntityTree.TreeEntity authorisation = httpHeader.getChild("authorization");
		Login login = null;
		
		if(authorisation==null)
		{
			login = Login.getGuestLogin();
		}
		else
		{
			String data = authorisation.getValue();
			data = data.substring(6);
			
			data = new String( StringHelper.decodeBase64(data) );
				
			KeyValuePair value = KeyValuePair.parseKeyAndValue(data,":");
			if(value==null || value.equals(":")) {
				return Login.getGuestLogin();
			} else {
				login = new Login(value.getKey(),value.getValue());
			}
			
			JavascriptEngine js = controller.getJavascriptEngine(controller.getSystemLogin());
			js.mount("login", login);
			try{
				String script = controller.getFileManager().getPageAttachmentAsString(AUTHENTICATION_PAGE, LOGIN_SCRIPT_FILE, controller.getSystemLogin());
				String result = js.runJavascript(AUTHENTICATION_PAGE + "/" + LOGIN_SCRIPT_FILE, script);
				login.setLoggedIn(Boolean.parseBoolean(result));
			} catch(Throwable t) {
				throw new IOException(t);
			}
		}

		return login;
	}

	public boolean obtainAuthentication(HttpHeader httpHeader,
			ClientConnectionInterface connection) throws IOException {		
		EntityTree parameters = HttpRequestHelper.parseHttpCookieParameters(httpHeader);
		EntityTree.TreeEntity fails = parameters.getChild("failedLogins");
		int count = 0;
		if(fails!=null)
		{
			count = Integer.parseInt( fails.getValue() );
			if(count>2)
			{
				HttpResponseHeader responseHeader = new HttpResponseHeader( httpHeader,fileServer.getMimeTypeForFileExtension("html"),401,connection);
				responseHeader.addParameter( "Set-Cookie","failedLogins=0" );
				fileServer.send401File(connection);
			}
		}
		
		count++;
		HttpResponseHeader responseHeader = new HttpResponseHeader( httpHeader,fileServer.getMimeTypeForFileExtension("html"),401,connection);
		responseHeader.addParameter( "WWW-Authenticate","Basic realm=\""+controller.getDomainName()+"\"" );
		responseHeader.addParameter( "Set-Cookie","failedLogins="+count );

		long size = fileServer.send401File(connection);
		return true;
	}

	public void setController(OpenForumController controller) {
		this.controller = controller;
	}

	public void setFileServer(FileServer fileServer) {
		this.fileServer = fileServer;
	}
}
