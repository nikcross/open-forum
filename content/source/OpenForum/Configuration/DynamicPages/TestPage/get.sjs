if(typeof(pageName)!="undefined")
{
  transaction.setResult(transaction.SHOW_PAGE);
}
else
{
request = transaction.getRequest();
content = "!!Dynamic content for "+request;

page = wiki.buildPage(transaction.getPageName(),content,true);
transaction.sendPage( page );
}