package org.onestonesoup.openforum.server;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public interface ClientConnectionInterface {

	public abstract InputStream getInputStream();
	
	public abstract OutputStream getOutputStream();

	void sendEmpty();

	void send(String data) throws IOException;

	public abstract String getInetAddress();

	public abstract void close() throws IOException;

	public abstract void setResponseStatus(int code);

	int getStatusCode();

	public abstract void setResponseContentType(String contentType);

	public abstract void setResponseDateHeader(String string,
			long currentTimeMillis);

	public abstract void addResponseHeader(String name, String value);

	void setContentLength(long contentLength);

	void sendHeader();
}