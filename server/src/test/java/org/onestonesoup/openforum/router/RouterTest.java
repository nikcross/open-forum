package org.onestonesoup.openforum.router;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import junit.framework.Assert;

import org.junit.Ignore;
import org.junit.Test;
import org.onestonesoup.core.data.KeyValuePair;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.server.HttpHeader;

public class RouterTest {

	@Test
	@Ignore
	public void testRouterReturnsHtmlIfAvailable() throws Throwable {
		OpenForumController controller = null;// TODO new TestController();
		Map<String,String> folders = new HashMap<String,String>();
		folders.put("Test/page.html","test");
		FileManager fileManager = null; //TODO new TestFileManager(folders);
		controller.setFileManager(fileManager);
		Router router = new Router("test",controller);
		TestClientConnection connection = new TestClientConnection();
		HttpHeader httpHeader = new HttpHeader();
		httpHeader.addChild("request").setValue("test");
		httpHeader.addChild("method").setValue("get");
		httpHeader.addChild("parameters");
		
		router.route(connection, httpHeader);
		
		Assert.assertEquals("Test/page.html", connection.getOutputData());
	}
	
	@Test
	@Ignore
	public void testRouterRunsGetServiceIfAvailable() throws Throwable {
		OpenForumController controller = null; //TODO new TestController();
		Map<String,String> folders = new HashMap<String,String>();
		folders.put("test/get.sjs","transaction.sendPage(\"my data\");");
		FileManager fileManager = null; //TODO new TestFileManager(folders);
		controller.setFileManager(fileManager);
		Router router = new Router("test",controller);
		TestClientConnection connection = new TestClientConnection();
		HttpHeader httpHeader = new HttpHeader();
		httpHeader.addChild("request").setValue("test");
		httpHeader.addChild("method").setValue("get");
		httpHeader.addChild("parameters");
		
		router.route(connection, httpHeader);
		
		Assert.assertEquals("my data", connection.getOutputData());
	}
	
	@Test
	@Ignore
	public void testRouterRunsPostServiceIfAvailable() throws Throwable {
		OpenForumController controller = null; //TODO new TestController();
		Map<String,String> folders = new HashMap<String,String>();
		folders.put("test/post.sjs","transaction.sendPage(\"my data\");");
		FileManager fileManager = null; //TODO new TestFileManager(folders);
		controller.setFileManager(fileManager);
		Router router = new Router("test",controller);
		TestClientConnection connection = new TestClientConnection();
		HttpHeader httpHeader = new HttpHeader();
		httpHeader.addChild("request").setValue("test");
		httpHeader.addChild("method").setValue("post");
		httpHeader.addChild("parameters");
		
		router.route(connection, httpHeader);
		
		Assert.assertEquals("my data", connection.getOutputData());
	}

	@Test
	public void shouldMatchDynamicPages() throws Throwable {
		OpenForumController controller = new OpenForumController("","");
		Map<String,String> folders = new HashMap<String,String>();
		folders.put("test/post.sjs","transaction.sendPage(\"my data\");");
		FileManager fileManager = new FileManager(null,null,null); //null; //TODO new TestFileManager(folders);
		controller.setFileManager(fileManager);
		Router router = new Router("test",controller);

		List<KeyValuePair> list = new ArrayList<KeyValuePair>();
		list.add( new KeyValuePair(".*^(?!.*(OpenForum|Development)).*$.*","/Target") );

		String targetPage = router.getPageMatch("/",list);
		Assert.assertEquals( "/Target", targetPage);

		targetPage = router.getPageMatch("/AnyPage",list);
		Assert.assertEquals( "/Target", targetPage);

		targetPage = router.getPageMatch("/OpenForum",list);
		Assert.assertNull( targetPage );

		targetPage = router.getPageMatch("/OpenForum/Javascript",list);
		Assert.assertNull( targetPage );

		targetPage = router.getPageMatch("/Development",list);
		Assert.assertNull( targetPage );

		targetPage = router.getPageMatch("/Development/Administration",list);
		Assert.assertNull( targetPage );
	}

}
