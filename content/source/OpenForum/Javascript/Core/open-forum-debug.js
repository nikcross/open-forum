/*
* Author: 
* Description: 
*/
OpenForum.debugON = false;

OpenForum.setDebugToConsole = function(state) {
  if( state === true ) {
    OpenForum.debug = function(type,message,exception) {
      if(!message) {
        message = type;
        type = "INFO";
      }
      console.log( new Date().toLocaleTimeString() + " " + type + " " + message );
      if(exception) {
        if(exception.stack) {
          console.log("Stack trace: " + exception.stack);
        } else {
          console.log("Exception: " + exception);
        }
      }
    };
    OpenForum.stop = function() { debugger; };
    OpenForum.debug("INFO","OpenForum Console Debugging now on.");
  } else {
    OpenForum.debug("INFO","OpenForum Console Debugging now off.");
    OpenForum.debug = function(type,message,exception) {};
    OpenForum.stop = function(){};
  }
  OpenForum.debugON = state;
};

OpenForum.stop = function(){};
OpenForum.debug = function(type,message,exception) {};


if( OpenForum.getParameter("debug")=="true" ) {
  OpenForum.setDebugToConsole(true);
}
