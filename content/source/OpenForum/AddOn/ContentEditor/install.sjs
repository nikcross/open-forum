if( file.attachmentExists( "/OpenForum/AddOn/ContentEditor", "pages-list.json" ) == false ) {
  file.saveAttachment( "/OpenForum/AddOn/ContentEditor", "pages-list.json", "[]" );
}

if( file.attachmentExists( "/OpenForum/AddOn/ContentEditor", "page-categories.json" ) == false ) {
  file.saveAttachment( "/OpenForum/AddOn/ContentEditor", "page-categories.json", "[]" );
}

if( file.attachmentExists( "/OpenForum/AddOn/ContentEditor", "page-categories.extended.json" ) == false ) {
  file.saveAttachment( "/OpenForum/AddOn/ContentEditor", "page-categories.extended.json", "[]" );
}


