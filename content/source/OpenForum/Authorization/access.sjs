//create function
function access() {
  var userName = ""+login.getUser().getName();
  if(userName==="Admin") {
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

//log.test("Checking "+userName);
 
    if(!accessJSON.userAccess) { // If no access element then can access
//log.test("Passed 1");
      return true;
    }

	if(!accessJSON.userAccess[action] || !accessJSON.userAccess[action][userName]) { // If no access.action.userName then cannot access
          if(accessJSON.groupAccess && accessJSON.groupAccess[action]) {
             for(var groupName in accessJSON.groupAccess[action]) {
               var groupMembers = openForum.getPageAsList("/OpenForum/Groups/"+groupName);
//log.test("Group members "+groupMembers.length+" in "+"/OpenForum/Groups/"+groupName);         
               for(var j=0 ; j<groupMembers.length ; j++) {
//log.test("Checking group member "+groupMembers[j][0]);         
                 if(""+groupMembers[j][0]===userName) {
//log.test("Passed 2");
                   return true;
               }
             }
           }
         }
//log.test("Failed 2");
		return false;
	}

	if(!accessJSON.userAccess || !accessJSON.userAccess[action]) { // If no access.action element then cannot access
//log.test("Failed 1");
		return false;
	}
//log.test("Final Point "+accessJSON.userAccess[action][userName]);
	return accessJSON.userAccess[action][userName]; // return access right for user
}

// run function
access();
