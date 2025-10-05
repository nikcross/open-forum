/*
* Author: 
* Description: 
*/
if(file.attachmentExists("/OpenForum/AddOn/Update","auto-update.json")==false) {
  file.saveAttachment("/OpenForum/AddOn/Update","auto-update.json","[]");
}