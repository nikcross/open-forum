package org.onestonesoup.javascript;

import java.io.File;

import org.onestonesoup.core.process.ProcessWatch;

public class ProcessTest {

	public static void main(String[] args) throws Exception {
		ProcessWatch p = new ProcessWatch();
		p.executeInDirectory("/home/nik/git/eventsapi", "/home/nik/git/eventsapi/run-integration.sh");
		//p.execute("/home/nik/git/eventsapi/run-integration.sh");
	}

}
