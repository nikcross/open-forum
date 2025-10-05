/*
* Author: 
* Description: 
*/
function publish(pageName,practice) {
  JSON.get("/OpenForum/AddOn/Publisher","publish","pageName="+pageName+"&practice="+practice).onSuccess(
    function(response) {
      var htmlData = "<xmp style='overflow: scroll; height: 400px;'>"+response.data.notes+"</xmp>";
      if(practice===true) {
        htmlData += "<a class='button round' href='#' onclick='publish(\"" + pageName + "\",false)'>Complete Publication of "+response.data.publishedPageName+"</a>";
      } else {
        htmlData += "<a class='button round' href='" + response.data.publishedPageName + "' target='published'>View Published Page</a>";
      }
      alert(htmlData,"Publish "+pageName+" to "+response.data.publishedPageName);
    }).go();
}