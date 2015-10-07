if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  authentication = transaction.getHttpHeader().getElementByName("authorization");
  if(authentication==null)
  {
    authentication = "";
  }
  else
  {
    authentication = authentication.getValue();
  }
  transaction.sendPage( authentication );
}
