if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
        transaction.userCanPerformAction(pageName,"update",true);

        pageName = transaction.getParameter("pageName");
        fileName = transaction.getParameter("fileName");
        data = transaction.getParameter("data");
        user = transaction.getUser();

        wiki.saveAsAttachment(pageName,fileName,data,user);
        wiki.rebuild();

        transaction.goToPage(pageName);
}