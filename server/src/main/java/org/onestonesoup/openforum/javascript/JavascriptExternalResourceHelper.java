package org.onestonesoup.openforum.javascript;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.URL;
import java.net.URLConnection;

import org.onestonesoup.core.Base64;
import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.StringHelper;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.security.Login;

public class JavascriptExternalResourceHelper {

	private FileManager fileManager;
	private Login login;
	
	public JavascriptExternalResourceHelper(FileManager fileManager,Login login)
	{
		this.fileManager = fileManager;
		this.login = login;
	}
	
	public String getURLAsString(String url) throws IOException {
		URL u = new URL(url);
		URLConnection c = u.openConnection();
		return FileHelper.loadFileAsString(c.getInputStream());
	}
	
	public String getURLAsString(String url,String user,String password) throws IOException {
		String code = Base64.encode(user+":"+password);
				
		URL u = new URL(url);
		URLConnection c = u.openConnection();
		c.setRequestProperty("Authorization", "Basic " + code);
		return FileHelper.loadFileAsString(c.getInputStream());
	}
	
	public void getURLAsFile(String url,String pageName,String fileName) throws Exception {
		URL u = new URL(url);
		URLConnection c = u.openConnection();
		OutputStream oStream = fileManager.getAttachmentOutputStream(pageName, fileName, login);
		FileHelper.copyInputStreamToOutputStream(c.getInputStream(), oStream);
	}
	
	public void getURLAsFile(String url,String user,String password,String pageName,String fileName) throws Exception {
		String code = StringHelper.encodeBase64(user+":"+password);
		
		URL u = new URL(url);
		URLConnection c = u.openConnection();
		c.setRequestProperty("Authorization", "Basic " + code);
		OutputStream oStream = fileManager.getAttachmentOutputStream(pageName, fileName, login);
		FileHelper.copyInputStreamToOutputStream(c.getInputStream(), oStream);
	}
	
	public String postURLAsString(String urlString,String user,String password,String data) throws Exception {
		String code = StringHelper.encodeBase64(user+":"+password);
		
	    URL url = new URL(urlString);
	    URLConnection conn = url.openConnection();
	    conn.setDoOutput(true);
	    conn.setRequestProperty("Authorization", "Basic " + code);

	    OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());

	    writer.write(data);
	    writer.flush();
	    String line;
	    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
	    
	    String response = "";
	    while ((line = reader.readLine()) != null) {
	    	response += line+"\n";
	    }
	    writer.close();
	    reader.close();
	    
	    return response;
	}

	public String postURLAsString(String urlString,String data) throws Exception {
		
	    URL url = new URL(urlString);
	    URLConnection conn = url.openConnection();
	    conn.setDoOutput(true);

	    OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());

	    writer.write(data);
	    writer.flush();
	    String line;
	    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
	    
	    String response = "";
	    while ((line = reader.readLine()) != null) {
	    	response += line+"\n";
	    }
	    writer.close();
	    reader.close();
	    
	    return response;
	}
}
