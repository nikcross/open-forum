package org.onestonesoup.javascript;

import org.onestonesoup.javascript.helper.Process;

public class ProcessTest {

	public static void main(String[] args) throws Exception {
		//ProcessWatch p = new ProcessWatch();
		//p.executeInDirectory("/home/nik/git/eventsapi", "/home/nik/git/eventsapi/run-integration.sh");
		//p.execute("/home/nik/git/eventsapi/run-integration.sh");
		
		Process p = new Process();
		
		System.out.println( p.createProcess("docker images").run(true) );		
		System.out.println( p.createProcess("docker ps").run(true) );
		System.out.println( p.createProcess("./run.sh").runInDirectory("/web2/docker", true));
		System.out.println( p.createProcess("docker ps").run(true) );
	}

}
