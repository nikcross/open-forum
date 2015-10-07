transaction.getPostData();
pageName = transaction.getPostParameter("pageName");
user = transaction.getUser();

transaction.userCanPerformAction(pageName,"update",true);

//Check for template
updateTemplate = wiki.getPageUpdateTemplate(pageName);
if(updateTemplate==null)
{
	source = transaction.getPostParameter("source");
	tags = transaction.getPostParameter("tags");
	transaction.savePage(pageName,source,tags);
}
else
{
	transaction.savePageWithTemplate(pageName,updateTemplate);
}

page = wiki.buildPage( pageName,true );
if(pageName.indexOf("/blog/")!=-1)
{
	pageName = pageName.substring(0,pageName.indexOf("/blog/"));
	wiki.buildPage( pageName,true );
}
	
/* Send change email to administrator */
 mailer = js.getApi("/OpenForum/JarManager/Mailer");
	if(mailer!=null) {
		 if( wiki.pageExists(pageName) )
		 {
		  subject = pageName+" has been changed";
		 message = "The Wiki Page "+pageName+" has been changed by "+user; 
		 }
		 else
		 {
		  subject = pageName+" has been created";
		 message = "The Wiki Page "+pageName+" has been created by "+user; 
		 }
		mailer.sendMail("Admin","Admin",subject,message);
	}
/* End of send email*/ 

transaction.goToPage(pageName);