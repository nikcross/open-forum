package org.onestonesoup.openforum.transaction;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;

import org.onestonesoup.core.StringHelper;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.KeyValuePair;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.router.Router.WikiAttachmentHandler;
import org.onestonesoup.openforum.security.AuthenticationException;

public class PostHelper {

	private static int ID_COUNTER = 0;

	public static void parseHttpPostData(EntityTree header,InputStream inputStream) throws IOException {
		EntityTree.TreeEntity params = header.getChild("parameters");
		String data = new String( inputStream.readAllBytes() );
		String[] pairs = data.split("&");
		for(String pair : pairs) {
			int idx = pair.indexOf("=");
			if(idx==-1) {
				params.addChild(URLDecoder.decode(pair, "UTF-8")).setValue("");
				continue;
			}
			params.addChild(URLDecoder.decode(pair.substring(0, idx).trim(), "UTF-8")).
					setValue(URLDecoder.decode(pair.substring(idx + 1).trim(), "UTF-8"));
		}
	}

	public static EntityTree.TreeEntity parseHttpPostFileData(OpenForumController controller,EntityTree header,InputStream inputStream,WikiAttachmentHandler streamHandler,String fileName) throws IOException,AuthenticationException
	{
		HttpPostInputStreamBuffer iStream = new HttpPostInputStreamBuffer(inputStream);
		
		long dataSize = Long.parseLong( header.getChild("content-length").getValue() );
		streamHandler.setTotalSize(dataSize);
		//iStream = new BufferedInputStream(iStream);
		
		//Example:
		//"Content-Type: multipart/form-data; boundary=---------------------------41184676334\n"+
		
		EntityTree.TreeEntity xContentType = header.getChild("content-type");
		if(xContentType==null)
		{
			iStream.close();
			throw new IOException("Content-Type missing in Http header");
		}
		String contentType = xContentType.getValue();
		if(contentType.indexOf("boundary")==-1)
		{
			iStream.close();
			throw new IOException("Content-Type boundary missing in Http header");			
		}
		String[] parts = contentType.split(";");
		contentType = parts[0].trim();
		if( !contentType.equals("multipart/form-data") )
		{
			iStream.close();
			throw new IOException("Content-Type not multipart/form-data in Http header");						
		}
		
		KeyValuePair entity = KeyValuePair.parseKeyAndValue(parts[1],"=");
		String boundary = entity.getValue();
		
		HttpRequestHelper.readToBoundary(boundary,iStream,streamHandler);
		EntityTree tempHeader = HttpRequestHelper.parseHttpPostedFileHeader(iStream);

		parts = tempHeader.getChild("content-disposition").getValue().split(";");
		
		EntityTree postData = new EntityTree("postData");
		while(parts.length==2)
		{
			String name = parts[1];
			String value = new String(HttpRequestHelper.readToBoundary(boundary,iStream,streamHandler)).trim();			
			postData.addChild(name.substring(7,name.length()-1)).setValue(value);
			
			tempHeader = HttpRequestHelper.parseHttpPostedFileHeader(iStream);
			parts = tempHeader.getChild("content-disposition").getValue().split(";");
		}
		
		String queueName = null;
		if(postData.getChild("statusQueue")!=null)
		{
			queueName = postData.getChild("statusQueue").getValue();
		}
		
		if(queueName!=null)
		{
			streamHandler.setProgressQueue(queueName);
		}
		
		//Example:
		//"Content-Disposition: form-data; name=\"myFile\"; filename=\"test.txt\"\n"+
		//"Content-Type: text/plain\n"+

		String disposition = parts[0];
		String name = KeyValuePair.parseKeyAndValue(parts[1],"=").getValue();
		if(fileName==null) {
			fileName = KeyValuePair.parseKeyAndValue(parts[2],"=").getValue();
		}
		name = StringHelper.between(name,"\"","\"");
		fileName = StringHelper.between(fileName,"\"","\"");
		fileName = new File(fileName).getName();
		
		EntityTree fileHeader = new EntityTree("file");
		fileHeader.addChild(tempHeader.getChild("content-type"));
		fileHeader.addChild("content-disposition").setValue(disposition);
		fileHeader.addChild("name").setValue(name);
		fileHeader.addChild("fileName").setValue(fileName);
		fileHeader.addChild("pageName").setValue(header.getChild("parameters").getChild("page").getValue());
		fileHeader.addChild("boundary").setValue(boundary);
		fileHeader.addChild("tempFileName").setValue("TempFile"+generateUniqueId()+".temp");
		fileHeader.addChild("tempPageName").setValue("/OpenForum/Temporary");
		
		long length = streamHandler.handlePostStream(header,fileHeader,iStream);
		
		fileHeader.addChild("length").setValue(""+length);
		
		// dump trailing \n
		iStream.read();
		
		//mixed http posts not yet implemented
		return fileHeader.getRoot();
	}
	
	private static String generateUniqueId() {
		String id = "GUID-"+ID_COUNTER+(Math.random()*1000000)+System.currentTimeMillis();
		ID_COUNTER++;
		return id;
	}

	public static void confirmPostAttachment(EntityTree.TreeEntity fileHeader,WikiAttachmentHandler streamHandler) throws AuthenticationException,Exception
	{
		streamHandler.convertTempFile(fileHeader);
	}
	public static void deletePostAttachment(EntityTree.TreeEntity fileHeader,WikiAttachmentHandler streamHandler) throws AuthenticationException,Exception
	{
		streamHandler.convertTempFile(fileHeader);
	}
}
