function Attachments() {
  this.getList = function(targetPage,matching) {
      if(targetPage.charAt(0)!=='/') {
        targetPage = "/"+targetPage;
      }
    
      var list = file.getAttachmentsForPage(targetPage);
      var data="";
      var items=[];
      var iterator= list.keySet().iterator();
      while(iterator.hasNext())
      {
        var key = ""+iterator.next();
        if(key.charAt(0)==='+')  {
          continue;
        }  else if(matching && key.search( ""+matching )===-1 )  {
          continue;
        }  else  {
          items.push(key);
        }
      }

      items.sort();
    return items;
  };
}