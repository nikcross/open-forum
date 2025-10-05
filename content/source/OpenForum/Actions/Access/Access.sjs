/*
* Author: 
* Description: 
*/
var Access = function() {
  var self = this;

  self.getAccess = function(pageName) {
    var path = "" + file.getPageInheritedFilePath( pageName,"access.json" );
    var access = JSON.parse( "" + file.getPageInheritedFileAsString( pageName,"access.json") );
    var readers = [];
    for(var allowed in access.userAccess.read) {
      readers.push( allowed );
    }

    return {result: "ok", pageName: pageName, path: path, access: access, readers: readers};
  };
};
