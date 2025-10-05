/*
* Author: Nik Cross
* Description: Published pages from one area to anothehttps://rensmart.com/OpenForum/Editor?pageName=/OpenForum/AddOn/Publisher#r.
* Currently fixed to move pages starting /translated
* Removes references to / in all non-binary files.
*/
var Publisher = function() {
  var self = this;
  var VERSION = "1.021";
  var DELETIONS = "process-deletions.sjs";
  var TRANSLATION_SCRIPT = "development-translation.sjs";
  var RELEASE_NOTES = "release-notes.html.fragment";
  var PUBLISH_CONFIG = "publish-config.json";
  var INCLUDE_LIST = [".js",".sjs",".content",".html",".txt",".fragment",".json",".link",".xml",".kml",".wiki"];
  var EXCLUDE_LIST = ["page.html","page.html.fragment",TRANSLATION_SCRIPT,PUBLISH_CONFIG,RELEASE_NOTES];
  var EXCLUDE_PAGES = ["history","Administration","Notes","MessagingServices","data","Data","RawData","JSData"];
  var MAX_PAGE_DEPTH = 2;

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

  var getPages = function(pageName,pages,includeSubPages) {
    var matching = ".*"; //Regex include all
    if(pageName === "/Develop"+"ment/ServiceLayer" || pageName === "/Develop"+"ment") {
    } else {
      pages.push(pageName);
    }

    var list = file.getAttachmentsForPage( pageName );
    if(pageName.charAt(0)!='/') {
      pageName = "/"+pageName;
    }

    var iterator= list.keySet().iterator();
    while(iterator.hasNext()) {
      var key = ""+iterator.next();
      var item;
      if( isExcludedPage(key) ) {
        continue;
      } else if( key.charAt(0)==='+') {
        if(includeSubPages) {
          var newPageName = pageName + "/" + key.substring(1);
          getPages(newPageName,pages,includeSubPages);
        }
      } else {
        continue;
      }
    }
  };

  var isTextFile = function(attachment) {
    for(var j in INCLUDE_LIST) {
      if(attachment.fileName.indexOf(INCLUDE_LIST[j]) != -1) {
        return true;
      }
    }
    return false;
  };

  var isExcludedFile = function(attachment) {
    var pageName = ""+attachment.pageName;
    if(pageName.indexOf("/Develop"+"ment")!==0) pageName = "/Develop"+"ment"+pageName;
    if( file.attachmentExists(pageName,PUBLISH_CONFIG)==true ) {
      var config = "" + file.getAttachment(pageName,PUBLISH_CONFIG);
      config = JSON.parse(config);

      if(config.excludedFiles) {
        for(var i in config.excludedFiles) {
          if( attachment.fileName == config.excludedFiles[i] ) return true;
        }
      }
    }

    for(var j in EXCLUDE_LIST) {
      if(attachment.fileName == EXCLUDE_LIST[j]) {
        return true;
      }
    }
    return false;
  };

  var isExcludedPage = function(pageName) {
    if(pageName.charAt(0)=='+') pageName = pageName.substring(1);
    for(var j in EXCLUDE_PAGES) {
      if(pageName == EXCLUDE_PAGES[j]) {
        return true;
      }
    }
    return false;
  };

  var getPublishConfig = function(pageName) {
    if(pageName.indexOf("/Develop"+"ment")!==0) pageName = "/Develop"+"ment"+pageName;
    if( file.attachmentExists(pageName,PUBLISH_CONFIG)==true ) {
      var config = "" + file.getAttachment(pageName,PUBLISH_CONFIG);
      config = JSON.parse(config);

      if(config.excludedFiles) {
        for(var i in config.excludedFiles) {
          EXCLUDE_LIST.push( config.excludedFiles[i] );
        }
      }

      return config;
    }
  };

  var hasTranslator = function(pageName) {
    if(pageName.indexOf("/Develop"+"ment")!==0) pageName = "/Develop"+"ment"+pageName;
    return file.attachmentExists(pageName,TRANSLATION_SCRIPT);
  };

  var translate = function(pageName,fileName,data,log) {
    notes = "";
    if(hasTranslator(pageName)==false) return {translated: data, notes: notes};

    if(log) log.debug( "Applying transform script to " + pageName + "/" + fileName );
    notes += "Applying transform script to " + pageName + "/" + fileName;
    var script = file.getAttachment("/Develop"+"ment"+pageName,TRANSLATION_SCRIPT);
    var jsonData = JSON.stringify(data);
    var fn = "newData = function(data){"+script+"}("+jsonData+");";
    var newData = eval(fn);

    return {translated: newData, notes: notes};
  };

  var hasChangesSince = function(pageName, ts, changeList) {
    var matching = ".*"; //Regex include all

    var shortPageName = pageName.substring( pageName.lastIndexOf("/")+1 );

    var excluded = [ //Files that can change
      "page.html",
      "page.html.fragment",
      "release-info.json",
      shortPageName + ".wiki.zip"
    ];

    var list = file.getAttachmentsForPage( pageName );
    if(pageName.charAt(0)!='/')
    {
      pageName = "/"+pageName;
    }

    var iterator= list.keySet().iterator();
    while(iterator.hasNext())
    {
      var key = ""+iterator.next();
      //log( "Key:"+key );
      var item;
      if(key.charAt(0)==='+') {
        if(key=="+history") continue;
        //log("Checking sub page " + pageName + "/" + key.substring(1));
        hasChangesSince( pageName + "/" + key.substring(1), ts, changeList );
        continue;
      } else if(matching!==null && key.search( ""+matching )==-1 ) {
        continue;
      } else {
        item = key;
      }

      var exclude = false;
      for(var i in excluded) {
        if(item==excluded[i]) {
          exclude = true;
          //log("excluding "+item);
          break;
        }
      }
      if(exclude) continue;

      var fts = -1;
      if(item.indexOf(".link")==item.length-5) {
        var fPath = file.getPageInheritedFilePath( pageName, item );
        if(fPath!=null) {
          fts = file.getAttachmentTimestamp( pageName, item );
        }
      } else {
        fts = file.getAttachmentTimestamp( pageName, item );
      }
      if(fts>ts) {
        //log("changed "+item);
        var md5="";
        if(file.getAttachmentSize( pageName, item ) < 10000) {
          var fileData = "" + file.getAttachment( pageName, item );
          try{
          	md5 = "" + js.generateMD5( fileData );
          } catch(e) {
          }
        }
        changeList.push( {pageName: pageName, fileName: item, changed: fts, md5: md5} );
      } else {
        //log("no change "+item);
      }

    }
    //log("Finished checking "+pageName);
    return changeList;
  };

  var processDeletions = function(attachments,publishedAttachments,practice,parentPage) {
    var notes = "\n==== Deletions Check ====\n";

    for(var i in publishedAttachments) {
      var found = false;
      var existingAttachment = publishedAttachments[i];
      if(existingAttachment.fileName==="page.html.template.link") continue;
      if(isExcludedFile(existingAttachment)) {
        if(practice) {
          notes += "Deletion. " + existingAttachment.pageName + "/" + existingAttachment.fileName + " in excluded list. It will be deleted\n";
        } else {
          //file.deleteAttachmentNoBackup(existingAttachment.pageName,existingAttachment.fileName);
          //notes += "Deletion. " + existingAttachment.pageName + "/" + existingAttachment.fileName + " in excluded list. It has been deleted\n";
          file.appendStringToFile(parentPage,DELETIONS,"file.deleteAttachmentNoBackup('"+existingAttachment.pageName+"','"+existingAttachment.fileName+"'+);\n");
          notes += "Deletion. " + existingAttachment.fileName + " no longer required. It has been added to the deletetion script "+parentPage+"/"+DELETIONS+"\n";
        }
        continue;
      }
      for(var j in attachments) {
        var attachment = attachments[j];
        if(attachment.fileName==existingAttachment.fileName) {
          found = true;
          break;
        }
      }
      if(found===false) {
        if(practice===true) {
          notes += "Deletion. " + existingAttachment.pageName + "/" + existingAttachment.fileName + " no longer required. It will be deleted\n";
        } else { 
          //file.deleteAttachmentNoBackup(existingAttachment.pageName,existingAttachment.fileName);
          //notes += "Deletion. " + existingAttachment.fileName + " no longer required. It has been deleted\n";
          file.appendStringToFile(parentPage,DELETIONS,"file.deleteAttachmentNoBackup('"+existingAttachment.pageName+"','"+existingAttachment.fileName+"'+);\n");
          notes += "Deletion. " + existingAttachment.fileName + " no longer required. It has been added to the deletetion script "+parentPage+"/"+DELETIONS+"\n";
        }
      }
    }
    return notes;
  };

  var replaceDevelopmentPaths = function(attachments,practice,log) {
    var notes = "\n==== Publishing Actions ====\n";

    var i=0;
    for(i in attachments) {
      var attachment = attachments[i];
      if(isTextFile(attachment)===false) {
        notes += "Including " + attachment.fileName +" without changes as not text file.\n";
        continue;
      }
      if(isExcludedFile(attachment)) {
        notes += "Excluding " + attachment.fileName +" as is in excluded file list.\n";
        continue;
      }
      if(attachment.fileName===RELEASE_NOTES) {
        notes += "Excluding " + attachment.fileName +"\n";
        continue;
      }

      if(log) log.debug("Replacing development paths in " + attachment.pageName + "/" + attachment.fileName);

      var data = "" + file.getAttachment(attachment.pageName,attachment.fileName,false); // Do not follow links
      var newData = "";

      notes+="Looking for transform script for " + attachment.pageName + "\n";
      if(data.indexOf("Develop"+"ment/")!=-1 || hasTranslator(attachment.pageName)) {

        if(!practice && attachment.pageName.indexOf("Develop"+"ment")==-1) {
          notes += "Removed Develop"+"ment/ references in " + attachment.pageName + "/" + attachment.fileName + "\n";
        } else {
          notes += "Remove Develop"+"ment/ references in " + attachment.pageName + "/" + attachment.fileName + "\n";
        }
        var lines = data.split("\n");

        if(log) log.debug("Found Develop"+"ment/ in " + attachment.pageName + "/" + attachment.fileName + ". Processing " + lines.length + " lines.");

        for(var l=0; l<lines.length; l++) {
          var line = lines[l];
          if(line.indexOf("Develop"+"ment/")!=-1) {
            notes += "\tLine " + l + "\n";
            notes += "\t" + line + "\n";
            line = line.replaceAll( "Develop"+"ment/","" ).replaceAll( "","" );
          }
          newData += line + "\n";
        }

        var translation = translate(attachment.pageName,attachment.fileName,newData, log);
        newData = translation.translated;
        notes += translation.notes;

        if(log) log.debug("Processed develop"+"ment paths in " + attachment.pageName + "/" + attachment.fileName);

        if(!practice && attachment.pageName.indexOf("Develop"+"ment/")==-1) {
          file.saveAttachment(attachment.pageName,attachment.fileName,newData);
          notes += "Saved processed file " + attachment.pageName + "/" + attachment.fileName + "\n";
        }
      }

    }

    notes += "\n\n";
    return notes;
  };

  var checkServices = function(attachments) {
    var notes = "\n==== Services Check ====\n";
    var deployList = "";
    var deplopDedupe = {};
    for(var i in attachments) {
      var attachment = attachments[i];
      if(isTextFile(attachment)===false) continue;
      if(isExcludedFile(attachment)) continue;
      if(attachment.fileName===RELEASE_NOTES) continue; 

      var data = ""+file.getAttachment(attachment.pageName,attachment.fileName);
      var hasDependencys = false;

      if(data.indexOf("/Develop"+"ment/")!=-1) {
        notes += "Service call(s) in " + attachment.pageName + "/" + attachment.fileName + "\n";
        var lines = data.split("\n");
        for(var l=0; l<lines.length; l++) {
          var line = lines[l];
          if(line.match(/JSON(\.get|\.post)/) && line.indexOf("(") > line.indexOf("JSON") && line.indexOf("\"") > line.indexOf("(\"")) {
            notes += "\tCall on line " + l + "\n";
            notes += "\t" + line + "\n";
            line = line.replace(/\(\s\"/g,"(");
            var service  = line.between( "(\"","\"" );
            if(service.indexOf("/Develop"+"ment/")!=-1) {
              service = service.after("/Develop"+"ment");
            }
            if(service.indexOf("?")!=-1) {
              service = service.before("?");
            }

            if( file.attachmentExists( service , "get.sjs" ) ) {
              if(attachment.pageName!="/Develop"+"ment"+service) { // Not self
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
    var notes = "\n==== Check For ToDo Comments ====\n";
    for(var i in attachments) {
      var attachment = attachments[i];
      if(isTextFile(attachment)===false) continue;
      if(attachment.fileName===RELEASE_NOTES) continue; 

      var data = file.getAttachment(attachment.pageName,attachment.fileName);

      if(data!=null && data.toLowerCase().indexOf("todo")!=-1) {
        notes += "TODOs found in <a href='/OpenForum/Editor?pageName="+attachment.pageName+"&fileName="+attachment.pageName+"'>" + attachment.pageName + "/" + attachment.fileName + "</a>\n";
        var lines = data.split("\n");
        for(var l=0; l<lines.length; l++) {
          var line = lines[l];
          if(line!=null && line.toLowerCase().indexOf("todo")!=-1) {
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
    var notes = "\n==== Check Attachments ====\n";

    for(var i in attachments) {
      var attachment = attachments[i];
      if(isExcludedFile(attachment)==false) {
        if(isTextFile(attachment) && attachment.fileName!==RELEASE_NOTES) {
          notes += "Move and check " + attachment.pageName + "/" + attachment.fileName + "\n";
        } else {
          notes += "Move " + attachment.pageName + "/" + attachment.fileName + "\n";
        }
      }
    }

    notes += "\n\n";
    return notes;
  };

  var getLatestChange = function( pageName, depth, log ) {
    //if(log) log.debug( "get latest change " + pageName );

    var ts = 0;
    var fileName = "";
    depth ++;
    if(depth > MAX_PAGE_DEPTH ) {
      return ts;
    }

    var matching = ".*"; //Regex include all

    var list = file.getAttachmentsForPage( pageName );
    if(pageName.charAt(0)!='/') {
      pageName = "/"+pageName;
    }

    var iterator= list.keySet().iterator();
    while(iterator.hasNext()) {
      var key = ""+iterator.next();

      if(log) log.debug( "key: " + key );

      if(key.charAt(0)==='+') {
        if ( !isExcludedPage(key) ) {
          var found = getLatestChange( pageName+"/"+key.substring(1), depth, log );
          if(found.t>ts) {
            ts = found.t;
            fileName = found.fileName;
          }
        }
        continue;
      } else if(matching!==null && key.search( ""+matching )==-1 ) {
        continue;
      } else if( isExcludedFile({pageName: pageName, fileName: key}) ) {
        continue;
      } else {

        var t = ts;
        try{
          t = file.getAttachmentTimestamp(pageName,key);
        } catch(e) {
          if(log) log.debug( pageName + " file " + key + " has an invalid timestamp. Probably a bad link file." );
        }
        if(t>ts) {
          ts = t;
          fileName = pageName + "/" +key;
        }
      }
    }
    return {t:ts, fileName: fileName};
  };

  /*
   * The main method to publish a page.
   */
  self.publish = function(pageName,practice,debug,log,user,parentPage) {
    if(file.attachmentExists(pageName,"do-not-release.txt")==true) {
      throw "The page " + pageName +  " has been marked as not for release. Read and then delete do-not-release.txt to remove the lock.";
    }
    if(pageName==="/Develop"+"ment") {
      throw "You cannot publish every thing. Publish a bit at a time.";
    }
    if(pageName==="/Develop"+"ment/ServiceLayer") {
      throw "You cannot publish whole service layer. Publish service at a time.";
    }
    if(pageName==="/OpenForum") {
      throw "You cannot publish whole OpenForum root. Publish a bit at a time.";
    }
    if(pageName==="/Develop"+"ment/Administration") {
      throw "Administration stays with development.";
    }
    if(pageName==="/Develop"+"ment/MessagingServices") {
      throw "Messaging Services stays with development.";
    }
    if(pageName==="/Develop"+"ment/Notes") {
      throw "Developer Notes stays in develop"+"ment.";
    }
    if(!parentPage) {
      parentPage = pageName;
      file.saveAttachmentNoBackup(parentPage,DELETIONS,"/* Files To Delete */\n// Created " + new Date()+"\n\n");
    }

    if(!debug) log=false;

    var publishedPageName;

    if(log) log.debug("Publishing " + pageName + " Publisher version " + VERSION);

    if(pageName.indexOf("/Develop"+"ment/")===0) {
      publishedPageName = pageName.substring(12);
    } else {
      throw "Page name must start with /Develop"+"ment/";
    }
    var publishTime = new Date();

    var notes = "Publishing " + pageName + " on " + publishTime + " practice:" + practice + "\nUsing Publisher version " + VERSION +"\n\n";

    var config = getPublishConfig(pageName);
    if(config) {
      notes += "Loaded publish config " + pageName + "/" + PUBLISH_CONFIG + ".\n";
    } else {
      notes += "No publish config " + pageName + "/" + PUBLISH_CONFIG + " found for page.\n";
      config = {};
    }

    try{
      if(practice===false) {
        notes += "\nCopying page "+pageName+" to page "+publishedPageName;
        var logged = FileManager.copyPage( pageName,publishedPageName );
        notes += "\n" + logged.replaceAll("    ","\n") + "\n";
        notes += "\nCopied page "+pageName+" to page "+publishedPageName;

        if (file.attachmentExists(publishedPageName,"page.html.template.link")) {
          //Copy the link
          var linkData = file.getAttachment(publishedPageName,"page.html.template.link",false);
          openForum.saveAsAttachment(publishedPageName,"page.html.template.link",linkData,user);
          notes += "\nPage template link for (" + publishedPageName + ") defined as " + linkData + " and copied to published page";
          
        } else if(file.attachmentExists(publishedPageName,"page.html.template")) {
          // Do nothing
          notes += "\nPage template defined in page (" + publishedPageName + ") and not changed " + file.attachmentExists(publishedPageName,"page.html.template");
          
        } else {
          file.saveAttachment(publishedPageName,"page.html.template.link","/OpenForum/PageTemplates/Published/page.html.template");
          notes += "\nAdded link to /OpenForum/PageTemplates/Published/page.html.template";
        }
      }

     var attachments = getAttachments(pageName);
     var publishedAttachments = attachments;
      if(practice===false) publishedAttachments = getAttachments(publishedPageName);

      if(log) log.debug("Found " + attachments.length + " attachments to publish");

      notes += checkAttachments(attachments);
      if(log) log.debug("Checked page attachments");

      notes += processDeletions(attachments,publishedAttachments,practice,parentPage);
      if(log) log.debug("Processed page deletions");

      notes += replaceDevelopmentPaths(publishedAttachments,practice,log);
      if(log) log.debug("Replaced page development paths");

      notes += checkServices(attachments);
      if(log) log.debug("Checked page services");

      notes += checkForToDo(attachments);

      if(log) log.debug("Checked page for todos");

    } catch(e) {
      notes += "\n\nError: "+e+"\n\n";
      if(log) log.debug("Publishing error " + e);
    }

    //Publish sub pages
    var subPages = [];
    getPages( pageName, subPages, true );
    for( var s in subPages ) {
      if(subPages[s]==pageName) {
        continue;
      }
      notes += "\n\nPublishing sub page " + subPages[s] + "\n";
      //println( "Sub: " + subPages[s] );
      var result = self.publish(subPages[s],practice,debug,log,user,parentPage);
      notes += result.notes;
      notes += "\n\n";
    }

    if(!practice) {

      if(pageName==parentPage) {
        file.saveAttachment(pageName,RELEASE_NOTES,notes);
      }
      openForum.refreshPage(publishedPageName);
    }

    notes = notes
      .replace("==== ","<dl class=\"accordion\" data-accordion><dd class=\"accordion-navigation\"><a href=\"#panelN\">")
      .replaceAll(" ====","</a><div id=\"panelM\" class=\"content\">")
      .replaceAll("==== ","</div></dd><dd class=\"accordion-navigation\"><a href=\"#panelN\">")
      .replace(/\n/g,"<br/>\n");
    notes+="</dd></dl>";
    
    var panelN = 1;
    while( notes.indexOf("panelN")!=-1 ) {
      notes = notes.replace( "panelN", "panel"+panelN ).replace( "panelM", "panel"+panelN );
      panelN ++;
    }

    return {notes: notes,publishedPageName: publishedPageName};
  };

  self.reversePublish = function(publishedPageName) {
    var devPageName = "/Develop"+"ment" + publishedPageName;
    
    var notes = "";
    
    var logged = FileManager.copyPage( publishedPageName,devPageName );
    notes += "Page " + publishedPageName + " copied to " + devPageName + " logged:" + logged;

    return {notes: notes,publishedPageName: publishedPageName, devPageName: devPageName };
  };
  
  self.getNeedsPublishing = function(log) {
    var pages = [];
    getPages("/Develop"+"ment",pages,true);

    var oldPages = [];

    for(var i=0;i<pages.length;i++) {
      if(log) log.debug( "Checking page " + pages[i] );

      var needsPublishing = self.pageNeedsPublishing(pages[i],log);

      if(needsPublishing) {
        oldPages.push( needsPublishing );
      }
    }

    return oldPages;
  };

  self.pageNeedsPublishing = function(pageName,log) {
    if(file.attachmentExists(pageName,"do-not-release.txt")==true) {
      if(log) log.debug( "Page " + pageName + " has do-not-release.txt" );
      return false;
    }

    if(log) log.debug( "Checking Page Change " + pageName );
    var t = getLatestChange(pageName,0,log);
    if(log) log.debug( pageName + " changed " + Date(t) );

    var livePage = pageName.substring(12);
    if(log) log.debug( "Checking Live Page " + livePage );

    var publishedT = 0;
    if( file.attachmentExists(livePage,RELEASE_NOTES) ) {
      publishedT = file.getAttachmentTimestamp(livePage,RELEASE_NOTES);

      if(log) log.debug( "Page " + pageName + " last published " + new Date(publishedT) );
    }

    var lt = getLatestChange(livePage,0,log);

    if(publishedT!=0 && lt.t>publishedT) {
      if(log) log.debug( "Live version of page " + pageName + " has been changed" );

      return {pageName: livePage, devTS: t.t, liveTS: lt.t, devDate: new Date(t.t).toString(), liveDate: new Date(lt.t).toString(), publishedDate: new Date(publishedT).toString(), 
              alert: "Live page file " + lt.fileName + " was changed on " + Date(lt.t).toString() + " after it was published on " + new Date(publishedT).toString()};
    } else if(t.t>lt.t) {

      if(log) log.debug( "Page " + pageName + " to be published" );

      return {pageName: livePage, devTS: t.t, liveTS: lt.t, devDate: new Date(t.t).toString(), liveDate: new Date(lt.t).toString(), publishedDate: new Date(publishedT).toString()};
    }
  };

  self.getPublishedPageDifferences = function( pageName ) {
    var ts = 0;
    var devChanges = [];
    hasChangesSince(pageName, ts, devChanges);

    var pubPageName = pageName.substring(pageName.indexOf("/Develop"+"ment") + 12);
    var pubChanges = [];
    hasChangesSince(pubPageName, ts, pubChanges);

    var changes = [];

    for(var p in devChanges) {
      var page = devChanges[p];
      for(var q in pubChanges) {
        var pubPage = pubChanges[q];
        if(page.pageName == "/Develop"+"ment"+pubPage.pageName && page.fileName == pubPage.fileName) {
          if(page.changed != pubPage.changed) {
            changes.push( {status: "changed", dev: page, pub: pubPage} );
          }
          break;
        }
      }
    }
    
    return changes;
  };

  self.getVersion = function() {
    return VERSION;
  };

  var FileManager = function(isExcludedFile) {
    var self = this;
    self.copyPage = function(fromPage,toPage) {
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
            if(isExcludedFile({pageName: fromPage, fileName: key}) == false) {
              if(key.indexOf(".link")!==-1) {
                var data = file.getAttachment(fromPage, key, false);
                log += "[LINK:"+data+"] to " + toPage + " key " + key;
                file.saveAttachment(toPage, key, data);
              } else {
                file.copyAttachment( fromPage, key , toPage, key );
              }
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

  };
  FileManager = new FileManager(isExcludedFile);

};



