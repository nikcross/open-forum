if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
        transaction.userCanPerformAction(pageName,"update",true);

		var user = ""+transaction.getUser();
        var pageName = "/OpenForum/Users/" + user + "/" + transaction.getParameter("pageName");
        var fileName = transaction.getParameter("fileName");
        var data = transaction.getParameter("data");
        var user = transaction.getUser();

        openForum.saveAsAttachment(pageName,fileName,data,user);
        openForum.rebuild();

        transaction.goToPage(pageName);
}