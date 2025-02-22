package org.onestonesoup.openforum.router;

import static org.onestonesoup.openforum.controller.OpenForumConstants.GET_SJS_FILE;
import static org.onestonesoup.openforum.controller.OpenForumConstants.HOOK_SJS;
import static org.onestonesoup.openforum.controller.OpenForumConstants.PAGE_404_PATH;
import static org.onestonesoup.openforum.controller.OpenForumConstants.PAGE_500_PATH;
import static org.onestonesoup.openforum.controller.OpenForumConstants.PAGE_503_PATH;
import static org.onestonesoup.openforum.controller.OpenForumConstants.PAGE_FILE;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.util.List;
import org.onestonesoup.core.ExceptionHelper;
import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.StringHelper;
import org.onestonesoup.core.constants.TimeConstants;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.KeyValuePair;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.DataHelper;
import org.onestonesoup.openforum.OpenForumException;
import org.onestonesoup.openforum.OpenForumNameHelper;
import org.onestonesoup.openforum.Stream;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileServer;
import org.onestonesoup.openforum.filemanager.OpenForumFileServer;
import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Authorizer;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.server.ClientConnection;
import org.onestonesoup.openforum.server.ClientConnectionInterface;
import org.onestonesoup.openforum.server.HttpHeader;
import org.onestonesoup.openforum.transaction.GetTransaction;
import org.onestonesoup.openforum.transaction.HttpPostInputStreamBuffer;
import org.onestonesoup.openforum.transaction.HttpRequestHelper;
import org.onestonesoup.openforum.transaction.HttpResponseHeader;
import org.onestonesoup.openforum.transaction.PostTransaction;
import org.onestonesoup.openforum.transaction.Transaction;

/**
 * @author nik
 *
 */
public class Router {

	private OpenForumController controller;

	private RouterLogger logger;
	private FileServer fileServer;

	public FileServer getFileServer() {
		return fileServer;
	}

	public class WikiAttachmentHandler implements Stream, ProgressListener {
		private String boundary;
		private InputStream stream;
		private Login login;
		private String progressQueue = null;
		private long totalSize = 1;

		public void setTotalSize(long totalSize) {
			this.totalSize = totalSize;
		}

		public WikiAttachmentHandler(Login login) {
			this.login = login;
		}

		public long handlePostStream(EntityTree httpHeader,
				EntityTree streamHeader, HttpPostInputStreamBuffer iStream)
				throws IOException, AuthenticationException {
			this.stream = iStream;
			String pageName = streamHeader.getChild("tempPageName").getValue();
			String fileName = streamHeader.getChild("tempFileName").getValue();

			if (fileName.length() == 0) {
				return 0;
			}

			boundary = "\r\n--" + streamHeader.getChild("boundary").getValue();

			try {
				return controller.saveAsAttachment(pageName, fileName, this,
						login);
			} catch (Exception e) {
				e.printStackTrace();
				return 0;
			}
		}

		public void convertTempFile(EntityTree.TreeEntity streamHeader)
				throws AuthenticationException, Exception {
			String tempPageName = streamHeader.getChild("tempPageName")
					.getValue();
			String tempFileName = streamHeader.getChild("tempFileName")
					.getValue();
			String pageName = streamHeader.getChild("pageName").getValue();
			String fileName = streamHeader.getChild("fileName").getValue();
			fileName = fileName.replace('\\', '/');
			if (fileName.indexOf('/') != -1) {
				fileName = fileName.substring(fileName.indexOf('/'));
			}

			controller.getFileManager().copyAttachment(tempFileName,
					tempPageName, fileName, pageName,
					controller.getSystemLogin());
			controller.getFileManager().deleteAttachment(tempPageName,
					tempFileName, false, controller.getSystemLogin());
		}

		public long saveTo(OutputStream fileStream) throws IOException {

			long size = -1;
			if (progressQueue == null) {
				size = readToBoundary(boundary, stream, fileStream, null);
			} else {
				size = readToBoundary(boundary, stream, fileStream, this);
			}
			fileStream.flush();
			fileStream.close();

			return size;
		}

