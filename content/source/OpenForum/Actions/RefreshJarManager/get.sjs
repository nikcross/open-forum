if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  js.refreshPluginManager();

  transaction.sendPage("OK");
}