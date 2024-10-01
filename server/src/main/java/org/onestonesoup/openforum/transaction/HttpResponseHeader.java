package org.onestonesoup.openforum.transaction;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.openforum.server.ClientConnectionInterface;

import java.util.Base64;

public class HttpResponseHeader {

	private ClientConnectionInterface connection;
	
	public HttpResponseHeader(EntityTree httpRequest,String contentType,int code,ClientConnectionInterface connection) {
		this.connection = connection;

		connection.setResponseContentType(contentType);
		connection.setResponseDateHeader("Date", System.currentTimeMillis());
		connection.setResponseStatus(code);
		
		String pebble = httpRequest.getAttribute("session");
		if(pebble!=null) {
			addParameter("Set-Cookie","sessionCookie="+new String(Base64.getEncoder().encode(pebble.getBytes()))+"; path=/");
		}
	}
	
	public void addParameter(String name, String value)
	{
		connection.addResponseHeader(name, value);
	}

	public void setContentLength(long contentLength) {
		connection.setContentLength(contentLength);
	}

	public void sendHeader() {
		connection.sendHeader();
	}
}
