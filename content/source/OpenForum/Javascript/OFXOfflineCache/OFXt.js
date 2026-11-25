/*
* Author: 
* Description: 
*/
/*
* Author: Nik Cross
* Description: A replacement for OpenForum JSON.get and JSON.post
*/
var OFXt = {
  fromJson: function( json ) {
    if(json.method == "get" ) {
      return OFXt.get( json.url ).withAction( json.action ).withData( json.data );
    } else if(json.method == "post" ) {
      return OFXt.post( json.url ).withAction( json.action ).withData( json.data );
    }
  },

  clearOfflineCache: function() {
    OpenForum.Storage.set("OFX.cache","[]");
    console.log("OFX cache cleared.");
  },

  sendOfflineCache: function( callback, callbackError ) {
    if(navigator.onLine===false) {
      return;
    }

    var cache = OFXt.getOfflineCache();
    if(cache.length==0) {
      return;
    }
    var request = cache.shift();
    OpenForum.Storage.set("OFX.cache",JSON.stringify(cache));
    OFXt.fromJson( request ).onSuccess( callback ).onError( callbackError ).go(true);

    if(cache.length!=0) {
      setTimeout( function() { OFXt.sendOfflineCache(callback,callbackError); }, 1000 );
    }
  },

  getOfflineCache: function() {
    var cache = OpenForum.Storage.get("OFX.cache");
    if(cache==null) {
      cache = [];
    } else {
      try{
        cache = JSON.parse(cache);
      } catch(e) {
        console.log("OFX cache error "+e+". Replacing cache.");
        cache = [];
      }
    }
    return cache;
  },

  appendToOfflineCache: function(request) {
    var cache = OFXt.getOfflineCache();
    cache.push( request.toJson() );
    OpenForum.Storage.set("OFX.cache",JSON.stringify(cache));
  },

  get: function(url) {
    var GET = function(url) {
      var self = this;
      var action;
      var data;
      var callBack;
      var callOnError;

      self.withAction = function(newAction) {
        action = newAction;
        return self;
      };

      self.withData = function(newData) {
        data = newData;
        return self;
      };

      self.onSuccess = function(newCallBack) {
        callBack = newCallBack;
        return self;
      };

      self.onError = function(newCallOnError) {
        callOnError = newCallOnError;
        return self;
      };

      self.toJson = function() {
        return {
          url: url,
          method: "get",
          action: action,
          data: data,
          requestedTime: new Date().getTime()
        };
      };

      self.go = function( withOfflineCache ) {

        if(navigator.onLine===false && withOfflineCache) {
          OFXt.appendToOfflineCache( self );
          return true;
        }

        if(action) {
          if(data) {
            if(typeof data == "object") {
              var dataString = "";
              for(var name in data) {
                if(dataString.length>0) dataString += "&";
                dataString += name + "="+ data[name];
              }
              data = dataString;
            }
          }
          var get = JSON.get(url,action,data);
          if(callBack) {
            get = get.onSuccess( callBack );
          }
          if(callOnError) {
            get = get.onError(callOnError);
          }
          get.go();
        } else {
          OpenForum.loadFile(url,callBack);
        }
      };
    };
    return new GET(url);
  },

  post: function(url) {
    var POST = function(url) {
      var self = this;
      var action;
      var data;
      var callBack;
      var callOnError;

      self.withAction = function(newAction) {
        action = newAction;
        return self;
      };

      self.withData = function(newData) {
        data = newData;
        return self;
      };

      self.onSuccess = function(newCallBack) {
        callBack = newCallBack;
        return self;
      };

      self.onError = function(newCallOnError) {
        callOnError = newCallOnError;
        return self;
      };

      self.toJson = function() {
        return {
          url: url,
          method: "post",
          action: action,
          data: data,
          requestedTime: new Date().getTime()
        };
      };

      self.go = function( withOfflineCache ) {

        if(navigator.onLine===false && withOfflineCache) {
          OFXt.appendToOfflineCache( self );
          return true;
        }

        if(action) {
          if(data) {
            if(typeof data == "object") {
              var dataString = "";
              for(var name in data) {
                if(dataString.length>0) dataString += "&";
                dataString += name + "="+ data[name];
              }
              data = dataString;
            }
          }
          var post = JSON.post(url,action,data);
          if(callBack) {
            post = post.onSuccess( callBack );
          }
          if(callOnError) {
            post = post.onError(callOnError);
          }
          post.go();
        } else {
          OpenForum.saveFile(url,data);
        }
      };
    };
    return new POST(url);
  }
};

console.log(
	"cache length " + OFXt.getOfflineCache().length
  );

OFXt.sendOfflineCache( function(response) { console.log(time); } );

OFXt.get("/OpenForum/Actions/SystemTime").withAction("getTime").go(true);
