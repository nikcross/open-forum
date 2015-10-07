var creating = false;
function createIssue()
{
testPageName=issueForm.issueName.value;
testPageName = testPageName.replace(new RegExp(/\s+$/),"");
if(testPageName.indexOf("\"")!=-1)
{
  showAlert("Problem with Issue Title","Please remove double quotes from your issue title.");
  return;
}
if(creating==true)
{
	showAlert("Please wait...","The Issue is being created.");
	return;
}
creating = true;
pageName=issueForm.issueName.value;
pageName = testPageName.replace(new RegExp(/\s+$/),"");
window.location="/OpenForum/Actions/Copy?newPageName=&target-page;/IssueTracker/IssueTrackingList/"+pageName+"&sourcePageName=&target-page;/IssueTracker/IssueTemplate&listPageName=&target-page;/IssueTracker/IssueTrackingList"
}