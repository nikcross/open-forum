/*
* Author: Nik Cross
* Description: 
*/
var Update = function() {
  var self = this;

  var host = "https://open-forum.onestonesoup.org";
  var releasesPath = "/OpenForum/AddOn/ReleasedPackages";

  self.getUpdateInfo = function(pageName) {
    var data = "" + external.getURLAsString(host+releasesPath+"?action=getReleaseInfo&pageName="+pageName);
    return JSON.parse(data).releaseInfo;
  };

  self.getReleases = function() {
    var data = "" + external.getURLAsString(host+releasesPath+"?action=getReleases");
    return JSON.parse(data).releases;
  };

  self.update = function(pageName) {
    var info = self.getUpdateInfo(pageName);
    var result = "";
    
    try{
    if( info.extra && info.extra.requires ) {
      for(var i in info.extra.requires) {
        result += "  Requirement " + self.update( info.extra.requires[i].pageName ) + " \n";
      }
    }
    
    var fileName = pageName.split("/");
    fileName = fileName[fileName.length-1];
    fileName = fileName + ".wiki.zip";

    var url = host + releasesPath + "/" + fileName;
    external.getURLAsFile( url,pageName,fileName );
    file.unZipAttachment(pageName,fileName);

    result += "Page " + pageName + " updated from " + host;
    } catch(e) {
      return "Failed to update " + pageName + " from  " + host + " Error:"+e;
    }
    
    return result;
  };
};