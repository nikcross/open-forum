/*
* Author: Nik Cross
* Description: 
*/
var Updater = js.getObject("/OpenForum/AddOn/Update","Updater.sjs");

function getLocalVersion(updatePage) {
  try{
    var data = JSON.parse( "" + file.getAttachment(updatePage.pageName,"release-info.json") );

    if( !data.version ) {
      return "?";
    }
    return data.version;
  } catch(e) {
    return "?";
  }
}

if(file.attachmentExists("/OpenForum/AddOn/Update","auto-update.json")) {
  var data = "" +file.getAttachment("/OpenForum/AddOn/Update","auto-update.json");
  var list = JSON.parse( data );
  //for each autoupdate page
  for( var p in list) {
    var updatePage = list[p];
    //check for an update
    var localVersion = getLocalVersion(updatePage);
    var remote = Updater.getUpdateInfo(updatePage.pageName);
    //if updated
    if(remote.version) {
      if(
        localVersion != remote.version
      ) {
        Updater.getUpdate(updatePage.pageName,true);
        var date = new Date();
        date = date.toDateString() +  date.toTimeString().substring(0,8);
        file.appendStringToFileNoBackup("/OpenForum/AddOn/Update","auto-update.log", date + " Updated " + updatePage.pageName + " from version " + localVersion + " to version " + remote.version + "\n");
      }
    }
  }
}
