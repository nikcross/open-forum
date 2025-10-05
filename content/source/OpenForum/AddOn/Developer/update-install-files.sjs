/*
* Author: Admin 
* Description: 
*/
files = JSON.parse( "" + file.getAttachment("/OpenForum/AddOn/Developer","developer-files.json") );

for(var i in files) {
  var row = files[i];
  println( "Copying " + row.targetPage + "/" + row.fileName + " to " + row.storePage + "/" + row.fileName  );
  
  if( file.pageExists(row.storePage) == false ) {
    println( "Creating storage page " +row.storePage );
    file.saveAttachment( row.storePage,"page.content","!!Storage Page\n\n!!Attachments\n[{AttachmentsList pageName=\"&pageName;\" matching=\".*\"}]" );
  }
  
  file.copyAttachment( row.targetPage, row.fileName, row.storePage, row.fileName );
}
