package org.onestonesoup.openforum.processor;

import java.io.IOException;

import org.junit.Ignore;
import org.junit.Test;
import org.onestonesoup.openforum.javascript.JavascriptExternalResourceHelper;

public class ExternalResourceHelperTest {

	@Test
	@Ignore
	public void testGetURLAsString() throws IOException {
		JavascriptExternalResourceHelper erh = new JavascriptExternalResourceHelper(null,null);
		String data = erh.getURLAsString("http://bc5612.myfoscam.org:81/snapshot.cgi", "guest", "guest");
		
		System.out.println(data);
	}
	
}
