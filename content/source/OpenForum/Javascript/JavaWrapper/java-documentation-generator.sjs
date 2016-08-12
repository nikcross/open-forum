/*
* Author: 
* Description: 
*/

var sjsObject = "openForum";

var helpScript = null;
if( file.attachmentExists("/OpenForum/Javascript/JavaWrapper",sjsObject+".help.js") ) {
  helpScript = eval( ""+file.getAttachment("/OpenForum/Javascript/JavaWrapper",sjsObject+".help.js") );
}


function transformName(className) {
  if(className==="java.lang.String") className = "string";
  else if(className==="java.lang.StringBuffer") className = "StringBuffer";
  else if(className==="boolean") className = "boolean";
  else if(className==="long") className = "integer";
  else if(className==="org.onestonesoup.openforum.transaction.Transaction") className = "transaction";
  else if(className==="java.lang.Object") className = "object";
  else if(className==="org.mozilla.javascript.NativeObject") className = "object";
  else if(className==="[Ljava.lang.String;") className = "string[]";
  else if(className==="[[Ljava.lang.String;") className = "string[][]";
  else if(className==="void") className = "void";
 else if(className==="org.onestonesoup.javascript.engine.JavascriptEngine") className = "JavascriptEngine";
  else if(className==="java.util.Map") className = "Map";
  else if(className==="java.io.OutputStream") className = "OutputStream";
  else if(className==="java.io.InputStream") className = "InputStream";
  else className = ">>>"+className+"<<<";
  //else return;

  return className;
}


var clas = eval(sjsObject+".getClass();");
var clasJSON = { sjsName: sjsObject, className: ""+clas.getName(),methods: [] };

for(var methodI in clas.getDeclaredMethods()) {
  var method = clas.getDeclaredMethods()[methodI];

  var methodName = method.getName();

  var returnType = transformName(""+method.getReturnType().getName());

  var allPrimatives = true;
  var methodJSON = {name: ""+methodName, returnType: returnType};
  var methodJSONArgs = [];
  methodJSON.args = methodJSONArgs;

  for(var argI in method.getParameterTypes()) {
    var arg = method.getParameterTypes()[argI];
    //println(" a:"+arg.getName());

    var argName = transformName(""+arg.getName());
    if(!argName) {
      allPrimatives = false;
      break;
    }

    methodJSONArgs.push( {name: "arg"+argI, type: ""+argName} );
  }
  if(allPrimatives) {
    clasJSON.methods.push(methodJSON);
  }
}


generateHelpScript = function(clasJSON) {
  var helpScript = "/* Help script for "+clasJSON.sjsName+"*/\n\n";
  var objectName =  clasJSON.sjsName+"Help";
  helpScript += "var "+objectName + "= {};\n";

  for(var i =0;i<clasJSON.methods.length; i++) {
    var method = clasJSON.methods[i];

    helpScript += objectName+"."+method.name+i+"={};\n";

    helpScript += "// "+objectName+"."+method.name+i+".notes=\"\";\n";
    if( method.args.length>0) {
      var args = "";
      for(var j=0;j<method.args.length;j++) {
        if(args.length > 0) args+=", ";
        args += method.args[j].type + " ";
      }
      helpScript += objectName+"."+method.name+i+".args=\" "+args+"\";\n";
    }
    if( method.returnType!=="void" ) {
      helpScript += "// "+objectName+"."+method.name+i+".returns=\""+method.returnType+"\";\n";
    }
    helpScript += "// "+objectName+"."+method.name+i+".url=\"\";\n";

  }

  helpScript += "result = " + objectName + ";\n";

  return helpScript;
};

generateDocumentation = function(clasJSON,helpScript) {
  var data = "!!Documentation for "+clasJSON.sjsName+"\n";
  for(var i =0;i<clasJSON.methods.length; i++) {
    var method = clasJSON.methods[i];
    var help = helpScript[method.name+i];
    data+= "\n----\n\n";
    if(help.notes) {
      data += "(("+help.notes+"))";
    }
    var args = help.args;
    if( typeof(args)==="undefined" ) args="";
    data += method.returnType + " " + clasJSON.sjsName+"."+method.name+"("+args+")\n";
  }

  return data;
};

if(helpScript===null) {
  var script = generateHelpScript(clasJSON);
  file.saveAttachment( "/OpenForum/Javascript/JavaWrapper",sjsObject+".help.js",script );
} else {
  var pageContent = generateDocumentation(clasJSON,helpScript);
  file.saveAttachment( "/Development/OpenForumDocumentation/OpenForumServerSideJavascript/",sjsObject+".page.content",pageContent );
}

println( JSON.stringify( clasJSON,null,4 ) );