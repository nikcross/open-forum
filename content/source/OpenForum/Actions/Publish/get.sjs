if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  newPageName = transaction.getParameter("newPageName");

// Zip Page

  file.zipPage( pageName );

// Create page on remote site
remoteSite = "http://192.168.0.127:8181";

external.getData(remoteSite+"/OpenForum/Actions/Save?pageName="+newPageName+"&fileName=page.wiki&data=");

// Copy Zip to remote site

  parentPage = pageName.substring( 0,pageName.lastIndexOf("/") );
  pageZipFile = pageName.substring( pageName.lastIndexOf("/")+1 )+".zip";
external.putFile(remoteSite+"/OpenForum/"+newPageName,parentPage,pageZipFile);

// Unzip on remote site

external.getData(remoteSite+"/OpenForum/Actions/Unzip?pageName="+newPageName+"&fileName="+pageZipFile); 

// Rebuild page on remote site

external.getData(remoteSite+"/OpenForum/Actions/RefreshPage?pageName="+newPageName);

  htmlData = wiki.buildPage("/OpenForum/Actions/Publish","Published ["+remoteSite+"/"+newPageName+"]",true);
  transaction.sendPage(htmlData);
}