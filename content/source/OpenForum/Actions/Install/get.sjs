if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  transaction.userCanPerformAction(pageName,"update",true);
  fileName = transaction.getParameter("fileName");

  file.installAttachment(pageName,fileName);

  user = transaction.getUser();		
  wiki.addJournalEntry("File ["+pageName+"/"+fileName+"] installed by "+user);
  page = wiki.buildPage(pageName);
  transaction.goToPage(pageName);
}