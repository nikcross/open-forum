users = [];
OpenForum.init = function() {
  JSON.get("/OpenForum/SystemMonitor/SessionStoreMonitor","getUsersOnline").onSuccess( function(response) {users = response.usersOnline;} ).go();
};