package org.onestonesoup.openforum.security;

import java.io.IOException;

import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileServer;
import org.onestonesoup.openforum.servlet.ClientConnectionInterface;
import org.onestonesoup.openforum.servlet.HttpHeader;

public interface Authenticator {
	public void setController(OpenForumController controller);
	public void setFileServer(FileServer fileServer);
	public Login authenticate(HttpHeader header) throws IOException;
	public boolean obtainAuthentication(HttpHeader httpHeader,ClientConnectionInterface connection) throws IOException;
	public void signOut(HttpHeader httpHeader,ClientConnectionInterface connection);
	public boolean signIn(HttpHeader httpHeader,ClientConnectionInterface connection) throws IOException;
}
