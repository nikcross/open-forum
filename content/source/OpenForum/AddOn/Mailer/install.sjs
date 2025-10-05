/*
* Author: 
* Description: 
*/
try{
file.deleteAttachmentNoBackup("/OpenForum/AddOn/Mailer","email-4.0.7.jar");
} catch(e) {}
try{
file.deleteAttachmentNoBackup("/OpenForum/AddOn/Mailer","email-4.0.8.jar");
} catch(e) {}

var pageContent = file.getAttachment("/OpenForum/Users/Admin","page.content");
var insert = "<!-- V 2.1 -->&insert:/OpenForum/AddOn/Mailer/mailer-config.wiki.fragment;";

if(pageContent.indexOf( insert ) == -1) {
  pageContent += "\n----\n" + insert + "\n\n";
  file.saveAttachment("/OpenForum/Users/Admin","page.content" , pageContent);
  openForum.refreshPage("/OpenForum/Users/Admin");
}