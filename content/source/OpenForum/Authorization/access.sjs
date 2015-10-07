function access() {
  if(login.getUser().getName()==="Admin") {
    return true;
  }
  
  
  openForum.postMessageToQueue("test","trying1");
  var data = file.getPageInheritedFileAsString(pageName,"data.json");
  
	//if page is unprotected
  if (data===null) {
		return true;
	}
  data = ""+data;
	
	var action = "read";
	var accessJSON = JSON.parse(data);
  
    if(!accessJSON.access) {
      return true;
    }
	
	//if page is protected
   openForum.postMessageToQueue("test","trying2");
	if(accessJSON.access[login.getUser().getName()] && 
           accessJSONaccess[login.getUser().getName()].read===true) {
		return true;
    } else {
      return false;
    }
}

access();
