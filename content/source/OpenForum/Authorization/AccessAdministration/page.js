var pageName = "/OpenForum/PageTemplates/Default";
var accessView = {};

var users = [];
var groups = [];

var editMode;
var editingUser = " ";
var editingGroup = " ";

OpenForum.init = function() {
  clearAccessView();

  if(OpenForum.getParameter("pageName")!=="") {
    pageName = OpenForum.getParameter("pageName");
  } else {
    pageName = "/OpenForum/PageTemplates/Default";
  }

  OpenForum.getObject("editingUser").addListener( function(){
    updateEditingUser( editingUser );
  } );
  OpenForum.getObject("editingGroup").addListener( function(){
    updateEditingGroup( editingGroup );
  } );

  updateAccess();
  updateUsers();
  updateGroups();

  OpenForum.showElement("content");
};

function updateUsers() {
  JSON.get("/OpenForum/Access/UserAdministration","getAllUsers","pageName="+pageName).onSuccess(
    function(response) {
      users = response.users;
      users.push("Guest");
    }
  ).go();
}

function updateGroups() {
  JSON.get("/OpenForum/Access/UserAdministration","getAllGroups","pageName="+pageName).onSuccess(
    function(response) {
      groups = response.groups;
    }
  ).go();
}

function updateAccess() {
  JSON.get("/OpenForum/Authorization/AccessAdministration","getPageAccess","pageName="+pageName).onSuccess(
    function(response) {
      convertToAccessView(response.access);
    }
  ).go();
}

function saveChanges() {
  var access = {
    userAccess: {
      read: toAccessList(accessView.readAccess.users),
      call: toAccessList(accessView.callAccess.users),
      update: toAccessList(accessView.updateAccess.users),
      delete: toAccessList(accessView.deleteAccess.users)
    },
    groupAccess: {
      read: toAccessList(accessView.readAccess.groups),
      call: toAccessList(accessView.callAccess.groups),
      update: toAccessList(accessView.updateAccess.groups),
      delete: toAccessList(accessView.deleteAccess.groups)
    }
  };
  
  OpenForum.saveFile( pageName+"/access.json", JSON.stringify( access,null,4) );
}

function toAccessList(list) {
  var newList = {};
  for(var i in list) {
    newList[list[i]]=true;
  }
  return newList;
}

function clearAccessView() {
  accessView = {
    readAccess: {users: [],groups: []},
    callAccess: {users: [],groups: []},
    updateAccess: {users: [],groups: []},
    deleteAccess: {users: [],groups: []}
  };
}

function convertToAccessView(access) {
  var user;
  var group;
  clearAccessView();
  if(access.userAccess) {
    if(access.userAccess.read) {
      for(user in access.userAccess.read) {
        accessView.readAccess.users.push(user);
      }
    }
    if(access.userAccess.call) {
      for(user in access.userAccess.call) {
        accessView.callAccess.users.push(user);
      }
    }
    if(access.userAccess.update) {
      for(user in access.userAccess.update) {
        accessView.updateAccess.users.push(user);
      }
    }
    if(access.userAccess.delete) {
      for(user in access.userAccess.delete) {
        accessView.deleteAccess.users.push(user);
      }
    }
  }

  if(access.groupAccess) {
    if(access.groupAccess.read) {
      for(group in access.groupAccess.read) {
        accessView.readAccess.groups.push(group);
      }
    }
    if(access.groupAccess.call) {
      for(group in access.groupAccess.call) {
        accessView.callAccess.groups.push(group);
      }
    }
    if(access.groupAccess.update) {
      for(group in access.groupAccess.update) {
        accessView.updateAccess.groups.push(group);
      }
    }
    if(access.groupAccess.delete) {
      for(group in access.groupAccess.delete) {
        accessView.deleteAccess.groups.push(group);
      }
    }
  }
}

function removeUser(user,accessType) {
  if(accessType==="read") {
    removeFromSet("accessView.readAccess.users",user);
  } else if(accessType==="call") {
    removeFromSet("accessView.callAccess.users",user);
  } else if(accessType==="update") {
    removeFromSet("accessView.updateAccess.users",user);
  } else if(accessType==="delete") {
    removeFromSet("accessView.deleteAccess.users",user);
  }
}

function removeGroup(group,accessType) {
  if(accessType==="read") {
    removeFromSet("accessView.readAccess.groups",group);
  } else if(accessType==="call") {
    removeFromSet("accessView.callAccess.groups",group);
  } else if(accessType==="update") {
    removeFromSet("accessView.updateAccess.groups",group);
  } else if(accessType==="delete") {
    removeFromSet("accessView.deleteAccess.groups",group);
  }
}

