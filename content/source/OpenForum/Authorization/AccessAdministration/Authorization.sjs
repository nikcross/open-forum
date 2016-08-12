/*
* Author: 
* Description: 
*/
var Authorization = function() {
  var self = this;
  
  self.getPageAccess = function(pageName) {
    // check page exists
    // TODO
    return JSON.parse( file.getPageInheritedFileAsString(pageName,"access.json") );
  };
  var getPageAccess = self.getPageAccess;
  var savePageAccess  = function(pageName,access) {
    file.saveAttachemnt(pageName, "access.json", JSON.stringify(access,null,4));
  };
  
  self.deletePageAccess  = function(pageName) {
    file.deleteAttachment(pageName, "access.json");
  };
  
  self.getAccessControlPage = function(pageName) {
    return ""+file.getPageInheritedFilePath(pageName,"access.json");
  };
  
  self.getUsersWithAccess = function(pageName,action) {
    var access = getPageAccess(pageName);
    var users = [];
    if(access.userAccess && access.userAccess[action]) {
      access = access.userAccess[action];
      for(var i in access) {
        users.push( i );
      }
    }
    return users;
  };
  
  self.getGroupsWithAccess = function(pageName,action) {
        var access = getPageAccess(pageName);
    var groups = [];
    if(access.groupAccess && access.groupAccess[action]) {
      access = access.groupAccess[action];
      for(var i in access) {
        groups.push( i );
      }
    }
    return groups;
  };
  
  self.addUserAccess = function(userName,pageName,action) {
    var access = getPageAccess(pageName);
    // check user exists
    // TODO
    if(!access.userAccess) {
      access.userAccess = {};
    }
    if( !access.userAccess[action]) {
      access.userAccess[action] = {};
    }
    if( !access.userAccess[action][userName]) {
      access.userAccess[action][userName] = true;
      savePageAccess(pageName,access);
    }
  };
  
  self.addGroupAccess = function(groupName,action) {
    var access = getPageAccess(pageName);
    // check group exists
    // TODO
    if(!access.groupAccess) {
      access.groupAccess = {};
    }
    if( !access.groupAccess[action]) {
      access.groupAccess[action] = {};
    }
    if( !access.groupAccess[action][groupName]) {
      access.groupAccess[action][groupName] = true;
      savePageAccess(pageName,access);
    }
  };
  self.removeUserAccess = function(userName,pageName,action) {
    var access = getPageAccess(pageName);
    // check user exists
    // TODO
    if(!access.userAccess) {
      return false;
    }
    if( !access.userAccess[action]) {
      return false;
    }
    if( access.userAccess[action][userName]) {
      delete access.userAccess[action][userName];
      savePageAccess(pageName,access);
      return true;
    }
    return false;
  };
  
  self.removeGroupAccess = function(groupName,pageName,action) {
        var access = getPageAccess(pageName);
    // check user exists
    // TODO
    if(!access.groupAccess) {
      return false;
    }
    if( !access.groupAccess[action]) {
      return false;
    }
    if( access.groupAccess[action][groupName]) {
      delete access.groupAccess[action][groupName];
      savePageAccess(pageName,access);
      return true;
    }
    return false;
  };
  
};