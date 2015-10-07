includeInitFunction("initRefresh();");

function initRefresh()
{
  refresher = setTimeout("retryPage();",5000);
}

function retryPage()
{
  ui.showMessage("Retrying. Please Wait.");
  window.location="/Home";
}