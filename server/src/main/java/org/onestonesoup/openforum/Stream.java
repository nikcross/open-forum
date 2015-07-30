package org.onestonesoup.openforum;

import java.io.IOException;
import java.io.OutputStream;

public interface Stream {
	public long saveTo(OutputStream outStream) throws IOException;
}
