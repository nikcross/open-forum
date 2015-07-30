package org.onestonesoup.openforum.transaction;

import java.io.IOException;
import java.io.InputStream;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.openforum.security.AuthenticationException;

public interface HttpPostStreamHandler {
	public long handlePostStream(EntityTree httpHeader,EntityTree streamHeader,InputStream stream) throws IOException,AuthenticationException;
}
