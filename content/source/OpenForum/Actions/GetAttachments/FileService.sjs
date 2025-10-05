/*
* Author: 
* Description: 
*/

var FileService = function() {
  var self = this;


  /* Used in service /OpenForum/Actions/GetAttachments getMatching */
  self.getMatchingFiles = function(pageName,matching) {
    var attachments=[];

    var list = file.getAttachmentsForPage( pageName );
    if(pageName.charAt(0)!='/')
    {
      pageName = "/"+pageName;
    }

    var iterator= list.keySet().iterator();
    while(iterator.hasNext())
    {
      var key = ""+iterator.next();
      var item;
      if(key.charAt(0)==='+') { // ignore sub pages
        continue;
      } else if(matching!==null && key.search( ""+matching )==-1 ) {
        continue;
      } else {
        item = key;
      }

      attachments.push( {pageName: pageName, fileName: item} );

    }
    return attachments;
  };

/* Used in service /OpenForum/Actions/GetAttachments getAll */
    self.getAll = function(pageName) {
    var attachments=[];

    var list = file.getAttachmentsForPage( pageName );
    if(pageName.charAt(0)!='/')
    {
      pageName = "/"+pageName;
    }

    var iterator= list.keySet().iterator();
    while(iterator.hasNext())
    {
      var key = ""+iterator.next();
      var item;
      if(key.charAt(0)==='+') { // ignore sub pages
        continue;
      } else {
        item = key;
      }

      attachments.push( {pageName: pageName, fileName: item} );

    }
    return attachments;
    };
  /*---8<---Add Funtions Below Here--->8---*/
};