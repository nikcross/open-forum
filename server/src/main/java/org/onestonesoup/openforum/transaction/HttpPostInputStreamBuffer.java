package org.onestonesoup.openforum.transaction;

import java.io.IOException;
import java.io.InputStream;

public class HttpPostInputStreamBuffer extends InputStream{

	private InputStream iStream;
	public HttpPostInputStreamBuffer(InputStream inputStream) {
		this.iStream = inputStream;
	}

	public int read() throws IOException {
		return iStream.read();
	}

}
