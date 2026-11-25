//create function
function access() {
  var userName = ""+login.getUser().getName();
  if(userName==="Admin" || userName==="System") {
    return true;
  } else if(pageName.indexOf("/private")!=-1) {
    return false;
  }
  
  //Log
  try{
    //openForum.storeValue("openForum.pageViews.error",""+fileName);
    var count = openForum.retrieveValue("openForum.fileViews.bucket");
    count = parseInt(""+count);
    if( isNaN(count) ) count = 0;
    count ++;
    openForum.storeValue("openForum.fileViews.bucket",""+count);

  } catch(e) {
    openForum.storeValue("openForum.fileViews.bucket","0");
  }

  try{

    if( typeof fileName != "undefined" && fileName == "page.html" ) {
      var pageCount = openForum.retrieveValue("openForum.pageViews.bucket");
      pageCount = parseInt(""+pageCount);
      if( isNaN(pageCount) ) pageCount = 0;
      pageCount ++;
      openForum.storeValue("openForum.pageViews.bucket",""+pageCount);
    }

  } catch(e) {
    openForum.storeValue("openForum.pageViews.bucket",""+e);
  }

  if(userName==="Admin" || userName==="System") {
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

  //log.test("Checking "+userName+" for "+pageName);

  if(!accessJSON.userAccess) { // If no access element then can access
    //log.test("Passed 1");
    return true;
  }

  if(accessJSON.userAccess[action] && accessJSON.userAccess[action]["Guest"]) { // If Guest access allowed
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
