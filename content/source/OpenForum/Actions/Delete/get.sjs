if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}

	transaction.userCanPerformAction(pageName,"delete",true); 
	fileName = transaction.getParameter("fileName");

        async = transaction.getParameter("async");
        if(async!==null && async=="true")
        {
          async=true;
        }
        else
        {
          async=false;
        }

	if( fileName===null )
	{
		wiki.deletePage(pageName);

/* Send email to administrator */
 user = transaction.getUser();

 mailer = js.getApi("/OpenForum/JarManager/Mailer");
 if(mailer!==null) {

   subject = pageName+" has been deleted";
   message = "The Wiki Page "+pageName+" has been deleted by "+user; 

   mailer.sendMail("Admin","Admin",subject,message);
 }
/* End of send email*/ 

		if(pageName.indexOf("/blog/")!=-1)
		{
			pageName = pageName.substring(0,pageName.indexOf("/blog/"));
		}
		else
		{
			data = file.getAttachment("/Admin/Deleted","page.wiki");
			data = data + "\n*[Undelete "+pageName+"|/OpenForum/Actions/Move?pageName=/OpenForum/DeletedPages/"+pageName+"&newPageName="+pageName+"]";
			file.saveAttachment("/OpenForum/DeletedPages","page.wiki",data);
			wiki.refreshPage("/OpenForum/DeletedPages");

			pageName = "/OpenForum/DeletedPages";
		}
		wiki.buildPage(pageName,true);
                if(async)
                {
                  transaction.sendPage("OK");
                }
                else
                {
                  transaction.goToPage(pageName);
                }
	}
	else
	{
		wiki.deleteAttachment(pageName,fileName);
		wiki.buildPage(pageName,true);

                if(async)
                {
                  transaction.sendPage("OK");
                }
                else
                {
                  transaction.goToPage(pageName);
                }
	}