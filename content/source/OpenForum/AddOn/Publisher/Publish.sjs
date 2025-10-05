/*
* Author: Nik Cross
* Description: Published pages from one area to another.
* Currently fixed to move pages starting /
* Removes references to / in all non-binary files.
*/

//----NOT IN USE-----See Publisher.sjs

var Publisher = function() {
  var self = this;
  var INCLUDE_LIST = [".js",".sjs",".content",".html",".txt",".fragment",".json",".link"];
  var DERIVED_LIST = ["page.html","page.html.fragment"];

  js.getObject("/OpenForum/Javascript","Common.sjs").extendString(String);

  //TODO This should be moved to common utils
  var getAttachments = function(pageName) {
    var attachments=[];
    var matching = ".*"; //Regex include all

    var list = file.getAttachmentsForPage( pageName );
    if(pageName.charAt(0)!='/') {
      pageName = "/"+pageName;
    }

    var iterator= list.keySet().iterator();
    while(iterator.hasNext()) {
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

  var isTextFile = function(attachment) {
    for(var j in INCLUDE_LIST) {
      if(attachment.fileName.indexOf(INCLUDE_LIST[j])!=-1) {
        return true;
      }
    }
    return false;
  };

  var isDerivedFile = function(attachment) {
    for(var j in DERIVED_LIST) {
      if(attachment.fileName.indexOf(DERIVED_LIST[j])!=-1) {
        return true;
      }
    }
    return false;
  };

  var replaceDevelopmentPaths = function(attachments,doReplace) {
    var notes = "==== Publishing Actions ====\n";

    var i=0;
    for(i in attachments) {
      var attachment = attachments[i];
      if(isTextFile(attachment)===false) {
        notes += "Including " + attachment.fileName +" without changes as not text file.\n";
        continue;
      }
      if(isDerivedFile(attachment)) {
        notes += "Excluding " + attachment.fileName +" without changes as is a devrived file that will be regenerated.\n";
        continue;
      }

      var data = file.getAttachment(attachment.pageName,attachment.fileName);

      if(data.indexOf("/")!=-1) {
        notes += "Remove /Development references in " + attachment.pageName + "/" + attachment.fileName + "\n";
        var lines = data.split("\n");
        for(var l=0; l<lines.length; l++) {
          var line = lines[l];
          if(line.indexOf("/")!=-1) {
            notes += "\tLine " + l + "\n";
            notes += "\t" + line + "\n";
          }
          if(doReplace && attachment.pageName.indexOf("/Development")==-1) {
            data = data.replace( /\/Development\//g,"/" );
            file.saveAttachment(attachment.pageName,attachment.fileName,data);
          }
        }
      }

    }

    notes += "\n\n";
    return notes;
  };

  var checkServices = function(attachments) {
    var notes = "==== Services Check ====\n";
    var deployList = "";
    var deplopDedupe = {};
    for(var i in attachments) {
      var attachment = attachments[i];
      if(isTextFile(attachment)===false) continue;
      if(isDerivedFile(attachment)) continue;

      var data = ""+file.getAttachment(attachment.pageName,attachment.fileName);
      var hasDependencys = false;

      if(data.indexOf("/")!=-1) {
        notes += "Service call(s) in " + attachment.pageName + "/" + attachment.fileName + "\n";
        var lines = data.split("\n");
        for(var l=0; l<lines.length; l++) {
          var line = lines[l];
          if(line.match(/JSON(\.get|\.post)/) && line.indexOf("(") > line.indexOf("JSON") && line.indexOf("\"") > line.indexOf("(\"")) {
            notes += "\tCall on line " + l + "\n";
            notes += "\t" + line + "\n";
            line = line.replace(/\(\s\"/g,"(");
            var service  = line.between( "(\"","\"" );
            if(service.indexOf("/")!=-1) {
              service = service.after("/Development");
            }
            if(service.indexOf("?")!=-1) {
              service = service.before("?");
            }

            if( file.attachmentExists( service , "get.sjs" ) ) {
              if(attachment.pageName!="/Development"+service) { // Not self
                hasDependencys = true;
                notes += "\tService " + service + " exists\n\n";
                if(!deplopDedupe[service]) {
                  deployList += service + "\n";
                  deplopDedupe[service] = "Added";
                }
              }
            } else {
              notes += "\tService " + service + " DOES NOT EXIST\n\n";
              if(!deplopDedupe[service]) {
                deployList += service + " (MISSING)\n";
                deplopDedupe[service] = "Added";
                hasDependencys = true;
              }
            }
          }
        }
      }
    }
    if(hasDependencys===false) {
      notes += "No Service Dependencys Found";
    }
    notes += "\n\n";

    if(deployList.length>0) notes += "Deploy services:\n" + deployList + "\n\n";

    return notes;
  };

  var checkForToDo = function(attachments) {
    var notes = "";
    for(var i in attachments) {
      var attachment = attachments[i];
      if(isTextFile(attachment)===false) continue;

      var data = file.getAttachment(attachment.pageName,attachment.fileName);

      if(data.toLowerCase().indexOf("todo")!=-1) {
        notes += "TODOs found in " + attachment.pageName + "/" + attachment.fileName + "\n";
        var lines = data.split("\n");
        for(var l=0; l<lines.length; l++) {
          var line = lines[l];
          if(line.toLowerCase().indexOf("todo")!=-1) {
            notes += "\tLine " + l + "\n";
            notes += "\t" + line + "\n";
          }
        }
      }
    }
    notes += "\n\n";
    return notes;
  };

  var checkAttachments = function(attachments) {
    var notes = "";

    for(var i in attachments) {
      var attachment = attachments[i];
      if(isTextFile(attachment) && isDerivedFile(attachment)===false) {
        notes += "Move and check " + attachment.pageName + "/" + attachment.fileName + "\n";
      } else {
        notes += "Move " + attachment.pageName + "/" + attachment.fileName + "\n";
      }
    }

    notes += "\n\n";
    return notes;
  };

  /*
   * The main method to publish a page.
   */
  self.publish = function(pageName,practice) {
    var publishedPageName;

    if(pageName.indexOf("/")===0) {
      publishedPageName = pageName.substring(12);
    } else {
      throw "Page name must start with /";
    }

    var notes = "Publishing " + pageName + " practice:" + practice;

    try{
      if(practice===false) {
        openForum.copyPage(pageName,publishedPageName,null);
        file.saveAttachment(publishedPageName,"page.html.template.link","/OpenForum/PageTemplates/Published/page.html.template");
      }

      var attachments = getAttachments(pageName);
      notes += checkAttachments(attachments);
      notes += replaceDevelopmentPaths(attachments,practice);
      notes += checkServices(attachments);
      notes += checkForToDo(attachments);
    } catch(e) {
      notes += {error: e};
    }
    if(!practice) {
        file.saveAttachment(publishedPageName,"release-notes.json",JSON.stringify(notes,null,4));
    }
    
    return {notes: notes,publishedPageName: publishedPageName};
  };
};
