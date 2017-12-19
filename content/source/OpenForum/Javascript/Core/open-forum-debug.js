/*
* Author: 
* Description: 
*/

OpenForum.setDebugToConsole = function(state) {
  if( state === true ) {
    OpenForum.debug = function(type,message,exception) {
      console.log( new Date().toLocaleTimeString() + " " + type + " " + message );
      if(exception) {
        if(exception.stack) {
          console.log("Stack trace: " + exception.stack);
        } else {
          console.log("Exception: " + exception);
        }
      }
    };
  } else {
    OpenForum.debug = function(type,message,exception) {};
  }
};

OpenForum.debug = function(type,message,exception) {};