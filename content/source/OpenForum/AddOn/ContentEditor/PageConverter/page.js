/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/ContentEditorClient.js");

var timeout;

var convertPageName = "/";
OpenForum.init = function() {
  if(OpenForum.getParameter("pageName")!="") {
  	convertPageName = OpenForum.getParameter("pageName");
  }
  
  OpenForum.getObject("convertPageName").addListener(
    function() {
      clearTimeout( timeout );
      timeout = setTimeout( function() {
        if( OpenForum.fileExists( convertPageName + "/page.html") ) {
        	document.getElementById( "viewFrame" ).src = convertPageName;
        }
      }, 2000 );
    }
  );
};

function convertMarkup() {
  OpenForum.scan();
  ContentEditorClient.convertPage( convertPageName, function() { console.log("Page " + convertPageName + " converted"); } );
  window.open( convertPageName+"?edit", "editor" );
}

function convertHTML() {
  OpenForum.scan();
  ContentEditorClient.convertHTMLPage( convertPageName, function() { console.log("Page " + convertPageName + " converted"); } );
  window.open( convertPageName+"?edit", "editor" );
}

