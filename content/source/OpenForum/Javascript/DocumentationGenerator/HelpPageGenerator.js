var HelpPageGenerator = function(objectName,object) {
  var self = this;

  self.setObjectName = function(newObjectName) {
    objectName = newObjectName;
    return this;
  };
  
  self.setObject = function(newObject) {
    object = newObject;
    return this;
  };
  
  self.generateHelpPage = function() {
    var helpText = generateHelp(objectName);

    while( helpText.indexOf("\n\n")!=-1 ) {
      helpText = helpText.replace(/\n\n/g,"\n");
    }
    helpText = helpText.replace(/\n/g,"<br/>\n");
    helpText = helpText.replace(/function/g,"<br/>* function");

    return helpText;
  };

  self.generateHelpScript = function() {
    var target = object;
    if(typeof(target)=="undefined") {
    	target = eval(objectName);
    }

    var helpScript = "/* Help script for "+objectName+"*/\n\n";

    for(var i in target) {
      if(typeof(target[i])==="function") {
        helpScript += "// "+objectName+"."+i+".notes=\"\";\n";
        if( target[i].length>0 ) {
          helpScript += objectName+"."+i+".args=\"\";\n";
        }
        helpScript += "// "+objectName+"."+i+".returns=\"\";\n";
        helpScript += "// "+objectName+"."+i+".url=\"\";\n";
      }
    }
    return helpScript;
  };

  var generateHelp = function() {
    var target = object;
    if(typeof(target)=="undefined") {
    	target = eval(objectName);
    }

    var helpText = objectName + "\n\n";

    for(var i in target) {
      if(typeof(target[i])!=="undefined" && target[i]!==null && typeof(target[i].exclude)!=="undefined") continue;
      
      if(typeof(target[i])==="function") {
        var args = "";
        if(target[i].args) {
          args = target[i].args;
        } else {
          for(var j = 0; j < target[i].length; j++) {
            if(args.length > 0) args += ",";
            args += "arg" + j;
          }
        }

        var notes = "";
        if(target[i].notes) {
          notes = " - " + target[i].notes;
        }
        helpText += typeof(target[i]) + " " +  i + "("+args+") " + notes + "\n";

        if(target[i].returns) {
          var returns = " - " + target[i].returns;
          helpText += " Returns: " + returns + "\n";
        }

        if(target[i].url) {
          var url = target[i].url;
          helpText += " More information <a href='" + url + "' target='help'>here</a>\n";
        }
      }
      helpText += "\n\n";
    }
    return helpText;

  };
};