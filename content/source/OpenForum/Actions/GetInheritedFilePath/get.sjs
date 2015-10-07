if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  fileName = transaction.getParameter("fileName");
  path = file.getPageInheritedFilePath(pageName,fileName);
  if(path==null)
  {
    path="null";
  }

  transaction.sendPage( path );
}