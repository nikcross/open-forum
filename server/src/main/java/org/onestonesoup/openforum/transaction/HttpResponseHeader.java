package org.onestonesoup.openforum.transaction;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.openforum.servlet.ClientConnectionInterface;

import sun.misc.BASE64Encoder;

public class HttpResponseHeader {

	private ClientConnectionInterface connection;
	private int code;
	
	public HttpResponseHeader(EntityTree httpRequest,String contentType,int code,ClientConnectionInterface connection)
	{
		this.code = code;
		this.connection = connection;
		
		connection.setResponseStatus(code);
		connection.setResponseContentType(contentType);
		connection.setResponseDateHeader("Date", System.currentTimeMillis());
		
		String pebble = httpRequest.getAttribute("session");
		if(pebble!=null) {
			addParameter("Set-Cookie","sessionCookie="+new String(new BASE64Encoder().encode(pebble.getBytes()))+"; path=/");
		}
	}
	
	public void addParameter(String name, String value)
	{
		connection.addResponseHeader(name, value);
	}
}
