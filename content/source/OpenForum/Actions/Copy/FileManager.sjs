/*
* Author: 
* Description: 
*/

function FileManager() {

  this.copyPage = function(fromPage,toPage) {
    if(fromPage.charAt(0)!='/') {
      fromPage = "/"+fromPage;
    }

    if(toPage.charAt(0)!='/') {
      toPage = "/"+toPage;
    }

    var log = "Copy Log: ";
    return copy(fromPage,toPage,log);
  };

  var copy = function(fromPage,toPage,log) {
    var list = file.getAttachmentsForPage( fromPage );

    if(file.attachmentExists(toPage,"data.json")===false) {
      file.saveAttachmentNoBackup(toPage,"data.json","/*Generated by FileManager*/\n{}");
    }

    var pagesList = [];
    var iterator= list.keySet().iterator();
    while(iterator.hasNext()) {
      var key = ""+iterator.next();
      if(key=="+history") {
        continue;
      } else if(key.charAt(0)==='+') {
        var name = key.substring(1);
        log += copy( fromPage+"/"+name,toPage+"/"+name );
      } else {
        log += "    "+fromPage+"/"+key+"->"+toPage;
        try{
          if(key.indexOf(".link")!==-1) {
            var data = file.getAttachment(fromPage, key, false);
            log += "[LINK:"+data+"]";
            file.saveAttachment(toPage, key, data);
          } else {
          	file.copyAttachment( fromPage, key , toPage, key );
          }
          log += "(OK)";
        } catch(e) {
          log += "(ERROR "+e+")";
        }
      }
    }

    openForum.refreshPage(toPage);
    
    return log;
  };

}
