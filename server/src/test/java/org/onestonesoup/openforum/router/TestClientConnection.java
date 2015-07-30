package org.onestonesoup.openforum.router;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;

import javax.servlet.ServletInputStream;

import org.onestonesoup.openforum.servlet.ClientConnectionInterface;

public class TestClientConnection implements ClientConnectionInterface {

	OutputStream oStream = new ByteArrayOutputStream();
	String inetAddress="123.123.123.123";
	
	public String getOutputData() {
		return oStream.toString();
	}
	
	public ServletInputStream getInputStream() {
		return null;
	}

	public OutputStream getOutputStream() {
		return oStream;
	}

	public String getInetAddress() {
		return inetAddress;
	}

	public void close() {
	}

	public void setResponseStatus(int code) {
	}

	public void setResponseContentType(String contentType) {
	}

	public void setResponseDateHeader(String string, long currentTimeMillis) {
	}

	public void addResponseHeader(String name, String value) {
	}
	
}