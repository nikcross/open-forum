/*
* Author: 
* Description: 
*/
if(typeof Common === "undefined") {
  var Common = js.getObject("/OpenForum/Javascript","Common.sjs");
  Common.extendArray(Array);
  Common.extendDate(Date);
  Common.extendString(String);
}

if( file.attachmentExists("/OpenForum/AddOn/SQL","initialise.sjs")==true && file.attachmentExists("/OpenForum/Users/Admin","sql.config")==false ) {
  var init = ""+file.getAttachment("/OpenForum/AddOn/SQL","initialise.sjs");
  if( init.indexOf( "//Version" )!=0 ) { // Not new version so parse

    var config = [];

    var lines = init.split("\n");
    for(var l in lines) {
      var line = lines[l];
      
      line = line.between( "db.createConnection(",");" );
      if( typeof line != "undefined") {
        var part = line.split(",");

        var db = {
          "alias": part[0],
          "url": part[1],
          "user": part[2],
          "password": part[3]
        };

        config.push( db );
      }
    }

    file.saveAttachment("/OpenForum/Users/Admin","sql.config",JSON.stringify(config,null,4));
  }
} 

file.copyAttachment("/OpenForum/AddOn/SQL","new-initialise.sjs","/OpenForum/AddOn/SQL","initialise.sjs");
try{
file.deleteAttachmentNoBackup("/OpenForum/AddOn/SQL","new-initialise.sjs");
//Fix previous error
file.deleteAttachmentNoBackup("/OpenForum/AddOn/SQL","test-initialise.sjs");
} catch(e) {}

var pageContent = file.getAttachment("/OpenForum/Users/Admin","page.content");
var insert = "&insert:/OpenForum/AddOn/SQL/sql-config.wiki.fragment;";

if(pageContent.indexOf( insert ) == -1) {
  pageContent += "\n----\n" + insert + "\n\n";
  file.saveAttachment("/OpenForum/Users/Admin","page.content" , pageContent);
  openForum.refreshPage("/OpenForum/Users/Admin");
}