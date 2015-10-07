if(typeof(pageName)=="undefined")
{
       transaction.setResult(transaction.SHOW_PAGE);
}
else
{
 if(pageName.charAt(0)=='/')
 {
   pageName = pageName.substring(1);
 }
       pageName = wiki.titleToWikiName(pageName);
       transaction.userCanPerformAction(pageName,"update",true);

       page = wiki.buildEditPage(pageName);
       transaction.sendPage(page);
}