		private long readToBoundary(String boundary, InputStream iStream,
				OutputStream oStream, Object object) throws IOException {

			ByteArrayOutputStream testStream = new ByteArrayOutputStream();
			int i = iStream.read();
			int size = 0;
			while (i != -1) {
				if ((char) i == boundary.charAt(testStream.size())) {
					testStream.write(i);
					if (testStream.size() == boundary.length()) {
						break;
					}
				} else {
					if (testStream.size() > 0) {
						oStream.write(testStream.toByteArray());
					}
					testStream = new ByteArrayOutputStream();
					oStream.write(i);
					size++;
				}
				i = iStream.read();
			}
			return size;
		}

		public void finished() {
			controller.getQueueManager().getQueue(progressQueue)
					.postMessage("progress.setValue(100);", "*eval");
			controller.getQueueManager().getQueue(progressQueue)
					.postMessage("Upload Complete", "");
		}

		public void message(String message) {
			controller.getQueueManager().getQueue(progressQueue)
					.postMessage(message, "");
		}

		public void progress(long position, int end) {
			long pc = position * 100 / totalSize;
			controller.getQueueManager().getQueue(progressQueue)
					.postMessage("progress.setValue(" + pc + ");", "*eval");
		}

		public void setProgressQueue(String progressQueue) {
			this.progressQueue = progressQueue;
			controller
					.getQueueManager()
					.getQueue(progressQueue)
					.postMessage(
							"Uploading "
									+ DataHelper.getFileSizeDisplayString(totalSize)
									+ " bytes", "");
			controller.getQueueManager().getQueue(progressQueue)
					.postMessage("progress.setValue(0);", "*eval");
		}
	}

	public Router(String name,
			OpenForumController controller) throws Exception {

		this.fileServer = new OpenForumFileServer(
				controller.getFileManager().getResourceStore(Login.getGuestLogin()),
				controller, controller.getMimeTypes());

		this.controller = controller;
		controller.setRouter(this);
	}

	public void setController(OpenForumController controller) {
		this.controller = controller;
		controller.setRouter(this);
	}

	public boolean requestControl(Socket socket, EntityTree httpHeader) {
		// String request = httpHeader.getChild("request").getValue();
		// String method = httpHeader.getChild("method").getValue();

		return true;
	}

	private String getPageName(String request) {
		if (request.indexOf("/") == 0) {
			request = request.substring(1);
		}

		int endIndex = request.indexOf("?");
		if (endIndex != -1) {
			request = request.substring(0, endIndex);
		}

		return request;
	}

