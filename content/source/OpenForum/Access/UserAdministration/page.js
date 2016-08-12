/*
* Author: 
*/
var users = [];
var groups = [];

OpenForum.init = function() {
  updateUsers();
  updateGroups();
};

function updateUsers() {
  JSON.get("/OpenForum/Access/UserAdministration","getAllUsers").onSuccess(
    function(response) {
      users = response.users;
    }
  ).go();
}

function updateGroups() {
  JSON.get("/OpenForum/Access/UserAdministration","getAllGroups").onSuccess(
    function(response) {
      groups = response.groups;
    }
  ).go();
}

function createNewGroup() {
    JSON.get("/OpenForum/Actions/Copy","none","returnType=json&pageName=/OpenForum/Access/UserAdministration/GroupTemplate&newPageName=/OpenForum/Groups/"+newGroupName).onSuccess(
    function(response) {
      updateUsers();
    }
  ).go();
}

function createNewUser() {
    JSON.get("/OpenForum/Actions/Copy","none","returnType=json&pageName=/OpenForum/Access/UserAdministration/UserTemplate&newPageName=/OpenForum/Users/"+newUserName).onSuccess(
    function(response) {
      updateUsers();
    }
  ).go();
}