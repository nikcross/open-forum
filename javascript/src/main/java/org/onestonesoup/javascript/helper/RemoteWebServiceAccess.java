package org.onestonesoup.javascript.helper;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.URL;
import java.net.URLConnection;
import java.net.UnknownHostException;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.StringHelper;

public class RemoteWebServiceAccess {

	@JSMethodHelp(signature="<URL of the resource>")
	public static String getURLAsString(String url) throws IOException {
		URL u = new URL(url);
		URLConnection c = u.openConnection();
		return FileHelper.loadFileAsString(c.getInputStream());
	}
	
	@JSMethodHelp(signature="<URL of the resource>,<user name>,<password>")
	public static String getURLAsString(String url,String user,String password) throws IOException {
		@SuppressWarnings("restriction")
		String code = StringHelper.encodeBase64(user+":"+password);
				
		URL u = new URL(url);
		URLConnection c = u.openConnection();
		c.setRequestProperty("Authorization", "Basic " + code);
		return FileHelper.loadFileAsString(c.getInputStream());
	}
	
	@JSMethodHelp(signature="<URL of the resource>,<file name to save the resource to>")
	public static void getURLAsFile(String url,String fileName) throws IOException {
		URL u = new URL(url);
		URLConnection c = u.openConnection();
		FileHelper.copyInputStreamToFile(c.getInputStream(),new File(fileName));
	}
	
	@JSMethodHelp(signature="<URL of the resource>,<user name>,<password>,<file name to save the resource to>")
	public static void getURLAsFile(String url,String user,String password,String fileName) throws IOException {
		String code = StringHelper.encodeBase64(user+":"+password);
		
		URL u = new URL(url);
		URLConnection c = u.openConnection();
		c.setRequestProperty("Authorization", "Basic " + code);
		FileHelper.copyInputStreamToFile(c.getInputStream(),new File(fileName));
	}
	
	@JSMethodHelp(signature="<URL of the resource>,<user name>,<password>,<name of file to send>")
	public static String postFileToUrl(String url,String user,String password,String fileName) throws IOException {

		String code = StringHelper.encodeBase64(user+":"+password);
		
		CloseableHttpClient httpClient = HttpClients.createDefault();
		HttpPost uploadFile = new HttpPost(url);
		uploadFile.addHeader("Authorization", "Basic " + code);

		MultipartEntityBuilder builder = MultipartEntityBuilder.create();
		builder.addTextBody("fileName", fileName, ContentType.TEXT_PLAIN);
		builder.addBinaryBody("file", new File(fileName), ContentType.APPLICATION_OCTET_STREAM, fileName);
		HttpEntity multipart = builder.build();

		uploadFile.setEntity(multipart);

		CloseableHttpResponse response = httpClient.execute(uploadFile);
		String data = FileHelper.loadFileAsString(response.getEntity().getContent());
		System.out.println(data);
		return data;
	}

	public String getHostAddressFor(String host) {
		try {
			return InetAddress.getByName(host).getHostAddress();
		} catch (UnknownHostException e) {
			return null;
		} catch (IOException e) {
			return null;
		}
	}
	
	public String getHostNameFor(String host) {
		try {
			return InetAddress.getByName(host).getHostName();
		} catch (UnknownHostException e) {
			return null;
		} catch (IOException e) {
			return null;
		}
	}
	
	@JSMethodHelp(signature="<host>,<timeout in milliseconds>")
	public boolean ping(String host,int timeout) {
		try {
			return InetAddress.getByName(host).isReachable(timeout);
		} catch (UnknownHostException e) {
			return false;
		} catch (IOException e) {
			return false;
		}
	}
}
