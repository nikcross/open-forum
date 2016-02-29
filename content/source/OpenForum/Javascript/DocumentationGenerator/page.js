var scriptFileName="";
var helpScriptFileName="";
var objectName=" ";
var targetPageName="/Development/OpenForumJavascript/Overview";

function generateHelpPage() {
  if(scriptFileName.length>0) {
    var dp = DependencyService.createNewDependency()
    .addDependency(scriptFileName)
    .setOnLoadTrigger(_generateHelpPage);

    if(helpScriptFileName.length>0) {
      dp.addDependency(helpScriptFileName);
    }

    dp.loadDependencies();
  } else {
    _generateHelpPage();
  }
}

function generateHelpScript() {
  if(scriptFileName.length>0) {
    var dp = DependencyService.createNewDependency()
    .addDependency(scriptFileName)
    .setOnLoadTrigger(_generateHelpScript);

    dp.loadDependencies();
  } else {
    _generateHelpScript();
  }
}

function _generateHelpPage() {
  var helpText = generateHelp(objectName);

  while( helpText.indexOf("\n\n")!=-1 ) {
    helpText = helpText.replace(/\n\n/g,"\n");
  }
  helpText = helpText.replace(/\n/g,"<br/>\n");
  helpText = helpText.replace(/function/g,"* function");

  OpenForum.setElement("output",helpText);

  if(targetPageName.length>0) {
    OpenForum.saveFile(targetPageName+"/page.content",helpText);
  }
}

function _generateHelpScript() {

  var helpScript = "";

  var objectName = objectName.split(",");
  for(var o=0; o<objectName.length;o++) {
    var target = eval(objectName[o]);

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
  }
  OpenForum.setElement("output","<xmp>"+helpScript+"</xmp>");
};

function generateHelp(objectName) {
  var helpText = "";
  var objectName = step.objectName.split(",");
  for(var o=0; o<objectName.length;o++) {
    var target = eval(objectName[o]);

    helpText += objectName + "\n\n";

    for(var i in target) {
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
  }
  return helpText;

}