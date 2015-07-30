package org.onestonesoup.openforum.servlet;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletInputStream;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

public class ClientConnection implements ClientConnectionInterface {

	private ServletInputStream inputStream;
	private String remoteAddress;
	private HttpServletResponse response;
	
	public ClientConnection(String remoteAddress,ServletInputStream inputStream,HttpServletResponse response) {
		
		this.remoteAddress = remoteAddress;
		this.inputStream = inputStream;
		this.response = response;
	}

	/* (non-Javadoc)
	 * @see org.onestonesoup.wiki.servlet.ClientConnectionInterface#getInputStream()
	 */
	public InputStream getInputStream() {
		return inputStream;
	}
	/* (non-Javadoc)
	 * @see org.onestonesoup.wiki.servlet.ClientConnectionInterface#getOutputStream()
	 */
	public ServletOutputStream getOutputStream() {
		try {
			return response.getOutputStream();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}

	/* (non-Javadoc)
	 * @see org.onestonesoup.wiki.servlet.ClientConnectionInterface#getInetAddress()
	 */
	public String getInetAddress() {
		return remoteAddress;
	}

	/* (non-Javadoc)
	 * @see org.onestonesoup.wiki.servlet.ClientConnectionInterface#close()
	 */
	public void close() {
		try{
		inputStream.close();
		response.getOutputStream().close();
		} catch(IOException ioe) {
			ioe.printStackTrace();
		}
	}

	/* (non-Javadoc)
	 * @see org.onestonesoup.wiki.servlet.ClientConnectionInterface#setResponseStatus(int)
	 */
	public void setResponseStatus(int code) {
		response.setStatus(code);
	}

	/* (non-Javadoc)
	 * @see org.onestonesoup.wiki.servlet.ClientConnectionInterface#setResponseContentType(java.lang.String)
	 */
	public void setResponseContentType(String contentType) {
		response.setContentType(contentType);
	}

	/* (non-Javadoc)
	 * @see org.onestonesoup.wiki.servlet.ClientConnectionInterface#setResponseDateHeader(java.lang.String, long)
	 */
	public void setResponseDateHeader(String string, long currentTimeMillis) {
		response.setDateHeader(string,currentTimeMillis);
	}

	/* (non-Javadoc)
	 * @see org.onestonesoup.wiki.servlet.ClientConnectionInterface#addResponseHeader(java.lang.String, java.lang.String)
	 */
	public void addResponseHeader(String name, String value) {
		response.addHeader(name,value);
	}

}
