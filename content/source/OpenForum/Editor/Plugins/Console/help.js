OpenForum.help = function(obj) {
  for(var i in obj) {
    if(typeof(obj[i])=="function") {
      var fnString = i + "(";
      if(obj[i].functionHelp && obj[i].functionHelp.signature) {
        fnString+=obj[i].functionHelp.signature;
      } else {
        for(var a=0; a<obj[i].length;a++) {
          if(a>0) {
            fnString += ",";
          }
          fnString += "arg"+a;
        }
      }
      fnString += ")";
      console.log(fnString);
    }
  }
};

OpenForum.addHelp = function(objFn,signature,exclude,url) {
  objFn.functionHelp = {signature: signature, exclude: exclude, url: url};
};

OpenForum.addHelp(OpenForum.addHelp,"function to document (Function) , exclude flag (Boolean) , information url (String)",false,null);
OpenForum.addHelp(OpenForum.help,"object to give help on (Object)",false,null);