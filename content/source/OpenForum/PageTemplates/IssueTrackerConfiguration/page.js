function createIssueTracker()
{
  targetPageName = document.getElementById("targetPageName");
  targetPageName = targetPageName.options[targetPageName.selectedIndex].value;

  //ui.showMessage("Creating Issue Tracker",targetPageName);

alert("Starting Copy to "+targetPageName);

//  ajax.doGet("/OpenForum/Actions/Copy","sourcePageName=/OpenForum/PageTemplates/IssueTracker&newPageName="+targetPageName+"/IssueTracker");

alert("copy complete");

  replacePageName(targetPageName+"/IssueTracker","page.js",targetPageName);
  replacePageName(targetPageName+"/IssueTracker","page.wiki",targetPageName);
  replacePageName(targetPageName+"/IssueTracker/IssueTemplate","edit-form.wiki.template",targetPageName);
  replacePageName(targetPageName+"/IssueTracker/IssueSearch","page.wiki",targetPageName);
  replacePageName(targetPageName+"/IssueTracker/Admin","page.wiki",targetPageName);

  refreshPage( "IssueTracker/IssueSearch" );
  refreshPage( "IssueTracker/IssueTemplate" );
  refreshPage( "IssueTracker/IssueTrackingList" );
  refreshPage( "IssueTracker/ProjectAreas" );
  refreshPage( "IssueTracker/States/Priority" );
  refreshPage( "IssueTracker/States/Status" );
  refreshPage( "IssueTracker/States/Type" );
  refreshPage( "IssueTracker/States" );
  refreshPage( "IssueTracker/Admin" );
  refreshPage( "IssueTracker" );

alert("refresh complete");

  document.location = targetPageName+"/IssueTracker";
}

function replacePageName( pageName,fileName,targetPageName )
{
  data = fileManager.loadFile(pageName,fileName);
  data = data.replace(/&target-page;/g,targetPageName);
  fileManager.saveFile(pageName,fileName,data);
}

function refreshPage(pageName)
{
alert("Refreshing "+targetPageName+"/"+pageName);
  ajax.doGet("/OpenForum/Actions/RefreshPage?pageName="+targetPageName+"/"+pageName);
alert("Refreshed "+targetPageName+"/"+pageName);
}