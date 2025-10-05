/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/AddOn/Publisher/PublisherClient.js");

var targetPageName = "";
var VERSION= "";

OpenForum.init = function() {
  OpenForum.loadJSON("/OpenForum/AddOn/Publisher/release-info.json",function(data) {
    VERSION = data.version;
  }, true);

  targetPageName = OpenForum.getParameter("pageName");
  if( targetPageName!="" ) getDifferences();
};

function getDifferences() {
  OpenForum.scan();
  if(targetPageName.charAt(0)=='/') targetPageName = targetPageName.substring(1);
  if(targetPageName.indexOf("Develop"+"ment/")==0) targetPageName = targetPageName.substring(12);
  var livePage = targetPageName;
  var devPage = "/Develop"+"ment/"+targetPageName;

  PublisherClient.getPublishedPageDifferences( devPage, function(response) {
    var aheadInProduction = "<h3>Files ahead in Production !</h3>";
    var aheadInDev = "<h3>Files changed in Develop"+"ment</h3>";
    for(var d in response.data) {
      var pageData = response.data[d];

      if(pageData.pub.md5 == pageData.dev.md5) { // Content the same
        continue;
      }

      var displayFileName = pageData.pub.fileName;
      if( pageData.pub.pageName != targetPageName ) {
        displayFileName = pageData.pub.pageName + "/" + pageData.pub.fileName;
      } 
      
      if(pageData.pub.changed > pageData.dev.changed) { //Published ahead of dev
        aheadInProduction += displayFileName + " <a href='/OpenForum/Editor/Plugins/FileDiff?"+
          "fileA=" + pageData.dev.pageName + "/" + pageData.dev.fileName + "&" +
          "fileB=" + pageData.pub.pageName + "/" + pageData.pub.fileName +
          "' target='fileDiff'>View Differences</a></br>";
      } else if(pageData.pub.changed < pageData.dev.changed) {
        aheadInDev += displayFileName + " <a href='/OpenForum/Editor/Plugins/FileDiff?"+
          "fileA=" + pageData.dev.pageName + "/" + pageData.dev.fileName + "&" +
          "fileB=" + pageData.pub.pageName + "/" + pageData.pub.fileName +
          "' target='fileDiff'>View Differences</a></br>";
      }
    }

    message = aheadInProduction + aheadInDev;
  });
}

function publishPage(practice) {
  OpenForum.scan();
  if(targetPageName.charAt(0)=='/') targetPageName = targetPageName.substring(1);
  var pageToPublish = "/Develop"+"ment/"+targetPageName;

  publish(pageToPublish,practice);
}

function reversePublish() {
	PublisherClient.reversePublish( pageName, function(response) {
      alert("Reverse Publish Completed.");
    });
}

function publish(pageName,practice) {
  PublisherClient.publish( pageName, practice, false, function(response) {
      //var htmlData = "<xmp style='overflow: scroll; height: 400px;'>"+response.data.notes+"</xmp>";
      //
      var htmlData = response.data.notes;
      if(practice===true) {
        htmlData += "<a class='button round' href='#' onclick='publish(\"" + pageName + "\",false)'>Complete Publication of "+response.data.publishedPageName+"</a>";
      } else {
        htmlData += "<a class='button round' href='" + response.data.publishedPageName + "' target='published'>View Published Page</a>";
      }
      alert(htmlData,"Publish "+pageName+" to "+response.data.publishedPageName);
      
      OpenForum.scan();
      $(document).foundation();
    } );
}
