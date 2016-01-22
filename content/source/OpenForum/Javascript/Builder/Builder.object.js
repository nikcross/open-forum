function Builder(JSON,file) {
  
  var Build = function(JSON,file) {
    
      var result = "";
      var HR = "//==============================================================================================================//\n";
      var buildScript = {};

      this.loadBuildScript = function(fileName) {
        buildScript = this.JSON.parse( this.file.getAttachment("",""+fileName) );
      };

      this.setBuildParameter = function(key,value) {
        if(value===null) return;
        buildScript[key] = ""+value;
      };

      this.getBuildParameter = function(key) {
        return buildScript[key];
      };

      this.build = function() {
        var script = HR;
        buildScript.date = new Date();
        
        script += "/* Version "+buildScript.version+"*/\n";
        script += "/* Built on " + new Date() + " */\n";
        script += "/* Built by /OpenForum/Javascript/Builder.*/\n";
        script += "/* Do not edit as changes may be overwritten */\n";
        script += HR;

        for(var i in buildScript.steps) {
          var step = buildScript.steps[i];
          if(step.action==="append") {
            script += HR;
            script += "/* Source: "+step.file+"*/\n";
            script += HR;
            script += this.file.getAttachment("",step.file);
            script += "\n/* End of: "+step.file+"*/\n\n";
            script += HR;
          } else if(step.action==="replace") {
            if(step.replaceWith.charAt(0)==="$") {
              step.replaceWith = buildScript[step.replaceWith.substring(1)];
            }
            script = script.replace( new RegExp(step.searchFor,"g"),step.replaceWith);
          }
        }

        this.file.saveAttachment("",buildScript.targetFile,script);

        var versionedTargetFile = buildScript.versionFile.substring(0,buildScript.versionFile.indexOf("."))+"-";
        versionedTargetFile += buildScript.version.replace(/\./g,"-");
        versionedTargetFile += buildScript.targetFile.substring(buildScript.targetFile.indexOf("."));
        buildScript.versionedTargetFile = versionedTargetFile;

        this.file.saveAttachment("",versionedTargetFile,script);
      };
  };
  
  this.getBuild = function() {
    return new Build(JSON,file);
  };
}