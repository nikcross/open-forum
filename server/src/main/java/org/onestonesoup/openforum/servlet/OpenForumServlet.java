package org.onestonesoup.openforum.servlet;

import java.io.IOException;
import java.net.URLDecoder;
import java.util.Enumeration;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.router.Router;

public class OpenForumServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	@Override
    public void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		String host = request.getHeader("host");
		OpenForumController controller = OpenForumServletContextListener.getWikiController(host);
		if(controller==null) {
			throw new ServletException("No controller found for host "+host);
		}
		
		ClientConnectionInterface connection = new ClientConnection (
				request.getRemoteAddr(),
				request.getInputStream(),
				response
		);
		
		String requestURI = request.getRequestURI();
		requestURI = requestURI.substring(request.getContextPath().length());
		requestURI = URLDecoder.decode(requestURI);
		
		HttpHeader httpHeader = new HttpHeader();
		httpHeader.addChild("method").setValue(request.getMethod().toLowerCase());
		httpHeader.addChild("request").setValue(requestURI);

		httpHeader.addChild("content-type").setValue(request.getContentType());
		httpHeader.addChild("content-length").setValue(""+request.getContentLength());
		if(request.getHeaders("authorization").hasMoreElements()) {
			httpHeader.addChild("authorization").setValue(""+request.getHeaders("authorization").nextElement());
		}
				
		EntityTree.TreeEntity params = httpHeader.addChild("parameters");
		Map<String,String[]> parameters = request.getParameterMap();
		if(parameters.size()>0) {
			for(String key: parameters.keySet()) {
				String value = parameters.get(key)[0];
				params.addChild(key).setValue(value);
			}
		}
		if(request.getCookies()!=null && request.getCookies().length>0) {
			params.addChild("$cookie").setValue(request.getCookies()[0].getValue());
		}
		
		Enumeration<String> en = request.getAttributeNames();
		while(en.hasMoreElements()) {
			String key = en.nextElement();
			controller.getLogger().info("A:"+key+"="+request.getAttribute(key));
		}
		
		Router router;
		try {
			controller.getRouter().route(connection, httpHeader);
		} catch (Exception e) {
			e.printStackTrace();
		} catch (Throwable e) {
			e.printStackTrace();
		}
	}
}
