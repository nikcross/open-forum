if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  js.refreshJarManager();

  transaction.sendPage("OK");
}