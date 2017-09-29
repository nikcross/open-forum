/*
* Author: 
* Description: 
*/
var UserAdministration = function() {
  var self = this;

  self.createUser  =function(userName) {
    //TODO
    //check user name
    if(userExists(userName)) return false;

    //copy user template
    file.copyPage( "/OpenForum/Access/UserAdministration/","/OpenForum/Users/"+userName );

    //set up user template

    //Add user to members list ?
  };

  self.createGroup = function(groupName) {
    //TODO
    //check group name
    if(groupExists(groupName)) return false;
    
    //set up group template
  };

  self.addUserToGroup = function(userName,groupName) {
    if(!userExists(userName)) return false;
    if(!groupExists(groupName)) return false;
    if(userInGroup(userName,groupName)) return true;
    
    file.appendStringToFile("/OpenForum/Groups/"+groupName,"page.content","* "+userName+"\n");
    return true;
  };

  self.removeUserFromGroup = function(userName,groupName) {
    if(!userExists(userName)) return false;
    if(!groupExists(groupName)) return false;
    if(!userInGroup(userName,groupName)) return false;
    
    var users = getUsersInGroup(groupName);
    var newUsers = [];
    var i;
    for(i=0;i<users.length;i++) {
      if(user[i]==userName) continue;
      newUsers.push(user[i]);
    }
    
    var newUserList = "!!Users in group "+groupName+"\n\n";
    for(i=0;i<newUsers.length;i++) {
      newUserList += "* "+newUsers[i]+"\n";
    }
      newUserList += "\n\n";
    
    file.saveAttachment("/OpenForum/Groups/"+groupName,"page.content",newUserList);
    return true;
  };
  
  self.getAllUsers = function() {
    var users = getSubPages("/OpenForum/Users");
    return users;
  };

  self.getAllGroups = function() {
    var users = getSubPages("/OpenForum/Groups");
    return users;
  };

  var userInGroup = function(userName,groupName) {
    if(!groupExists(groupName)) return;
    var array2D = openForum.getPageAsList("/OpenForum/Groups/"+groupName);
    var users = [];
    for(var i=0; i<array2D.length; i++) {
      if(""+array2D[i][0]===userName) return true;
    }
    return false;
  };
  
  self.getUsersInGroup = function(groupName) {
    if(!groupExists(groupName)) return;
    var array2D = openForum.getPageAsList("/OpenForum/Groups/"+groupName);
    var users = [];
    for(var i=0; i<array2D.length; i++) {
      users.push( ""+array2D[i][0] );
    }
    return users;
  };

  var groupExists = function(groupName) {
    return file.pageExists("/OpenForum/Groups/"+groupName);
  };
  
  var userExists = function(userName) {
    return file.pageExists("/OpenForum/Users/"+userName);
  };
  
  self.removeUser = function(userName) {
    if(!userExists(userName)) return false;
    
    openForum.deletePage("/OpenForum/Users/"+userName);
    return true;
  };

  self.removeGroup = function(groupName) {
    if(!groupExists(groupName)) return false;
    
    openForum.deletePage("/OpenForum/Groups/"+groupName);
    return true;
  };

  var getSubPages = function(pageName) {
    var attachments=[];
    var list = file.getAttachmentsForPage( pageName );
    if(pageName.charAt(0)!='/')
    {
      pageName = "/"+pageName;
    }

    var pages = [];
    var iterator= list.keySet().iterator();
    while(iterator.hasNext())
    {
      var key = ""+iterator.next();
      var item;
      if(key.charAt(0)==='+') { // ignore sub pages
        if(key==="+history") continue;
        pages.push( key.substring(1) );
      }
    }
    return pages;
  };
};
