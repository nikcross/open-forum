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
import org.onestonesoup.openforum.server.ClientConnection;
import org.onestonesoup.openforum.server.ClientConnectionInterface;

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
				fileServer.getMimeTypeForFileExtension("html"), ClientConnection.REDIRECT, connection);
		responseHeader.addParameter("location", pageName);

		connection.sendEmpty();
	}

	public void redirect(String pageName, Map<String, String> params)
			throws IOException {
		HttpResponseHeader responseHeader = new HttpResponseHeader(httpHeader,
				fileServer.getMimeTypeForFileExtension("html"), ClientConnection.REDIRECT, connection);
		responseHeader.addParameter("location", pageName);

		if (params != null) {
			for (String key : params.keySet()) {
				String value = params.get(key);
				responseHeader.addParameter(key, value);
			}
		}

		connection.sendEmpty();
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
				fileServer.getMimeTypeForFileExtension("html"), ClientConnection.OK, connection);
	}

	public void sendString(String data) throws IOException {
		connection.send(data);
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
				type+"; charset=utf-8", ClientConnection.OK, connection);
		long modified = System.currentTimeMillis();
		responseHeader.addParameter("last-modified",
				HttpRequestHelper.getHttpDate(modified));
		responseHeader.addParameter("expires",
				HttpRequestHelper.getHttpDate(modified));
		responseHeader.addParameter("cache-control",
				" max-age=1, must-revalidate ");
		responseHeader.addParameter("Access-Control-Allow-Origin",
				"*");

		if (params != null) {
			for (String key : params.keySet()) {
				String value = (String) params.get(key);
				responseHeader.addParameter(key, value);
			}
		}

		connection.send(data);
	}

	public void sendFile(String data, String fileName) throws IOException {
		String type = FileHelper.getExtension(fileName);

		HttpResponseHeader responseHeader = new HttpResponseHeader(httpHeader,
				fileServer.getMimeTypeForFileExtension(type), ClientConnection.OK, connection);
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

		connection.send(data);
	}

	public void sendFileResponseHeader(String fileName, int length)
			throws IOException {
		String type = FileHelper.getExtension(fileName);

		HttpResponseHeader responseHeader = new HttpResponseHeader(httpHeader,
				fileServer.getMimeTypeForFileExtension(type), ClientConnection.OK, connection);
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

		connection.sendEmpty();
	}

	/*
	 * public void requestRebuild() throws Throwable { controller.doBuild(); }
	 */

	public String getUser() {
		return login.getUser().getName();
	}

	public String getSessionId() {
		return login.getSessionId();
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
