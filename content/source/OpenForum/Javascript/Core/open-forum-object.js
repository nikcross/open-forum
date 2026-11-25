//---- OpenForumObject ----

function OpenForumObject(objectId) {
  var self = this;
  var id = objectId;
  var value = null;
  var targets=[];
  var listeners=[];
  var quiet = false;

  OpenForum.debug("INFO","Object " + id + " created");

  var notifyListeners = function() {
    if(quiet) {
      OpenForum.debug("INFO","Object " + id + " has changed but is quiet");
      return;
    }
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
    if(value != null) { // If you want to join, you have to take on the value
      var hold = value;
      value = null; // Force the value to be set in all targets as will be seen as a change
      self.setValueQuietly(hold); // Not a real change of value, so quietly does it
    }


    if(target.getId) {
      OpenForum.debug("INFO","Object " + id + " has added new target " + target.getId());
    } else {
      OpenForum.debug("INFO","Object " + id + " has added new target " + target);
    }
  };

  self.reset = function() {
    value = null;
  };

  self.setValueQuietly = function (newValue,exclude,clone) {
    quiet = true;
    self.setValue(newValue,exclude,clone);
    quiet = false;
  };

  self.setValue = function(newValue,exclude,clone) {
    if(OpenForum.isEqual(newValue,value)) {
      return;
    }

    OpenForum.debug("INFO","Object " + id + " value set to " + newValue);

    if(clone && typeof newValue == "object") {
      value = OpenForum.clone(newValue);
    } else {
      value = newValue;
    }
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
      } else if(typeof(target.type)!="undefined" && target.type=="select-multiple") {
        for(var i in target.options) {
          target.options[i].selected=false;
          for(var j in value) {
            if(target.options[i].value==value[j]) {
              target.options[i].selected=true;
            }
          }
        }
        OpenForum.setGlobal(id,value);
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
    for(var targetIndex=0; targetIndex<targets.length; targetIndex++) {
      try {
        var target = targets[targetIndex];
        if(target===null) {
          continue;
        }

        if(typeof(target.type)!="undefined" && target.type=="checkbox") {

          if(target.checked!==value) {
            //If UI has been checked
            self.setValue(target.checked,target,true);
            OpenForum.setGlobal(id,target.checked);
            OpenForum.debug("INFO","Object (checkbox) " + id + " value set to " + value);
            notifyListeners();
            return;
          }
        } else if(target.type=="select-multiple") {
          var selected = [];
          for(var i in target.options) {
            if(target.options[i].selected) selected.push(target.options[i].value);
          }
          //If UI selection changes
          if(OpenForum.isEqual(value,selected)==false) {
            self.setValue(selected,target,true);

            OpenForum.setGlobal(id,selected);
            OpenForum.debug("INFO","Object (select-multiple) " + id + " value set to " + selected);
            notifyListeners();
            return;
          }
        } else if(typeof(target.value)!="undefined") {
          //If UI value changes
          if(target.value!=value) {
            self.setValue(target.value,target,true);
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
        //If bound js variable changes
        if( OpenForum.isEqual(value,OpenForum.getGlobal(testId))===false) {
          self.setValue(OpenForum.getGlobal(testId),null,true);
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

  self.removeListener = function(listener) {
    for(var listenerIndex in listeners) {
      if(listeners[listenerIndex].getId && listener.getId && listeners[listenerIndex].getId() == listener.getId() ) {
        listeners.splice(listenerIndex,1);
        break;
      } else if (listeners[listenerIndex] == listener) {
        listeners.splice(listenerIndex,1);
        break;
      } 
    }
    if(listener.getId) {
      OpenForum.debug("INFO","Object " + id + " has added removed a listener " + listener.getId());
    } else {
      OpenForum.debug("INFO","Object " + id + " has added removed a listener " + listener);
    }
  };

  self.getId = function() {
    return id;
  };

  self.getTargets = function() {
    return targets;
  };
}