function editUser() {
  editMode = "user";
  editingUser = " ";
  editingGroup = " ";
  OpenForum.showElement("selectUser");
  OpenForum.hideElement("selectGroup");
  OpenForum.showElement("editForm");
}

function editGroup() {
  editMode = "group";
  editingUser = " ";
  editingGroup = " ";
  OpenForum.hideElement("selectUser");
  OpenForum.showElement("selectGroup");
  OpenForum.showElement("editForm");
}

function updateFromForm() {
  if(editMode==="user") {
    if(editingUser!==" ") {
      if(readAccessCheckBox===true) {
        addToSet("accessView.readAccess.users",editingUser);
      } else {
        removeFromSet("accessView.readAccess.users",editingUser);
      }
      if(callAccessCheckBox===true) {
        addToSet("accessView.callAccess.users",editingUser);
      } else {
        removeFromSet("accessView.callAccess.users",editingUser);
      }
      if(updateAccessCheckBox===true) {
        addToSet("accessView.updateAccess.users",editingUser);
      } else {
        removeFromSet("accessView.updateAccess.users",editingUser);
      }
      if(deleteAccessCheckBox===true) {
        addToSet("accessView.deleteAccess.users",editingUser);
      } else {
        removeFromSet("accessView.deleteAccess.users",editingUser);
      }
    }
  } else if(editMode==="group") {
    if(editingGroup!==" ") {
      if(readAccessCheckBox===true) {
        addToSet("accessView.readAccess.groups",editingGroup);
      } else {
        removeFromSet("accessView.readAccess.groups",editingGroup);
      }
      if(callAccessCheckBox===true) {
        addToSet("accessView.callAccess.groups",editingGroup);
      } else {
        removeFromSet("accessView.callAccess.groups",editingGroup);
      }
      if(updateAccessCheckBox===true) {
        addToSet("accessView.updateAccess.groups",editingGroup);
      } else {
        removeFromSet("accessView.updateAccess.groups",editingGroup);
      }
      if(deleteAccessCheckBox===true) {
        addToSet("accessView.deleteAccess.groups",editingGroup);
      } else {
        removeFromSet("accessView.deleteAccess.groups",editingGroup);
      }
    }
  }

  OpenForum.hideElement("editForm");
}

function updateEditingUser(user) {
  readAccessCheckBox = false;
  callAccessCheckBox = false;
  updateAccessCheckBox = false;
  deleteAccessCheckBox = false;
  readAccessCheckBox = setContains("accessView.readAccess.users",user);
  callAccessCheckBox = setContains("accessView.callAccess.users",user);
  updateAccessCheckBox = setContains("accessView.updateAccess.users",user);
  deleteAccessCheckBox = setContains("accessView.deleteAccess.users",user);
}

function updateEditingGroup(group) {
  readAccessCheckBox = false;
  callAccessCheckBox = false;
  updateAccessCheckBox = false;
  deleteAccessCheckBox = false;
  readAccessCheckBox = setContains("accessView.readAccess.groups",group);
  callAccessCheckBox = setContains("accessView.callAccess.groups",group);
  updateAccessCheckBox = setContains("accessView.updateAccess.groups",group);
  deleteAccessCheckBox = setContains("accessView.deleteAccess.groups",group);
}

//TODO move to super set

function addToSet(set,item) {
  set = getSet(set,true);
  if(setContains(set,item)) return;
  set.push(item);
}

function getSet(set,create) {
  if(!set && !create) return;

  if(typeof set === "object") return set;
  if(typeof set === "string") {
    var parts = set.split(".");
    var newSet = eval(parts[0]);
    var el = newSet;
    for(var i =1; i<parts.length; i++) {
      if(!el[parts[i]]) {
        el[parts[i]] = {};
      }
      el = el[parts[i]];
    }
    return el;
  } else {
    return;
  }
}

function removeFromSet(set,item) {
  set = getSet(set,false);
  if(!set) return false;
  for(var key in set) {
    if(key===item) {
      delete set[key];
      return true;
    }
    if(set[key]===item){
      set.splice(key,1);
      return true;
    }
  }
  return false;
}

function setContains(set,item) {
  set = getSet(set,false);
  if(!set) return false;
  for(var key in set) {
    if(key===item) return true;
    if(set[key]===item) return true;
  }
  return false;
}
