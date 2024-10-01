package org.onestonesoup.openforum.security;

import java.io.IOException;

import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileServer;
import org.onestonesoup.openforum.server.ClientConnectionInterface;
import org.onestonesoup.openforum.server.HttpHeader;

public class DummyAuthenticator implements Authenticator {

	public void setController(OpenForumController controller) {
	}

	public void setFileServer(FileServer fileServer) {
	}

	public Login authenticate(HttpHeader header) throws IOException {
		return Login.getGuestLogin();
	}

	public boolean obtainAuthentication(HttpHeader httpHeader,
			ClientConnectionInterface connection) throws IOException {
		return false;
	}

	@Override
	public void signOut(HttpHeader httpHeader,ClientConnectionInterface connection) {
				
	}

	@Override
	public boolean signIn(HttpHeader httpHeader,ClientConnectionInterface connection) {
		return false;
	}
}
