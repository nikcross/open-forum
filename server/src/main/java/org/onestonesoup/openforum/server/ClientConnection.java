package org.onestonesoup.openforum.server;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;

import com.sun.net.httpserver.HttpExchange;

public class ClientConnection implements ClientConnectionInterface {

	public static final int NOT_MODIFIED = 304;
	public static final  int MOVED_PERMANENTLY = 301;
	public static final int OK = 200;
	public static final int ERROR = 500;
	public static final int NOT_FOUND = 404;
	public static final int REDIRECT = 302;

	private int code;
	private InputStream inputStream;
	private String remoteAddress;
	private HttpExchange exchange;
	private long contentLength = 0;

	public ClientConnection(String remoteAddress, InputStream inputStream, HttpExchange exchange) {

		this.remoteAddress = remoteAddress;
		this.inputStream = inputStream;
		this.exchange = exchange;
	}

	@Override
	public InputStream getInputStream() {
		return inputStream;
	}

	@Override
	public OutputStream getOutputStream() {
		return exchange.getResponseBody();
	}

	@Override
	public void sendEmpty() {
		sendHeader();
		close();
	}

	@Override
	public void send(String data) throws IOException{
		setContentLength(data.getBytes().length);
		sendHeader();
		exchange.getResponseBody().write(data.getBytes());
		close();
	}

	@Override
	public String getInetAddress() {
		return remoteAddress;
	}

	@Override
	public void close() {
		try{
		inputStream.close();
			exchange.getResponseBody().flush();
			exchange.close();
		} catch(IOException ioe) {
			ioe.printStackTrace();
		}
	}

	@Override
	public void setResponseStatus(int code) {
		this.code = code;
	}

	@Override
	public int getStatusCode() { return code;}

	@Override
	public void setResponseContentType(String contentType) {
		//exchange.setContentType(contentType);
	}

	@Override
	public void setResponseDateHeader(String string, long currentTimeMillis) {
		//exchange.setDateHeader(string,currentTimeMillis);
	}

	@Override
	public void addResponseHeader(String name, String value) {
		exchange.getResponseHeaders().put(name, Arrays.asList(value) );
	}

	@Override
	public void setContentLength(long contentLength) {
		this.contentLength = contentLength;
	}

	@Override
	public void sendHeader() {
		try{
			exchange.sendResponseHeaders( code, contentLength );
		} catch(IOException ioe) {
			ioe.printStackTrace();
		}
	}

}
