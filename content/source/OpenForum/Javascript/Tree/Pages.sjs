/*
* Author: 
* Description: 
*/
var Pages = function() {
  var self = this;
  
  self.getSubPages = function(pageName) {
    try{
      var list = file.getAttachmentsForPage( pageName );
      var iterator= list.keySet().iterator();
      var keys = [];
      while(iterator.hasNext()) {
        var key = ""+iterator.next();
        if(key.charAt(0)=='+' && key!="+history") {
        	keys.push( (pageName +"/" + key.substring(1)).replace(/\/\//g,"/") );
        }
      }
      keys.sort();
      
      return keys;
    } catch(e) {
      return ["error:"+e];
    }
  };
};