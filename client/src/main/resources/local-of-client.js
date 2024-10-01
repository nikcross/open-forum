/**
 Local OpenForum Client
 */

var LocalOpenForumClient = function() {
  var self = this;

  var VERSION = "1.0 Alpha build 032";
  var user;
  var signedIn = false;
  var host = "https://open-forum.onestonesoup.org";
  var serviceRoot = "/OpenForum/AddOn/Desktop";
  var folder = "/OpenForum/AddOn/Desktop/Drive";

  var client;
  var hostName;
  var hostRegistration;
  var queue;
  var messageQueue;

  var initialiseList = [];
  var extraCommands = {};
  var running;

  var debugLines = [];
  var debug = {
    on: true,
    println: function(message) {
      if(self.debug.on) {
        postTo(debugLines,new Date().toTimeString() + " " + message,10);
        out.println(new Date().toTimeString() + " " + message);
      }
    }
  };

  var errorLines = [];
  var error = {
    println: function(message) {
      postTo(errorLines,new Date().toTimeString() + " Error: " + message,10);
      out.println(new Date().toTimeString() + " Error: " + message);
      //Tray.showTrayIconErrorMessage("Open Forum","Error","Details:"+message);
    }
  };

  var postTo = function(array,message,maxLength) {
    array.push(message);
    while(array.length>maxLength) {
      array.shift();
    }
  };

  var mountJars = function() {
    js.mountJar(
      "OpenForumClientHelper",
      "./lib/client-0.0.3-jar-with-dependencies.jar",
      "org.onestonesoup.client.OpenForumClientHelper"
    );
  };

  var mountJavascript = function() {
    var root = new java.io.File("jsLib");
    if(root.exists()===false) {
      root.mkdirs();
    }
    var libraries = root.listFiles();
    for(var f=0;f<libraries.length;f++) {
      var library = libraries[f];
      if(library.getName().indexOf(".js")!==-1) {
        js.runScript( library.getAbsolutePath() );
        debug.println("Loaded js library " + library.getAbsolutePath() );
      }
    }
  };

  var addInitialiser = function(object) {
    initialiseList.push(object);
  };

  //Functions
  var getJSON = function(pageName,action,parameters) {
    var uri = pageName+"?action="+action;
    if(parameters) {
      uri += "&"+parameters;
    }
    debug.println("URI" + uri);
    return JSON.parse( "" + client.doGet( uri ) );
  };

  var saveFile = function(fileName,data) {
    var file = new java.io.File(fileName);
    FileHelper.saveStringToFile(data,file);

    debug.println( "Saved data to " + file.getAbsolutePath() );
  };

  var getUserDetails = function(force) {
    if(!user || force) {
      var newUser = Popup.requestInput("Enter your OpenForum user name");
      if(newUser==null) {
        if(!user) {
          Popup.alert("No user name has been supplied.\n The OpenForum client will now stop.");
          js.exit();
        }
      } else {
        user = "" + newUser;
      }
    }

    var password = Popup.requestInput("Enter your OpenForum password for user " + user);
    if(password==null) {
      Popup.alert("No password has been supplied.\n The OpenForum client will now stop.");
      js.exit();
    }

    var save = Popup.confirm("Would you like to save your user name and password");
    if(save==true) {
      var script = "LocalOpenForumClient.signIn('"+user+"','"+password+"',false);";
      saveFile("jsLib/user-details.js",script);
    }
  };

  // Sign In

  var signIn = function(newUser,password,force) {
    user = newUser;
    if(!user || !password || force) {
      getUserDetails(force);
    }

    client = OpenForumClientHelper.getClient(
      host,
      user,
      password
    );

    hostName = java.net.InetAddress.getLocalHost().getHostName();
    hostRegistration = getJSON(serviceRoot,"registerHost","hostName="+hostName);
    queue = hostRegistration.queue;

    debug.println("Host Name:" + hostName);
    debug.println("Registration:" + JSON.stringify(hostRegistration));
    debug.println("Queue:" + queue);

    messageQueue = OpenForumClientHelper.getMessageQueueClient(
      host,
      user,
      password,
      queue
    );

    signedIn=true;
  };

  var initAppTray = function() {
    if(typeof(trayReady)==="undefined" && typeof Tray!="undefined") {
      Tray.addTrayIcon("Open Forum",host+"/OpenForum/Images/open-forum-small.png");
      Tray.addActionToTrayIcon("Open Forum","Send Message","LocalOpenForumClient.sendMessage();");
      Tray.addActionToTrayIcon("Open Forum","User Details","LocalOpenForumClient.showUserDetails();");
      Tray.addActionToTrayIcon("Open Forum","System Details","LocalOpenForumClient.showSystemDetails();");
      Tray.addActionToTrayIcon("Open Forum","Toggle Debug","LocalOpenForumClient.toggleDebug();");
      Tray.addActionToTrayIcon("Open Forum","Exit","js.exit();");
      trayReady = true;
    }
  };

  var initExtraComands = function() {
    for(var command in extraCommands) {
      var script = "if(" + command + ".init) " + command + "init();";
      try {
        eval( script );
      } catch(e) {
        debug.println("Failed to init " + command + " Error:"+e);
      }
    }
  };

  var showUserDetails = function() {
    Popup.alert("User: " + user + "\nHost Name: " + hostName);
  };

  var showSystemDetails = function() {

    var systemDetails = "System Details\nVersion: " + VERSION + "\n";

    systemDetails += "Installed command sets:\n";
    for(var command in extraCommands) systemDetails += "* " + command + "\n";

    systemDetails += "\n\nConsole Debug On: " + debug.on + "\n";

    for(var i in debugLines) {
      systemDetails += debugLines[i] + "\n";
    }

    for(var i in errorLines) {
      systemDetails += errorLines[i] + "\n";
    }

    Popup.alert(systemDetails);
  };

  var showMessage = function(title,message) {
    debug.println("showMessage " + title + ". " + message);
    Tray.showTrayIconInfoMessage("Open Forum",title,message);
  };

  //Message Queue
  var processMessage = function(from,message) {
    debug.println("FROM:"+from+" MESSAGE:"+message);
    if(from===user) return;

    if(message.indexOf(":")!==-1) {
      var command = message.substring(0,message.indexOf(":"));
      var id;
      if(command.indexOf(".")!==-1) {
        id = command.substring(command.indexOf(".")+1);
        command = command.substring(0,command.indexOf("."));
      }
      var rawParameters = message.substring(message.indexOf(":")+1);
      var parameters = rawParameters.split(",");
      //Command
      if(command==="cd") {
        folder = parameters[0];
      } else if(command==="importScript") {
        importScript(parameters,id);
      } else if(command==="getExtraCommands") {
        var resultData = JSON.stringify(extraCommands);
        messageQueue.postMessage(":resp."+id+":"+resultData);
      } else if(command==="runScript") {
        runScript(parameters,id);
      } else if(command==="run") {
        run(rawParameters,id);
      } else if(command==="updateClient") {
        updateClient();
      } else if(command==="signIn") {
        var force = true;
        signIn("","",force);
      } else if(command==="exit") {
        js.exit();
      } else if(command==="ping") {
        messageQueue.postMessage(":resp."+id+":\"pong\"");
      } else if(command==="test") {
        if(!id) id = "(no id)";
        showMessage("Test","Test Message " + id);
      } else {
        if( runCommand(command,parameters,rawParameters,id) === false) {
          debug.println("Command " + command + " not recognised.");
        }
      }
    } else {
      //Message
      showMessage("Message from " + from,message);
    }
  };

  var registerCommand = function(command,fn) {
    extraCommands[command] = {command: command, fn: fn};
    return "Command " + command + " registered.";
  };

  var runCommand = function(command,parameters,rawParameters,id) {
    for(var commandName in extraCommands) {
      if(commandName===command) {
        var result = extraCommands[commandName].fn( parameters,rawParameters,id );
        if(result.ok===true) {
          var resultData = JSON.stringify(result.data);
          messageQueue.postMessage(":resp."+id+":"+resultData);
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  };

  var importScript = function(parameters,id) {
    var script = ""+client.getFile(parameters[0],parameters[1]);
    var result;
    try{
      result = js.run(script);
    } catch(e) {
      result = e;
    }
    saveFile("jsLib/"+parameters[1],script);

    if(id) {
      result = JSON.stringify(""+result);
      debug.println(result);
      messageQueue.postMessage(":resp."+id+":"+result);
    }
  };

  var runScript = function(parameters,id) {
    debug.println("Running script from file " + parameters[0] + "/" + parameters[1]);
    var script = ""+client.getFile(parameters[0],parameters[1]);
    var result = "not run";
    try{
      result = js.run(script);
    } catch(e) {
      result = e;
    }
    if(id) {
      result = JSON.stringify(""+result);
      debug.println(result);
      messageQueue.postMessage(":resp."+id+":"+result);
    }
  };

  var run = function(rawParameters,id) {
    debug.println("Running script " + rawParameters);
    var result = "not run";
    try{
      result = js.run(rawParameters);
    } catch(e) {
      result = e;
    }
    if(id) {
      messageQueue.postMessage(":resp."+id+":"+JSON.stringify(""+result));
    }
  };

  var sendMessage = function() {
    var message = Popup.requestInput("Message");
    if(message!==null) {
      messageQueue.postMessage(message);
    }
  };

  //File sync
  var getJSON = function(pageName,action,parameters) {
    var uri = pageName+"?action="+action;
    if(parameters) {
      uri += "&"+parameters;
    }
    return JSON.parse( "" + client.doGet( uri ) );
  };

  var updateClient = function() {

    var remoteFile = getInformationForFile(serviceRoot,"local-of-client.js");
    var file = new java.io.File("local-of-client.js");
    if(remoteFile.lastModified-file.lastModified()>1000) {
      var backupFile = new java.io.File("local-of-client.js.backup");
      FileHelper.copyFileToFile( file,backupFile );
      client.downloadFile(serviceRoot,"local-of-client.js","local-of-client.js");

      showMessage("Client Update","A new version of the client is ready. Restart now.");
      remoteFile = getInformationForFile(serviceRoot,"local-of-client.js");
      file.setLastModified( remoteFile.lastModified );

      //TODO stop file updater and any other asyn processes first
      js.runScript("local-of-client.js");
    }
  };

  var updateFolder = function(folder,changesSince) {

    var newLocalFiles = [];
    var directory = new java.io.File( "." + folder );
    if(directory.exists()===false) {
      debug.println("Created directory "+directory.getAbsolutePath());
      directory.mkdirs();
    } else {
      var files = directory.listFiles();
      for(var f=0;f<files.length;f++) {
        var fileName = ""+files[f].getName();
        newLocalFiles[fileName] = true;
      }
    }

    var now = new Date();
    var updates = getJSON( "/OpenForum/Editor","getUpdates","pageName=" +folder+ "&lastCheckTime=0" );
    //debug.println( JSON.stringify( updates,null,4 ) );
    for(var i in updates.changedFiles) {
      var file = updates.changedFiles[i];

      var localFileName = "." + folder + "/" + file.fileName;
      var localFile = new java.io.File(localFileName);

      if(newLocalFiles[file.fileName]) {
        newLocalFiles[file.fileName]=false;
      }

      if(localFile.exists()===false || file.lastModified-localFile.lastModified()>1000) {
        client.downloadFile(file.pageName,file.fileName,localFileName);
        localFile.setLastModified( file.lastModified );
        debug.println("Downloaded file: " + localFile.getAbsolutePath());
      } else if(localFile.exists()===true && file.lastModified-localFile.lastModified()<-1000) {
        client.uploadFile(file.pageName,file.fileName,localFileName);
        file = getInformationForFile(file.pageName,file.fileName);
        localFile.setLastModified( file.lastModified );
        debug.println("Uploaded file: " + localFile.getAbsolutePath());
      }
    }

    for(var newFile in newLocalFiles) {
      if(newLocalFiles[newFile]===false) continue;
      var localFileName = "." + folder + "/" + file.fileName;
      client.uploadFile(folder,newFile,localFileName);
      file = getInformationForFile(folder,newFile);
      localFile.setLastModified( file.lastModified );
    }

    return updates.time;
  };

  function getInformationForFile(folder,fileName) {
    //TODO Could do with better end point for just one file information
    var updates = getJSON( "/OpenForum/Editor","getUpdates","pageName=" +folder+ "&lastCheckTime=0" );
    for(var i in updates.changedFiles) {
      if(updates.changedFiles[i].fileName===fileName) return updates.changedFiles[i];
    }
  }

  var clientUpdater = function() {
    var lastChecked = 0;
    running = true;
    while(running) {
      try{
        var startTime = new Date();

        debug.println( "Checking for client updates at " + startTime.toLocaleTimeString() );
        updateClient();
      } catch(e) {
        debug.println(e);
        Tray.showTrayIconErrorMessage("Open Forum","Error","Details:"+e);
      }
      js.sleep(30000);
    }

    debug.println( "file updater stopped" );
  };

  var toggleDebug = function() {
    debug.on = !debug.on;
    Popup.alert("Debug On: "+debug.on);
  };

  self.getClient = function() {
    return client;
  };

  self.init = function() {
    //Make functions visible
    LocalOpenForumClient.processMessage = processMessage;
    LocalOpenForumClient.registerCommand = registerCommand;
    LocalOpenForumClient.addInitialiser = addInitialiser;
    LocalOpenForumClient.debug = debug;
    LocalOpenForumClient.error = error;
    LocalOpenForumClient.clientUpdater = clientUpdater;
    LocalOpenForumClient.signIn = signIn;
    LocalOpenForumClient.sendMessage = sendMessage;
    LocalOpenForumClient.toggleDebug = toggleDebug;
    LocalOpenForumClient.showUserDetails = showUserDetails;
    LocalOpenForumClient.showSystemDetails = showSystemDetails;
    LocalOpenForumClient.getJSON = getJSON;

    mountJars();
    mountJavascript();

    for(var i in initialiseList) {
      try
      {
        initialiseList[ i ].init();
      } catch(e) {
        debug.println( e );
      }
    }

    initAppTray();

    if(signedIn===false) {
      signIn();
    }

    // Start up 
    initExtraComands();
    js.runAsync("LocalOpenForumClient.clientUpdater();");
    if(typeof Tray != "undefined") {
      Tray.showTrayIconInfoMessage("Open Forum", "Client Version " + VERSION, "Client is ready");
    } else {
      out.println( "Open Forum (Client Version " + VERSION + ") Client is ready" );
    }

    var listener = OpenForumClientHelper.getJavascriptListener(js,"LocalOpenForumClient.processMessage");
    messageQueue.addListener( listener );

    messageQueue.postMessage("announce:clientStarted");
    messageQueue.start();

    delete self.init;
  };
};
LocalOpenForumClient = new LocalOpenForumClient();
LocalOpenForumClient.init();

