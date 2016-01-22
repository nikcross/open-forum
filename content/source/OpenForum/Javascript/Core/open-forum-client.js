if(!OpenForum) {
  OpenForum = {};
}

OpenForum.clients = [];

OpenForum.Client = function(id) {
  var identifier = id;
  
  this.sendCommand = function(command) {
    command = command.replace(/\"/g,"'");
    command = "action: "+command;
  };
  
  
};

OpenForum.addClient = function(identifier) {
  var newClient = new OpenForum.Client(identifier);
  
  OpenForum.clients.push(newClient);
  
  return newClient;
};