package org.onestonesoup.openforum.transaction;

import java.io.IOException;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileServer;
import org.onestonesoup.openforum.router.Router;
import org.onestonesoup.openforum.router.Router.WikiAttachmentHandler;
import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.servlet.ClientConnectionInterface;

public class PostTransaction extends Transaction {

	private Router router;
	private EntityTree.TreeEntity postData;
	
	public PostTransaction(Router router,EntityTree httpHeader,ClientConnectionInterface connection,FileServer fileServer,OpenForumController controller,Login login)
	{
		super( httpHeader,connection,fileServer,controller,login );
		this.controller = controller;
		this.router = router;
	}
	
	public EntityTree.TreeEntity getPostData() throws IOException
	{
		if(postData==null)
		{
			postData = httpHeader.getChild("parameters");
		}
		return postData;
	}	
	
	public EntityTree.TreeEntity getPostFileData() throws Throwable,AuthenticationException
	{
		if(postData==null)
		{			
			String pageName = httpHeader.getChild("parameters").getChild("page").getValue();
			this.userCanPerformAction(pageName, "update", true);
			
			WikiAttachmentHandler attachmentHandler = router.getAttachmentHandler();
			postData = PostHelper.parseHttpPostFileData(controller,httpHeader,getConnection().getInputStream(),attachmentHandler,null);
		}
		return postData;
	}
	
	public EntityTree.TreeEntity getPostFileData(String fileName) throws Throwable,AuthenticationException
	{
		if(postData==null)
		{			
			String pageName = httpHeader.getChild("parameters").getChild("page").getValue();
			this.userCanPerformAction(pageName, "update", true);
			
			WikiAttachmentHandler attachmentHandler = router.getAttachmentHandler();
			postData = PostHelper.parseHttpPostFileData(controller,httpHeader,getConnection().getInputStream(),attachmentHandler,fileName);
		}
		return postData;
	}	
	
	public void deletePostAttachment(EntityTree fileHeader) throws AuthenticationException,Exception
	{
		String tempPageName = fileHeader.getChild("tempPageName").getValue();
		String tempFileName = fileHeader.getChild("tempFileName").getValue();		
		controller.getFileManager().deleteAttachment(tempPageName, tempFileName, false, router.getController().getSystemLogin());
	}	
	
	public void confirmPostAttachment(EntityTree.TreeEntity fileHeader) throws AuthenticationException,Throwable
	{
		this.userCanPerformAction(fileHeader.getChild("pageName").getValue(), "update", true);
		
		WikiAttachmentHandler attachmentHandler = router.getAttachmentHandler();
		PostHelper.confirmPostAttachment(fileHeader,attachmentHandler);
	}	
	
	public String getPostParameter(String name)
	{
		if(postData==null)
		{
			return null;
		}
		
		EntityTree.TreeEntity parameter = postData.getChild(name);
		if(parameter==null)
		{
			return null;
		}
		
		return parameter.getValue();
	}
	
	public EntityTree.TreeEntity getPostParameters()
	{
		if(postData==null)
		{
			return null;
		}
		
		return postData;
	}	
	
	public void savePage(String pageName,String data,String tags) throws Exception,AuthenticationException
	{
		controller.savePage(pageName,data,tags,postData,getLogin());
		controller.markForRebuild();
	}
	
	public void savePageWithTemplate(String pageName,String template) throws Exception,AuthenticationException
	{
		controller.savePage(pageName,template,postData,getLogin());
		controller.markForRebuild();
	}
}
