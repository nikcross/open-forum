package org.onestonesoup.openforum.security.cookie;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javax.xml.bind.DatatypeConverter;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.filemanager.FileServer;
import org.onestonesoup.openforum.plugin.SystemAPI;
import org.onestonesoup.openforum.security.Authenticator;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.servlet.ClientConnectionInterface;
import org.onestonesoup.openforum.servlet.HttpHeader;
import org.onestonesoup.openforum.transaction.HttpRequestHelper;
import org.onestonesoup.openforum.transaction.HttpResponseHeader;

public class HttpSessionCookieAuthenticator extends SystemAPI implements Authenticator {

	public void setFileServer(FileServer fileServer) {
		// TODO Auto-generated method stub
		
	}

	public Login authenticate(HttpHeader header) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	public boolean obtainAuthentication(HttpHeader httpHeader,
			ClientConnectionInterface connection) throws IOException {
		// TODO Auto-generated method stub
		return false;
	}
/*
	private static final String AUTHENTICATION_PAGE="/OpenForum/Authentication";
	private static final String AUTHENTICATE_SCRIPT_FILE="authenticate.sjs";
	private static final String SIGN_IN_SCRIPT_FILE="sign-in.sjs";

	private String domain;
	private FileManager fileManager;
	
	public HttpSessionCookieAuthenticator(FileManager fileManager,OpenForumController controller,String domain) throws IOException
	{
		this.fileManager = fileManager;
		this.domain = domain;
		setController(controller);
	}	
	
	public HttpSessionCookieAuthenticator(FileManager fileManager,String domain) throws IOException
	{
		this.domain = domain;
		this.fileManager = fileManager;
	}
	
	public Login getLogin(EntityTree httpHeader) throws Exception {
	
		String memberAlias = null;
		
		String sessionId = null;
		if(httpHeader.getChild("parameters").getChild("$cookie")!=null) {
			sessionId = httpHeader.getChild("parameters").getChild("$cookie").getValue();
			memberAlias = SessionStore.getSessionStore(domain).authenticateUser(sessionId);
		}
		
		if(memberAlias==null)
		{
			Login login = new Login(domain,"Anon",null);
			return login;
		}
		
		Login login = new Login(domain,memberAlias,null);
		return login;
	}

	public boolean isAllowed(EntityTree httpHeader) throws Exception {
		
		Login login = getLogin(httpHeader);
		
		boolean allowed = fileManager.getAuthorisor().memberCanPerformAction(login.getUser().getName(),OpenForumAuthorizer.READ,httpHeader.getChild("request").getValue());
		
		if(allowed)
		{
			httpHeader.setAttribute("user",login.getUser().getName());
			httpHeader.setAttribute("session",login.getPebble());
			System.out.println("Authorisation request Passed. Allowed in "+httpHeader.getChild("request").getValue());			
		}
		else
		{
			System.out.println("Authorisation request Rejected. Not allowed in "+httpHeader.getChild("request").getValue());
		}
		
		return allowed;
	}

	public boolean obtainAuthorisation(EntityTree httpHeader, ClientConnectionInterface connection)
			throws Exception {
		String request = httpHeader.getChild("request").getValue();
		
		if(request.equals("/SignIn")&&httpHeader.getChild("method").getValue().equals("post"))
		{
			String userId = httpHeader.getChild("parameters").getChild("userId").getValue();
			String challenge = httpHeader.getChild("parameters").getChild("challenge").getValue();
			String hashedPassword = httpHeader.getChild("parameters").getChild("password").getValue();
			String flavour = httpHeader.getChild("parameters").getChild("flavour").getValue();
			String password = getController().getFileManager()
					.getPageAttachmentAsString(
					"/Admin/Users/"+userId+"/private","password.txt"
					,getController().getSystemLogin());
			String testHashedPassword = generateMD5(password+challenge);
			String sessionId = null;
			if(testHashedPassword.equals(hashedPassword)) {
				sessionId = SessionStore.getSessionStore(domain).createSession(userId);
			}
			
			if(sessionId!=null) {
				if("json".equals(flavour)) {
					sendJSONResponse(httpHeader, connection, "{result:\"ok\"}",sessionId);
				} else {
					HttpResponseHeader responseHeader = new HttpResponseHeader( httpHeader,"text/html",302,connection );
					responseHeader.addParameter( "Set-Cookie","wikiSession="+sessionId );
					responseHeader.addParameter("location","/SignedIn");
				}
				return true;
			} else {
				if("json".equals(flavour)) {
					sendJSONResponse(httpHeader, connection, "{result:\"error\", errors:\"Sign In Failed. Incorrect user id / password combination.\"}",null);
				} else {
					HttpResponseHeader responseHeader = new HttpResponseHeader( httpHeader,"text/html",302,connection );
					responseHeader.addParameter("location","/SignIn?errors=Sign In Failed. Incorrect user id / password combination.");
					return true;
				}
			}
		}
		
		//HttpResponseHeader responseHeader = new HttpResponseHeader( httpHeader,"text/html",302,connection );
		//responseHeader.addParameter("location","/SignIn");
						
		//connection.getOutputStream().flush();
		//connection.close();
			
		return false;
	}

	//TODO belongs in a helper
	private void sendJSONResponse(EntityTree httpHeader, ClientConnectionInterface connection,String data,String sessionId) throws IOException {
		HttpResponseHeader responseHeader = new HttpResponseHeader( httpHeader,"application/json",200,connection );
		if(sessionId!=null) {
			responseHeader.addParameter( "Set-Cookie","wikiSession="+sessionId );
		}
		responseHeader.addParameter("content-length",""+data.length());
		long modified = System.currentTimeMillis();
		responseHeader.addParameter("last-modified",HttpRequestHelper.getHttpDate( modified ));
		responseHeader.addParameter("expires",HttpRequestHelper.getHttpDate( modified ));
		responseHeader.addParameter("cache-control"," max-age=1, must-revalidate ");
		
		connection.getOutputStream().write(data.getBytes());
		connection.getOutputStream().flush();
	}
	
	//TODO move to core.StringHelper along with Base64
	private String generateMD5(String input) {
		MessageDigest MD5;
		try {
			MD5 = MessageDigest.getInstance("MD5");
			MD5.update(input.getBytes());
			byte[] hash = MD5.digest();
			return DatatypeConverter.printHexBinary(hash).toLowerCase();
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		return null;
	}
	
	private String getSessionId(EntityTree httpHeader)
	{
		EntityTree parameters = HttpRequestHelper.parseHttpCookieParameters(httpHeader);
		
		EntityTree.TreeEntity session = parameters.getChild("wikiSession");
		if(session==null)
		{
			return null;
		}
		return session.getValue();
	}
	
	public String runJavascript(String pageName,String fileName,JavascriptEngine js) throws Throwable
	{
		String script = getController().getFileManager().getPageAttachmentAsString(pageName,fileName,getController().getSystemLogin());
		return js.runJavascript(pageName+"/"+fileName,script);
	}
	*/
}
