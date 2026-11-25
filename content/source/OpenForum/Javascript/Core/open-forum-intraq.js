/*
* Author: 
* Description: 
*/
if(typeof OpenForum == "undefined") {
  OpenForum = {};
}

OpenForum.IntraQ = function( queueName, types ) {
  var self = this;
  var tabId = "Tab:" + new Date().getTime() + ":" + Math.random();
  var lastChecked = 0;
  var listeners = [];
  if( typeof types == "undefined" ) {
    types = [];
  }

  self.registerAsType = function( type ) {
    types.push( type );
  };

  self.addListener = function(listener) {
    listeners.push( listener );
  };

  var checkForMessages = function() {
    var queue = JSON.parse( OpenForum.Storage.get("IntraQ."+queueName) );
    var now = new Date().getTime();
    var newQ = [];
    for(var i in queue) {
      var packet = queue[i];
      if(packet.ts>lastChecked && packet.id != tabId) {
        var typeMatch = false;
        if(packet.data.types) {
          for(var t in types) {
            packet.data.types.includes( types[t] );
            typeMatch = true;
            break;
          }
        } else {
          typeMatch = true;
        }
        if( typeMatch == true ) {
          for(var l in listeners) {
            listeners[l](packet.data);
          }
        }
      }
      if(now-packet.ts<5000) { //Messages that are older than 5 seconds are not included
        newQ.push(packet);
      }
    }
    lastChecked = now;

    var owner = JSON.parse( OpenForum.Storage.get("IntraQ."+queueName+".owner") );
    if(owner==null) {
      owner = {id: tabId, ts: now};
    }
    if(owner.id == tabId) {
      owner.ts = now;
      OpenForum.Storage.set("IntraQ."+queueName+".owner", JSON.stringify(owner) );
      OpenForum.Storage.set("IntraQ."+queueName, JSON.stringify(newQ) ); //Retire messages that are not new
    } else if(now-owner.ts>5000) {
      owner.id = tabId; // Take ownership if queue owner has gone
      owner.ts = now;
      OpenForum.Storage.set("IntraQ."+queueName+".owner", JSON.stringify(owner) );
    }
    setTimeout( checkForMessages, 500 );
  };

  self.getTabId = function() {
    return tabId;
  };

  self.send = function( data ) {
    var queue = JSON.parse( OpenForum.Storage.get("IntraQ."+queueName) );
    if(queue==null) queue = [];
    queue.push( {data: data, ts: new Date().getTime(), id: tabId} );
    OpenForum.Storage.set("IntraQ."+queueName, JSON.stringify(queue));
  };

  self.send( { action: "joined", tabId: tabId, types: types } );

  checkForMessages();
};

OpenForum.InQ = function() {
  var self = this;
  var inq = new OpenForum.IntraQ( "inq" );

  //TODO Needs to handle lots of different objects and values
  //Only ignore those that have just been set to stop a loop back condition
  var ignore = null;
  var listeners = [];

  inq.addListener( function( data) {
    if(data.action && data.action=="run") {
      OpenForum.evaluate( data.script );
    } else if(data.action && data.action=="set") {
      ignore = data.name;
      OpenForum.evaluate( data.name + " = " + JSON.stringify( data.value ) );
    } else if(data.action && data.action=="message") {
      inq.notifyListeners( data.message );
    }
  });

  inq.notifyListeners = function(message) {
    for( var l in listeners ) {
      var listener = listeners[l];
      if( listener.type == "*" || listener.type == message.type ) {
        listener.fn( message );
      }
    }
  };
  
  self.addMessageListener = function( listener, type ) {
    listeners.push( {fn: listener, type: type} );
  };
  
  self.send = function(message) {
    inq.send( { action: "message",tabId: inq.getTabId(),"message": message } );
  };
  
  self.run = function( script ) {
    inq.send( { action: "run",tabId: inq.getTabId(),"script": script } );
  };

  self.share = function( name) {
    OpenForum.getObject( name ).addListener(
      function( obj ) {
        if( ignore != obj.getId() ) {
          inq.send( { action: "set",tabId: inq.getTabId(),"name": obj.getId(), "value": obj.getValue() } );
        } else {
          ignore = null;
        }
      }
    );
  };
};

OpenForum.addInitialiser( function() {
  //inq default. Add ?inq=false to stop
  if( OpenForum.getParameter("inq")=="false" == false ) {

    OpenForum.inq = new OpenForum.InQ();
  }
});


