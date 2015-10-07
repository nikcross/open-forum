if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  js.startJavascript( "/OpenForum/Actions/Rebuild","wiki.rebuild(true);" );
  transaction.sendPage("OK");
}