	/**
	 * @param connection
	 *            a class containing the connection to the client
	 * @param httpHeader
	 *            a class containing a subset of information from the http
	 *            header
	 * @return boolean close on return (true = close)
	 * @throws Throwable
	 */
	public boolean route(ClientConnectionInterface connection,
			HttpHeader httpHeader) throws Throwable {

		// logs the http request header if a logger has been set
		if (logger != null) {
			logger.logRequest(httpHeader);
		}

		String request = httpHeader.getChild("request").getValue();
		String method = httpHeader.getChild("method").getValue();

		//Redirect http requests to https if server config says secure
		if(httpHeader.getChild("secure").getValue().equals("false") && controller.isSecure()) {
			HttpResponseHeader responseHeader = new HttpResponseHeader(
						httpHeader, "text/html", ClientConnection.MOVED_PERMANENTLY, connection);
				responseHeader.addParameter("location", "https://"+httpHeader.getChild("host").getValue() + request); // Rediect to https page

				connection.sendEmpty();

				return true;
		}

		//Check if server has redirect set for page
		for(KeyValuePair pageRedirect: controller.getPageRedirectList()) {
			String redirectPageName = pageRedirect.getKey();
			if( request.equals(redirectPageName) ) {

				HttpResponseHeader responseHeader = new HttpResponseHeader(
						httpHeader, "text/html", ClientConnection.REDIRECT, connection);
				responseHeader.addParameter("location", pageRedirect.getValue()); // Rediect to page eg. editor

				connection.sendEmpty();

				return true;
			}
		}

		//Check if server has redirect set for parameter eg. ?edit
		for(KeyValuePair redirectParameter: controller.getParameterRedirectList()) {
			String parameterName = redirectParameter.getKey();
			if( httpHeader.getChild("parameters").getChild(parameterName)!=null && httpHeader.getChild("parameters").getChild(parameterName).getValue().equals("") ) {
	
				HttpResponseHeader responseHeader = new HttpResponseHeader(
						httpHeader, "text/html", ClientConnection.REDIRECT, connection);
				responseHeader.addParameter("location", redirectParameter.getValue() + "?pageName="+request); // Rediect to page eg. editor
	
				connection.sendEmpty();
	
				return true;
			}
		}

		// Extract the page name of the request from the http request string and
		// add it as a element in the header
		String pageName = getPageName(request);
		httpHeader.addChild("pageName").setValue(pageName);

		if (controller.isInitialised() == false) {
			do500(httpHeader, connection, pageName, Login.getGuestLogin(),
					"OpenForum Server not ready");
			return true;
		}

		Login login = null;
		try {
			if (controller.getAuthenticator() != null) {
				// If not in auto login group and an authenticator set then
				// login using authenticator
				login = controller.getAuthenticator()
						.authenticate(httpHeader);
				//Authenticate users at the sign in process page
				if(login.isLoggedIn()==false || pageName.equals("OpenForum/Access/SignIn/Process")) {
					controller.getAuthenticator().obtainAuthentication(httpHeader, connection);
					return true;
				}
			} else {
				// If no authenticator set then log user in as and anonymous
				// login
				login = Login.getGuestLogin();
			}
		} catch (Exception e) {
			e.printStackTrace();

			String exception = null;
			if (e instanceof OpenForumException) {
				exception = ((OpenForumException) e).getMessage();
			} else {
				exception = StringHelper.arrayToString(
						ExceptionHelper.getTrace(e), "</br>");
			}

			// Display a 500 error if authentication fails
			HttpResponseHeader header = new HttpResponseHeader(httpHeader,
					"txt", ClientConnection.ERROR, connection);
			connection.send(exception);
			connection.sendEmpty();
			return true;
		}

		try {

			if (controller.isInitialised() == false) {
				// If the controller has not been initialised
				// Display the 503 page
				String ext = FileHelper.getExtension(request);
				if (ext.length() == 0 || ext.toLowerCase().equals("html")) {
					httpHeader.getChild("request").setValue(PAGE_503_PATH);
				}
				httpHeader.getChild("method").setValue("get");
				return sendFile(connection, httpHeader, login);
			}

			// If the requested page matches a regex string in the dynamic pages
			// list
			// then change the page requested to the root dynamic page
			String matchingPage = getPageMatch(request,
					controller.getDynamicPagesList());
			if (matchingPage != null) {
				pageName = matchingPage;
				request = matchingPage;
			}

			// Keep track of whether the request has been fulfilled
			boolean handled = false;

			// If the user is not allowed to complete the request
			// serve them the sign in page to sign in
			/*
			 * if (authenticator != null && (auth.authenticate(httpHeader) ==
			 * false || request .equals("/SignIn"))) { handled =
			 * authenticator.obtainAuthentication(httpHeader, connection); }
			 */
			// TODO Check ok to leave to services and file manager

			if (handled == false) {

				if (method.equals("get")
				// If the request is a get request and the page has a get.sjs
				// then call doGet to fulfill the request
						&& controller.getFileManager().pageAttachmentExists(
								pageName, "get.sjs", login)) {
					if (doGet(httpHeader, connection, pageName, login) == false) {
						return true;
					} // else go on the return the page
				} else if (method.equals("post")
				// If the request is a post request and the page has a post.sjs
				// then call doGet to fulfill the request
						&& controller.getFileManager().pageAttachmentExists(
								pageName, "post.sjs", login)) {
					doPost(httpHeader, connection, pageName, login);
					return true;
				} else if (request.equals("/")) {
					// If the request is for the root page then serve the home
					// page
					httpHeader.getChild("request").setValue(
							controller.getHomePage());
				}

				// The request must be for a file or a page
				// Serve the requested file
				return sendFile(connection, httpHeader, login);
			}
		} catch (AuthenticationException authE) {
			// If an authentication exception is thrown
			// then strip any parameters from the request
			if (request.indexOf('?') != -1) {
				request = request.substring(0, request.indexOf('?'));
			}
			try {
				// If the page exists.
				if (controller.getFileManager().pageExists(request,
						controller.getSystemLogin())) {
					// If the header has an authorization parameter
					// remove the authorization parameter.
					EntityTree.TreeEntity authorization = httpHeader
							.getChild("authorization");
					if (authorization != null) {
						httpHeader.removeChild("authorization");
					}
					controller.getAuthenticator()
							.obtainAuthentication(httpHeader, connection);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		} catch (Throwable t) {

			// On error
			// display the error on the 500 page
			String exception = null;
			if (t instanceof OpenForumException) {
				exception = ((OpenForumException) t).getMessage();
			} else {
				exception = StringHelper.arrayToString(
						ExceptionHelper.getTrace(t), "</br>");
			}

			try {
				do500(httpHeader, connection, pageName, login, exception);
			} catch (Throwable t2) {
				t2.printStackTrace();

				HttpResponseHeader header = new HttpResponseHeader(httpHeader,
						"txt", ClientConnection.ERROR, connection);
				connection.send(exception);
				connection.sendEmpty();
			}

			t.printStackTrace();
			// }
		}

		return true;
	}

	public WikiAttachmentHandler getAttachmentHandler() {
		return new WikiAttachmentHandler(controller.getSystemLogin());
	}

	/*
	 * public HttpAuthenticator getAuthenticator() { return authenticator; }
	 */

	public OpenForumController getController() {
		return controller;
	}

	public boolean doGet(EntityTree httpHeader,
			ClientConnectionInterface connection, String pageName, Login login)
			throws Throwable {

		if (controller
				.getAuthorizer()
				.isAuthorized(login, pageName, Authorizer.ACTION_READ) == false) {
			throw new AuthenticationException("No read rights");
		}
		
		// Load the get.sjs script and convert it into a function
		// so that the script can return using a function return
		// Add a call to the function
		String script = controller.getFileManager().getPageAttachmentAsString(
				pageName, "get.sjs", login);
		script = "function getSJS() {" + script + "} getSJS();";

		String jsFile = pageName + "/get.sjs";

		// Create a javascript engine to run the script
		JavascriptEngine js = controller.getJavascriptEngine(login);

		// Create an object to give the script access to the transaction
		GetTransaction transaction = new GetTransaction(httpHeader, connection,
				fileServer, controller, login);
		js.mount("transaction", transaction);
		pageName = transaction.getParameter("pageName");
		js.mount("pageName", pageName);

		//Process the get request
		js.runJavascript(jsFile, script);

		// If the transaction result is set to show the page, return true: more is required
		return transaction.getResult().equals(Transaction.SHOW_PAGE);
	}

	public void doPost(EntityTree httpHeader,
			ClientConnectionInterface connection, String pageName, Login login)
			throws Throwable {

		if (controller
				.getAuthorizer()
				.isAuthorized(login, pageName, Authorizer.ACTION_READ) == false) {
			throw new AuthenticationException("No read rights");
		}
		
		// Load the post.sjs script and convert it into a function
		// so that the script can return using a function return
		// Add a call to the function
		String script = controller.getFileManager().getPageAttachmentAsString(
				pageName, "post.sjs", login);
		script = "function postSJS() {" + script + "} postSJS();";

		String jsFile = pageName + "/post.sjs";

		// Create a javascript engine to run the script
		JavascriptEngine js = controller.getJavascriptEngine(login);
		// Create an object to give the script access to the transaction
		PostTransaction transaction = new PostTransaction(this, httpHeader,
				connection, fileServer, controller, login);
		js.mount("transaction", transaction);
		pageName = transaction.getParameter("pageName");
		js.mount("pageName", pageName);

		//Process the post action
		js.runJavascript(jsFile, script);
	}

	/*
	 * Generate a page using the 500 page get.sjs script
	 * 
	 * @param httpHeader
	 * 
	 * @param connection
	 * 
	 * @param pageName
	 * 
	 * @param login
	 * 
	 * @param exceptionMessage the exception message to display
	 * 
	 * @throws Throwable
	 */
	public void do500(EntityTree httpHeader,
			ClientConnectionInterface connection, String pageName, Login login,
			String exceptionMessage) throws Throwable {
		String script = controller.getFileManager().getPageAttachmentAsString(
				PAGE_500_PATH, GET_SJS_FILE, login);
		script = "function getSJS() {" + script + "} getSJS();";

		String jsFile = PAGE_500_PATH+GET_SJS_FILE;

		JavascriptEngine js = controller.getJavascriptEngine(login);

		GetTransaction transaction = new GetTransaction(httpHeader, connection,	fileServer, controller, login);
		js.mount("transaction", transaction);
		pageName = transaction.getParameter("pageName");
		js.mount("pageName", pageName);
		js.mount("exception", exceptionMessage);

		js.runJavascript(jsFile, script);
		
		controller.getLogger().error("Error on page:"+pageName+" Exception:"+exceptionMessage);
	}

	public boolean sendFile(ClientConnectionInterface connection,
			HttpHeader httpHeader, Login login) throws IOException,
			AuthenticationException {

		String method = httpHeader.getChild("method").getValue();
		String request = httpHeader.getChild("request").getValue();

		// Strip of request parameters
		if (request.indexOf('?') != -1) {
			request = request.substring(0, request.indexOf('?'));
		}

		int cacheTime = 86400;// seconds

		// Only serve a file for a get request
		if (method.equals("get")) {
			HttpResponseHeader responseHeader = null;
			String pageName = request;
			String fileName = null;

			// If the request is for a wiki page ( the request + page.html
			// exists )
			// then apend page.html to the request
			if (request.length() > 1
					&& fileServer.fileExists(OpenForumNameHelper
							.titleToWikiName(request) + "/" + PAGE_FILE)) {
				request = OpenForumNameHelper.titleToWikiName(request);
				request = request + "/" + PAGE_FILE;
				fileName = PAGE_FILE;
				cacheTime = 1;
			} else if (request.length() > 1
					&& !fileServer.fileExists(request)
					&& (FileHelper.getExtension(request).equals("html") || FileHelper
                    .getExtension(request).isEmpty())) {
				// If the requested file does not exist and the file extension
				// is .html
				// or the request does not have an extension ( a page name )
				// Find the wiki page name for the request
				request = OpenForumNameHelper.titleToWikiName(request);

				// If the requested file is an html file
				// then change the request to request a wiki page's html
				// (page.html)
				if (FileHelper.getExtension(request).equals("html")) {
					request = request.substring(0, request.length() - 5)
							+ "/" + PAGE_FILE;

					fileName = PAGE_FILE;
				} else {
					// else append the request with page.html
					request = request.substring(0, request.length())
							+ "/" + PAGE_FILE;
				}
				cacheTime = 1;
				fileName = PAGE_FILE;
			} else {
				pageName = request.substring( 0, request.lastIndexOf("/"));
				fileName = request.substring( request.lastIndexOf("/")+1);
			}

			// Check the logged in user can access the requested file
			// and throw an AuthenticationException if not
			try {
				if (!controller
						.getAuthorizer()
						.isAuthorized(login, pageName, fileName, Authorizer.ACTION_READ
						)) {
					throw new AuthenticationException("No read rights");
				}
			} catch (Exception e) {
				throw new IOException("Failed in route to get method." + e);
			}

			// If the requested file does not exist
			// Sent the 404 page
			if (!fileServer.fileExists(request)) {
				responseHeader = new HttpResponseHeader(httpHeader,
						fileServer.getMimeTypeForFileExtension("html"), 404,
						connection);
				responseHeader.addParameter("connection", "close");

				fileServer.sendFile(connection, request);

				controller.getLogger().info("404 File Not Found sent for request "
						+ request + " to " + connection.getInetAddress());
				
				if(fileServer.fileExists(PAGE_404_PATH + "/" + HOOK_SJS)) {
					try{
						String script = controller.getFileManager().getPageAttachmentAsString(PAGE_404_PATH, HOOK_SJS, login);
						JavascriptEngine engine = controller.getJavascriptEngine(login);
						engine.mount("request", request);
						engine.runJavascript(PAGE_404_PATH + "/" + HOOK_SJS, script);
					} catch (Throwable e) {
						controller.getLogger().error(e.getMessage());
						e.printStackTrace();
					}
				}
				
				return true;
			}

			// Test for a modified since parameter in the header
			EntityTree.TreeEntity testDate = httpHeader
					.getChild("if-modified-since");
			if (testDate != null) {
				// Convert the modified since date to a long in seconds
				long testTime = HttpRequestHelper.parseHttpDate(testDate
						.getValue());
				testTime = testTime / 1000; // http time only records seconds
				// Get the last modified time of the requested file as seconds
				long modified = fileServer.getFileModified(request);
				long fileTime = modified / 1000;

				// If the file is older that the since time
				// Send a 304 not modified response
				if (fileTime <= testTime) {
					responseHeader = new HttpResponseHeader(httpHeader,
							fileServer.getMimeTypeFor(request), ClientConnection.NOT_MODIFIED, connection);

					responseHeader.addParameter("last-modified",
							HttpRequestHelper.getHttpDate(modified));
					responseHeader.addParameter("expires", HttpRequestHelper
							.getHttpDate(System.currentTimeMillis()
									+ (TimeConstants.SECOND * cacheTime)));
					// responseHeader.addParameter("cache-control"," max-age="+cacheTime+", must-revalidate ");
					responseHeader.addParameter("cache-control", "public");

					controller.getLogger().info("304 Not Modified sent to "
							+ connection.getInetAddress() + " for " + request);
				}
			}

			// Create a 200 code response
			responseHeader = new HttpResponseHeader(httpHeader,
					fileServer.getMimeTypeFor(request), 200, connection);

			// Set the response content length to match the served file length
			responseHeader.addParameter("content-length",
					"" + fileServer.getFileLength(request));
			
			// Set the last modified time on the response to match the
			// requested files last modified time
			long modified = fileServer.getFileModified(request);
			responseHeader.addParameter("last-modified",
					HttpRequestHelper.getHttpDate(modified));

			// Set the file to expire in the browser cache after the cache time
			responseHeader.addParameter(
					"expires",
					HttpRequestHelper.getHttpDate(modified
							+ (TimeConstants.SECOND * cacheTime)));
			responseHeader.addParameter("cache-control", " max-age="
					+ cacheTime + ", must-revalidate ");

			/*
			 * if - Accept-Encoding: gzip,deflate - canCompress = true
			 * Content-Encoding: gzip
			 */
			boolean compress = false;

			// Send the file and instruct the client to close the connection
			responseHeader.addParameter("connection", "close");
			fileServer.sendFile(connection, request, compress);
			controller.getLogger().info("File sent " + request + " to "
					+ connection.getInetAddress() + " Compressed:" + compress);
			return true;
		}

		return true;
	}

	public void setLogger(RouterLogger logger) {
		this.logger = logger;
	}

	public String getPageMatch(String request, List<KeyValuePair> pages) {
		if (pages != null) {
			for (int loop = 0; loop < pages.size(); loop++) {
				KeyValuePair dynamicPage = pages.get(loop);

				if (request.matches(dynamicPage.getKey())) {
					return dynamicPage.getValue();
				}
			}
		}
		return null;
	}

	public String getIPAddressMatch(String address,
			List<KeyValuePair> addressList) {
		if (addressList != null) {
			for (int loop = 0; loop < addressList.size(); loop++) {
				KeyValuePair entry = addressList.get(loop);

				if (address.matches(entry.getKey())) {
					return entry.getValue();
				}
			}
		}
		return null;
	}
}
