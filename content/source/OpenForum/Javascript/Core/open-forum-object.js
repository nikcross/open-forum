//---- OpenForumObject ----

function OpenForumObject(objectId) {
  var id = objectId;
  var value = "";
  this.targets=[];
  this.listeners=[];

  this.getId = function() {
    return id;
  };

  this.add = function(target) {
    this.targets[this.targets.length]=target;
  };

  this.setValue = function(newValue,exclude) {
    if(newValue===value) {
      return;
    }
    value = newValue;
    for(var targetIndex in this.targets) {
      var target = this.targets[targetIndex];
      if(target==null) {
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

  this.getValue = function() {
    return value;
  };

  this.scan = function() {
    for(var targetIndex in this.targets) {
      try {
        var target = this.targets[targetIndex];
        if(target===null) {
          continue;
        }

        if(typeof(target.type)!="undefined" && target.type=="checkbox") {
          if(target.checked!==value) {

            this.setValue(target.checked,target);
            eval(this.getId()+"=value;");
            this.notifyListeners();
            return;
          }
        } else if(typeof(target.value)!="undefined") {
          if(target.value!=value) {
            this.setValue(target.value,target);
            eval(this.getId()+"=value;");
            this.notifyListeners();
            return;
          }
        }
      } catch(e) {
        //Maybe needs debug mode
      }
    }
    try{
      var testId = this.getId();
      if( eval("typeof("+testId+")")!="undefined") {
        if( value!=eval(testId)) {
          this.setValue(eval(testId));
          this.notifyListeners();
        }
      } else {
        eval(testId+"=value;");
      }
    } catch(e) {
      //Maybe needs debug mode
    }

  };

  this.addListener = function(listener) {
    this.listeners.push(listener);
  };

  this.notifyListeners = function() {
    for(var listenerIndex in this.listeners) {
      listener = this.listeners[listenerIndex];
      listener( this );
    }
  };

  this.getId = function() {
    return id;
  };

  this.getTargets = function() {
    return this.targets;
  };
}	

onload = function() {
  OpenForum.onload();
};

onunload = function() {
  OpenForum.onunload();
};
