/*
* Author: Nik Cross
* Description: 
*/
var Updater = function() {
  var self = this;

  var host = "https://open-forum.onestonesoup.org";
  var releasesPath = "/OpenForum/AddOn/ReleasedPackages";
  var packagesPath = "/OpenForum/AddOn/ReleasedPackages/Packages";

  var println;
  self.setPrintln = function(pl) {
    println = pl;
  };
  
  var log = function( message ) {
    if(println) println(message);
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
      log( "Key:"+key );
      var item;
      if(key.charAt(0)==='+') {
        if(key=="+history") continue;
        log("Checking sub page " + pageName + "/" + key.substring(1));
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
          log("excluding "+item);
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
        log("changed "+item);
        changeList.push( {pageName: pageName, fileName: item, changed: fts} );
      } else {
        log("no change "+item);
      }

    }
    log("Finished checking "+pageName);
    return changeList;
  };
  self.hasChangesSince = hasChangesSince;

  self.getUpdateInfo = function(pageName) {
    var data = "" + external.getURLAsString(host+releasesPath+"?action=getReleaseInfo&pageName="+pageName);
    return JSON.parse(data).data;
  };

  self.getReleases = function() {
    var data = "" + external.getURLAsString(host+releasesPath+"?action=getReleases");
    var releases = JSON.parse(data).data;
    for( var r in releases ) {
      var release  = releases[r];
      var pageName = release.pagename;
      var currentVersion = "";
      if( file.attachmentExists(pageName,"release-info.json")==false ) {
        currentVersion = "Not Installed";
      } else {
        var releaseInfo = JSON.parse( ""+ file.getAttachment(pageName,"release-info.json") );
        currentVersion = releaseInfo.version;
      }
      if(currentVersion!=release.version) {
        release.version_VIEW = "<span style='color: red'>"+release.version+" Current Version: "+currentVersion+"</span>";
      } else {
        release.version_VIEW = "<span style='color: green'>"+release.version+"</span>";
      }

      release.currentVersion = currentVersion;
    }

    return releases;
  };

  self.getUpdate = function(pageName,ignoreChanges) {

    var result = "";

    if( file.attachmentExists(pageName,"release-info.json")==true && !ignoreChanges ) {
      var releaseInfo = JSON.parse( ""+ file.getAttachment(pageName,"release-info.json") );
      var changeList = [];
      hasChangesSince(pageName, releaseInfo.installedDate, changeList);
      if(changeList.length>0) {
        result = "Failed to update " + pageName + " as the following files have been changed locallly since last installed:\n";
        for(var c in changeList) {
          result += changeList[c].fileName+" changed on " + new Date(changeList[c].changed) + "\n";
        }
        throw result;
      }
    }

    var info = self.getUpdateInfo(pageName);

    try{
      if( info.extra && info.extra.requires ) {
        for(var i in info.extra.requires) {
          result += "  Requirement " + self.getUpdate( info.extra.requires[i].pageName ) + " \n";
        }
      }

      var fileName = pageName.split("/");
      fileName = fileName[fileName.length-1];
      fileName = fileName + ".wiki.zip";

      var url = host + packagesPath + "/" + fileName;
      external.getURLAsFile( url,pageName,fileName );
      file.unZipAttachment(pageName,fileName);

      //Run the pre release script
      if(file.attachmentExists( pageName,"install.sjs" )) {
        var script = "" + file.getAttachment(pageName,"install.sjs");
        eval(script);
      }

      //Set intalled date to check from changes on next update
      if( file.attachmentExists(pageName,"release-info.json")==true ) {
        var releaseInfo = JSON.parse( ""+ file.getAttachment(pageName,"release-info.json") );
        releaseInfo.installedDate = new Date().getTime();
        file.saveAttachment(pageName,"release-info.json",JSON.stringify(releaseInfo,null,4));
      }

      result += "Page " + pageName + " updated from " + host;

      var config = openForum.retrieveObject("config");
      var serverName = config.getValue("serverName");
      var data = "" + external.getURLAsString(host+releasesPath+"?action=announceUpdated&siteName="+encodeURI(serverName)+"&pageName="+encodeURI(pageName));
    } catch(e) {
      throw "Failed to update " + pageName + " from  " + host + " Error:"+e;
    }

    return result;
  };
  
  self.upsertToJSONList = function(pageName, fileName, row, indexName) {
    if( file.attachmentExists(pageName, fileName) == false ) {
      file.saveAttachment( pageName, fileName, "[]");
    }
    
    var list = JSON.parse( "" + file.getAttachment(pageName, fileName) );
    
    var found = false;
    for(var i in list) {
      if( list[i][indexName] == row[indexName] ) {
        for(var f in row) {
          list[i][f] = row[f];
        }
        found = true;
        break;
      }
    }
    if(!found) {
      list.push( row );
    }
    
    file.saveAttachment( pageName, fileName, JSON.stringify(list,null,4) );
    
    return list;
  };
  
};