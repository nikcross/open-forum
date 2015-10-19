package org.onestonesoup.openforum.transaction;

import java.io.IOException;
import java.util.Map;

import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.openforum.OpenForumNameHelper;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileServer;
import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.servlet.ClientConnectionInterface;

public abstract class Transaction {

	public static final String OK = "OK";
	public static final String KEEP_ALIVE = "KEEP ALIVE";
	public static final String ERROR = "ERROR";
	public static final String SHOW_PAGE = "SHOW PAGE";

	protected EntityTree httpHeader;
	private EntityTree.TreeEntity parameters;
	private ClientConnectionInterface connection;
	private FileServer fileServer;
	protected OpenForumController controller;
	private String result = OK;
	private Login login;

	public Transaction(EntityTree httpHeader,
			ClientConnectionInterface connection, FileServer fileServer,
			OpenForumController controller, Login login) {
		this.login = login;
		parameters = httpHeader.getChild("parameters");
		this.httpHeader = httpHeader;
		this.connection = connection;
		this.fileServer = fileServer;
		this.controller = controller;
	}

	protected Login getLogin() {
		return login;
	}

	public String getRequest() {
		return httpHeader.getChild("request").getValue();
	}

	public EntityTree getHttpHeader() {
		return httpHeader;
	}

	public EntityTree.TreeEntity getParameters() {
		return parameters;
	}

	public String getHeaderAttribute(String name) {
		return httpHeader.getChild(name).getValue();
	}

	public String getPageName() {
		return httpHeader.getChild("pageName").getValue();
	}

	public String getPageTitle() {
		return OpenForumNameHelper.wikiNameToTitle(getPageName());
	}

	public String getParameter(String name) {
		EntityTree.TreeEntity parameter = parameters.getChild(name);
		if (parameter == null) {
			return null;
		}
		return parameter.getValue();
	}

	public void redirect(String pageName) throws IOException {
		HttpResponseHeader responseHeader = new HttpResponseHeader(httpHeader,
				fileServer.getMimeTypeForFileExtension("html"), 302, connection);
		responseHeader.addParameter("location", pageName);

		connection.getOutputStream().flush();
	}

	public void redirect(String pageName, Map<String, String> params)
			throws IOException {
		HttpResponseHeader responseHeader = new HttpResponseHeader(httpHeader,
				fileServer.getMimeTypeForFileExtension("html"), 302, connection);
		responseHeader.addParameter("location", pageName);

		if (params != null) {
			for (String key : params.keySet()) {
				String value = params.get(key);
				responseHeader.addParameter(key, value);
			}
		}

		connection.getOutputStream().flush();
	}

	public void goToPage(String pageName) throws IOException {
		pageName = OpenForumNameHelper.titleToWikiName(pageName);
		if (pageName.charAt(0) != '/') {
			pageName = '/' + pageName;
		}

		redirect(pageName);
	}

	public void sendResponseHeader() throws IOException {
		HttpResponseHeader header = new HttpResponseHeader(httpHeader,
				fileServer.getMimeTypeForFileExtension("html"), 200, connection);
	}

	public void sendString(String data) throws IOException {
		connection.getOutputStream().write(data.getBytes());
		connection.getOutputStream().flush();
	}

	public void sendJSON(String data) throws IOException {
		sendPage(data, "application/json");
	}
	
	public void sendPage(String data) throws IOException {
		sendPage(data, "html");
	}

	public void sendPage(String data, String type) throws IOException {
		sendPage(data, type, null);
	}

	public void sendPage(String data, String type, Map<String, String> params)
			throws IOException {
		//System.out.println("Data: "+data.replaceAll(",", ",\n")+" LENGTH:"+data.length());
		
		HttpResponseHeader responseHeader = new HttpResponseHeader(httpHeader,
				type+"; charset=utf-8", 200, connection);
		responseHeader.addParameter("content-length", "" + data.getBytes().length);
		long modified = System.currentTimeMillis();
		responseHeader.addParameter("last-modified",
				HttpRequestHelper.getHttpDate(modified));
		responseHeader.addParameter("expires",
				HttpRequestHelper.getHttpDate(modified));
		responseHeader.addParameter("cache-control",
				" max-age=1, must-revalidate ");

		if (params != null) {
			for (String key : params.keySet()) {
				String value = (String) params.get(key);
				responseHeader.addParameter(key, value);
			}
		}

		connection.getOutputStream().write(data.getBytes());
		connection.getOutputStream().flush();
	}

	public void sendFile(String data, String fileName) throws IOException {
		String type = FileHelper.getExtension(fileName);

		HttpResponseHeader responseHeader = new HttpResponseHeader(httpHeader,
				fileServer.getMimeTypeForFileExtension(type), 200, connection);
		responseHeader.addParameter("content-length", "" + data.length());
		responseHeader.addParameter("content-disposition",
				"attachment; filename=" + fileName);
		long modified = System.currentTimeMillis();
		responseHeader.addParameter("last-modified",
				HttpRequestHelper.getHttpDate(modified));
		responseHeader.addParameter("expires",
				HttpRequestHelper.getHttpDate(modified));
		responseHeader.addParameter("cache-control",
				" max-age=1, must-revalidate ");

		connection.getOutputStream().write(data.getBytes());
		connection.getOutputStream().flush();
	}

	public void sendFileResponseHeader(String fileName, int length)
			throws IOException {
		String type = FileHelper.getExtension(fileName);

		HttpResponseHeader responseHeader = new HttpResponseHeader(httpHeader,
				fileServer.getMimeTypeForFileExtension(type), 200, connection);
		responseHeader.addParameter("content-length", "" + length);
		responseHeader.addParameter("content-disposition",
				"attachment; filename=" + fileName);
		long modified = System.currentTimeMillis();
		responseHeader.addParameter("last-modified",
				HttpRequestHelper.getHttpDate(modified));
		responseHeader.addParameter("expires",
				HttpRequestHelper.getHttpDate(modified));
		responseHeader.addParameter("cache-control",
				" max-age=1, must-revalidate ");

		connection.getOutputStream().flush();
	}

	/*
	 * public void requestRebuild() throws Throwable { controller.doBuild(); }
	 */

	public String getUser() {
		return login.getUser().getName();
	}

	public ClientConnectionInterface getconnection() {
		return connection;
	}

	public boolean userCanPerformAction(String pageName, String action,
			boolean throwException) throws Throwable {
		boolean check = controller.getAuthorizer().isAuthorized(login,
				pageName, action);

		if (check == false) {
			if (throwException == true) {
				throw new AuthenticationException("User "
						+ login.getUser().getName() + " cannot perform action "
						+ action + " on page " + pageName);
			} else {
				return false;
			}
		} else {
			return true;
		}
	}

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	public ClientConnectionInterface getConnection() {
		return connection;
	}
}
