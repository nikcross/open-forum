//---- OpenForumObject ----

function OpenForumObject(objectId) {
  var self = this;
  var id = objectId;
  var value = null;
  var targets=[];
  var listeners=[];

  OpenForum.debug("INFO","Object " + id + " created");
  
  var notifyListeners = function() {
    for(var listenerIndex in listeners) {
      var listener = listeners[listenerIndex];
      listener( self );
      
      if(listener.getId) {
        OpenForum.debug("INFO","Object " + id + " has notified " + listener.getId() + "of change");
      }
    }
  };
  
  self.getId = function() {
    return id;
  };

  self.add = function(target) {
    targets.push(target);
    
    if(target.getId) {
      OpenForum.debug("INFO","Object " + id + " has added new target " + target.getId());
    } else {
      OpenForum.debug("INFO","Object " + id + " has added new target " + target);
    }
  };

  self.reset = function() {
    value = null;
  };
  
  self.setValue = function(newValue,exclude) {
    if(newValue===value) {
      return;
    }
    
    OpenForum.debug("INFO","Object " + id + " value set to " + newValue);
    
    value = newValue;
    for(var targetIndex in targets) {
      var target = targets[targetIndex];
      if(target===null) {
        continue;
      }
      if(exclude && exclude===target) {
        continue;
      }
      if(typeof(target.type)!="undefined" && target.type=="checkbox") {
        target.checked = value;
      } else if(typeof(target.value)!="undefined") {
        target.value = value;
      } else if(target.innerHTML) {
        if(value==="") {
          target.innerHTML = " "; 
        } else {
          target.innerHTML = ""+value;
        }
      }
    }
  };

  self.getValue = function() {
    return value;
  };

  self.scan = function() {
    for(var targetIndex in targets) {
      try {
        var target = targets[targetIndex];
        if(target===null) {
          continue;
        }

        if(typeof(target.type)!="undefined" && target.type=="checkbox") {
          if(target.checked!==value) {

            self.setValue(target.checked,target);
            OpenForum.setGlobal(id,target.checked);
			OpenForum.debug("INFO","Object (checkbox) " + id + " value set to " + value);
            notifyListeners();
            return;
          }
        } else if(typeof(target.value)!="undefined") {
          if(target.value!=value) {
            self.setValue(target.value,target);
            OpenForum.setGlobal(id,value);
			OpenForum.debug("INFO","Object " + id + " value set to " + value);
            notifyListeners();
            return;
          }
        }
      } catch(e) {
        OpenForum.debug("ERROR","Object " + id + " error in setting value (case 1).", e);
      }
    }
    try{
      var testId = id;
      if( OpenForum.globalExists(testId) ) {
        if( value!=OpenForum.getGlobal(testId)) {
          self.setValue(OpenForum.getGlobal(testId));
          notifyListeners();
        }
      } else {
        OpenForum.setGlobal(testId,value,true);
		OpenForum.debug("INFO","Global object created " + testId + " and value set to " + value);
      }
    } catch(e) {
        OpenForum.debug("ERROR","Object " + id + " error in setting value (case 2).", e);
    }

  };

  self.addListener = function(listener) {
    listeners.push(listener);
    if(listener.getId) {
      OpenForum.debug("INFO","Object " + id + " has added new listener " + listener.getId());
    } else {
      OpenForum.debug("INFO","Object " + id + " has added new listener " + listener);
    }
  };

  self.getId = function() {
    return id;
  };

  self.getTargets = function() {
    return targets;
  };
}
