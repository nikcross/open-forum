//create function
function access() {
  if(login.getUser().getName()==="Admin") {
    return true;
  }
  
  var data = file.getPageInheritedFileAsString(pageName,"access.json");
  
	//if page is unprotected
  if (data===null) {
		return true;
	}
  data = ""+data;
/**
 * Example access.json file
 * {
 * 	userAccess: {
 * 		read: {
 * 			jim: true,
 * 			bob: false
 * 		}
 * 	},
 * 	groupAccess: {
 * 		read: {
 * 			members: true
 * 		},
 * 		write: {
 * 			authors: true
 * 		}
 *  }
 * }
 */
  
	var accessJSON = JSON.parse(data);
 
    if(!accessJSON.userAccess) { // If no access element then can access
      return true;
    }
	if(!accessJSON.userAccess[action]) { // If no access.action element then cannot access
		return false
	}
	if(!accessJSON.userAccess[action][login.getUser().getName()]) { // If no access.action.userName then cannot access
		return false;
	}
	return accessJSON.userAccess[action][login.getUser().getName()]; // return access right for user
}

// run function
access();
