/*
* Author: Admin 
* Description: 
*/

files = JSON.parse( "" + file.getAttachment("/OpenForum/AddOn/Developer","developer-files.json") );

for(var i in files) {
  var row = files[i];
  file.copyAttachment( row.storePage, row.fileName, row.targetPage, row.fileName );
}