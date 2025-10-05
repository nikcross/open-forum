/*
* Author: 
* Description: 
*/
var root = "/OpenForum/Extensions";
var list = file.getAttachmentsForPage( root );

var examples = [];

var iterator= list.keySet().iterator();
while(iterator.hasNext())
{
  var key = ""+iterator.next();
  var item;
  if(key.charAt(0)==='+') { // ignore sub pages
    var pageName = root + "/" + key.substring(1);
    
    if( file.attachmentExists( pageName, "example.txt") ) {
      examples.push( "" + file.getAttachment( pageName, "example.txt" ) );
    }
  }
}

file.saveAttachment( root, "examples.json", JSON.stringify( examples, null, 4 ) );
