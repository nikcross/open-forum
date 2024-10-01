package org.onestonesoup.openforum.filemanager;

import static org.onestonesoup.openforum.controller.OpenForumConstants.*;

import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.GZIPOutputStream;

import org.onestonesoup.core.FileHelper;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.server.ClientConnectionInterface;

public class OpenForumFileServer implements FileServer {

	private ResourceStore resourceStore;
	private Map<String, String> types = new HashMap<String, String>();

	public OpenForumFileServer(ResourceStore resourceStore,
			OpenForumController controller, Map<String, String> mimeTypes) {
		this.types = mimeTypes;
		this.resourceStore = resourceStore;
		
		controller.getLogger().info("OpenForum file server created with resource store "+resourceStore);
	}

	public boolean fileExists(String request) {
		return resourceStore.isResource(request);
	}

	public int getFileLength(String request) {
		return resourceStore.getLength(resourceStore.getResource(request));
	}

	public long getFileModified(String request) {
		return resourceStore.lastModified(resourceStore.getResource(request));
	}

	public String getFileName(String request) {
		return resourceStore.getResource(request).getName();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.server.http.FileServerInterface#getMimeTypeFor(java.
	 * lang.String)
	 */
	public String getMimeTypeFor(String request) {
		String ext = FileHelper.getExtension(request);

		return getMimeTypeForFileExtension(ext);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.server.http.FileServerInterface#getMimeTypeForFileExtension
	 * (java.lang.String)
	 */
	public String getMimeTypeForFileExtension(String extension) {
		extension = extension.toLowerCase();

		String type = (String) types.get(extension);

		if (type == null) {
			return (String) types.get("DEFAULT");
		} else {
			return type;
		}
	}

	public long send401File(ClientConnectionInterface connection)
			throws IOException {
		return sendFile(connection, PAGE_401_PATH+PAGE_FILE);
	}

	public long send404(ClientConnectionInterface connection)
			throws IOException {
		return sendFile(connection, PAGE_404_PATH+PAGE_FILE);
	}

	public long sendFile(ClientConnectionInterface connection, String request)
			throws IOException {
		return sendFile(connection, request, false);
	}

	public long sendFile(ClientConnectionInterface connection, String request,
			boolean compress) throws IOException {
		Resource resource = null;
		if (request == null) {
			resource = resourceStore.getResource(PAGE_404_PATH+PAGE_FILE);
		} else {
			resource = resourceStore.getResource(request);
			if (resource == null) {
				resource = resourceStore.getResource(PAGE_404_PATH+PAGE_FILE);
			}
		}

		connection.setContentLength(resource.getSize());
		connection.sendHeader();

		long size = -1;
		if (compress == true) {
			GZIPOutputStream gStream = new GZIPOutputStream(
					connection.getOutputStream());
			size = FileHelper.copyInputStreamToOutputStream(
					resourceStore.getInputStream(resource), gStream);
			gStream.finish();
			gStream.close();
		} else {
			OutputStream outputStream = connection.getOutputStream();
			size = FileHelper.copyInputStreamToOutputStream(
					resourceStore.getInputStream(resource), outputStream);
			outputStream.flush();
		}

		return size;
	}

}
