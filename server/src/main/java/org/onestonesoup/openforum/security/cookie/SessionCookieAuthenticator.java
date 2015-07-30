package org.onestonesoup.openforum.security.cookie;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javax.xml.bind.DatatypeConverter;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileServer;
import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Authenticator;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.servlet.ClientConnectionInterface;
import org.onestonesoup.openforum.servlet.HttpHeader;
import org.onestonesoup.openforum.transaction.HttpRequestHelper;
import org.onestonesoup.openforum.transaction.HttpResponseHeader;

public class SessionCookieAuthenticator implements Authenticator{

	private OpenForumController controller;
	private FileServer fileServer;
	
	public Login authenticate(HttpHeader httpHeader) {
		String memberAlias = null;
		
		String sessionId = null;
		if(httpHeader.getChild("parameters").getChild("$cookie")!=null) {
			sessionId = httpHeader.getChild("parameters").getChild("$cookie").getValue();
			memberAlias = SessionStore.getSessionStore(controller.getDomainName()).authenticateUser(sessionId);
		}
		
		if(memberAlias==null)
		{
			return Login.getGuestLogin();
		}
		
		Login login = new Login(memberAlias,null);
		return login;
	}

	public boolean obtainAuthentication(HttpHeader httpHeader,
			ClientConnectionInterface connection) throws IOException {
		String request = httpHeader.getChild("request").getValue();
		
		if(request.equals("/SignIn")&&httpHeader.getChild("method").getValue().equals("post"))
		{
			String userId = httpHeader.getChild("parameters").getChild("userId").getValue();
			String challenge = httpHeader.getChild("parameters").getChild("challenge").getValue();
			String hashedPassword = httpHeader.getChild("parameters").getChild("password").getValue();
			String flavour = httpHeader.getChild("parameters").getChild("flavour").getValue();
			String password = null;
			try {
				password = controller.getFileManager()
						.getPageAttachmentAsString(
						"/Admin/Users/"+userId+"/private","password.txt"
						,controller.getSystemLogin());
			} catch (AuthenticationException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			String testHashedPassword = generateMD5(password+challenge);
			String sessionId = null;
			if(testHashedPassword.equals(hashedPassword)) {
				sessionId = SessionStore.getSessionStore(controller.getDomainName()).createSession(userId);
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

	public void setController(OpenForumController controller) {
		this.controller = controller;
	}

	public void setFileServer(FileServer fileServer) {
		this.fileServer = fileServer;
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
}
