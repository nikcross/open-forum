package org.onestonesoup.openforum.router;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.onestonesoup.openforum.server.ClientConnectionInterface;

public class TestClientConnection implements ClientConnectionInterface {

	OutputStream oStream = new ByteArrayOutputStream();
	String inetAddress="123.123.123.123";
	
	public String getOutputData() {
		return oStream.toString();
	}
	
	public InputStream getInputStream() {
		return null;
	}

	public OutputStream getOutputStream() {
		return oStream;
	}

	@Override
	public void sendEmpty() {

	}

	@Override
	public void send(String data) throws IOException {

	}

	public String getInetAddress() {
		return inetAddress;
	}

	public void close() {
	}

	public void setResponseStatus(int code) {
	}

	@Override
	public int getStatusCode() {
		return 0;
	}

	public void setResponseContentType(String contentType) {
	}

	public void setResponseDateHeader(String string, long currentTimeMillis) {
	}

	public void addResponseHeader(String name, String value) {
	}

	@Override
	public void setContentLength(long contentLength) {

	}

	@Override
	public void sendHeader() {

	}

}