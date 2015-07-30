package org.onestonesoup.openforum.servlet;

import java.io.InputStream;
import java.io.OutputStream;

public interface ClientConnectionInterface {

	public abstract InputStream getInputStream();
	
	public abstract OutputStream getOutputStream();

	public abstract String getInetAddress();

	public abstract void close();

	public abstract void setResponseStatus(int code);

	public abstract void setResponseContentType(String contentType);

	public abstract void setResponseDateHeader(String string,
			long currentTimeMillis);

	public abstract void addResponseHeader(String name, String value);

}