package org.onestonesoup.openforum.filemanager;

import java.io.IOException;

import org.onestonesoup.openforum.server.ClientConnectionInterface;

public interface FileServer {

	long send401File(ClientConnectionInterface connection) throws IOException;

	String getMimeTypeForFileExtension(String string);

	String getMimeTypeFor(String request);

	long sendFile(ClientConnectionInterface connection, String request, boolean compress) throws IOException;

	boolean fileExists(String string);

	long sendFile(ClientConnectionInterface connection, String request) throws IOException;

	long getFileModified(String request);

	int getFileLength(String request);

}
