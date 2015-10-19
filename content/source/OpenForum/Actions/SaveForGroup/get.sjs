if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{

		var group = transaction.getParameter("group");
        var pageName = "/OpenForum/Groups/" + group + "/" + transaction.getParameter("pageName");
  
        transaction.userCanPerformAction(pageName,"update",true);
  
        var fileName = transaction.getParameter("fileName");
        var data = transaction.getParameter("data");
        var user = transaction.getUser();

        openForum.saveAsAttachment(pageName,fileName,data,user);
        openForum.rebuild();

        transaction.goToPage(pageName);
}