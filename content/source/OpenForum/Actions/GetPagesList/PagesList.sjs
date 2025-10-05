/*
* Author: 
* Description: 
*/

var PagesList = function() {
  var self = this;


  /* Used in service /OpenForum/Actions/GetPagesList getChildPages */
  self.getChildPages = function(pageName) {

    var list = file.getAttachmentsForPage( pageName );
    if(pageName.charAt(0)!='/') {
      pageName = "/"+pageName;
    }

    var pagesList = [];
    var iterator= list.keySet().iterator();
    while(iterator.hasNext()) {
      var key = ""+iterator.next();
      if(key.charAt(0)!='+' || key=="+history") {
        continue;
      } else {
        pagesList.push( key.substring(1) );
      }
    }
    pagesList.sort();

    var pages = [];
    for(var i in pagesList) {
      var item = pagesList[i];
      var childPage = (pageName +"/"+ item).replace("//","/");
      pages.push( childPage );
    }

    var result = {pageName: pageName, childPages: pages};
    return result;
  };
  /*---8<---Add Funtions Below Here--->8---*/
};