//Version 0.1
var action = transaction.getParameter("action");

if(action===null) {
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}

if(action=="buildClientWrapper") {
    var target = transaction.getParameter("target");

var clas = eval((""+target).toLowerCase()).getClass();
var clasJSON = { methods: [] };
for(var methodI in clas.getDeclaredMethods()) {
  var method = clas.getDeclaredMethods()[methodI];
  var methodName = method.getName();
  
  var allPrimatives = true;
  var methodJSON = {name: methodName,args: []};
  
  for(var argI in method.getParameterTypes()) {
    var arg = method.getParameterTypes()[argI];
    
    if(arg.getName()!="java.lang.String" && arg.isPrimitive()===false) {    
      allPrimatives = false;
      break;
    }
    
    var argName = arg.getName;
    
    methodJSON.args.push( {name: 'arg'+argI, type: argName} );
  }
  if(allPrimatives) {
    clasJSON.methods.push(methodJSON);
  }
}


/*
Client code template
file: {
	methodName: function(arg0,successFn) {
    	if(successFn) {
        	JSON.get(uri,"arg0="+arg0).onSuccess(successFn).go();
        } else {
        	return OpenForum.loadFile(uri+"?arg0="+arg0);
        }
    }
}
*/

var objectName = "OpenForum."+target.toLowerCase();
var script = objectName+" = {};\n";

for(var mi in clasJSON.methods) {
	var method = clasJSON.methods[mi];
    var uri = "/OpenForum/Javascript/JavaWrapper/"+target;
    
	script+=objectName+"."+method.name+" = function(";
    
    var args = "";
    var sjsArgs = "";
    for(var ai in method.args) {
          arg = method.args[ai];
          if(args.length>0) {
              args+=",";
              sjsArgs+="+\"&\"+";
          }
          args+=arg.name;
		  sjsArgs+="\""+arg.name+"=\"+"+arg.name;
    }
    if(args.length>0) {
    	args+=",";
    }
    args+="successFn";
    script+=args+") {\n";
    
    script+="\t if(successFn) {\n";
    script+="\t\tJSON.get(\""+uri+"\",\""+method.name+"\","+sjsArgs+").onSuccess(successFn).go();\n";
	script+="\t} else {\n";
	script+="\t\treturn OpenForum.loadFile(\""+uri+"?action="+method.name+"&\"+"+sjsArgs+");\n";
	script+="\t}\n";
    script+="};\n\n";
}

file.saveAttachment("/OpenForum/Javascript/JavaWrapper/"+target,target+".js",script);
  transaction.sendPage( script );
  return;
} else if(action=="buildService") {
  
  var targetName = transaction.getParameter("target");
var clas = eval((""+targetName).toLowerCase()).getClass();
var clasJSON = { methods: [] };
for(var methodI in clas.getDeclaredMethods()) {
  var method = clas.getDeclaredMethods()[methodI];
  var methodName = method.getName();
  
  var allPrimatives = true;
  var methodJSON = {name: methodName,args: []};
  
  for(var argI in method.getParameterTypes()) {
    var arg = method.getParameterTypes()[argI];
    
    if(arg.getName()!="java.lang.String" && arg.isPrimitive()===false) {    
      allPrimatives = false;
      break;
    }
    
    var argName = arg.getName;
    
    methodJSON.args.push( {name: 'arg'+argI, type: argName} );
  }
  if(allPrimatives) {
    clasJSON.methods.push(methodJSON);
  }
}


/*
Service code template
if(action==="methodName") {
	var arg0 = transaction.getParameter("arg0");
    
    return file.methodName(arg0);
}
*/

var script = "// Service for "+clas.getName()+" \n";
script += "var action = transaction.getParameter(\"action\");\n";
script += "if(action===null) {\n";
script += "\ttransaction.setResult(transaction.SHOW_PAGE);\n";
script += "\treturn;\n";
script += "}\n\n";

for(var mi in clasJSON.methods) {
	var method = clasJSON.methods[mi];
	script+="if(action==\""+method.name+"\") {\n";
    
    var args = "";
    for(var ai in method.args) {
    	arg = method.args[ai];
    	script+="\tvar "+arg.name+" = transaction.getParameter(\""+arg.name+"\");\n";
        if(args.length>0) {
        	args+=",";
        }
        args+=arg.name;    
    }
    
    script+="\ttransaction.sendPage( "+targetName.toLowerCase()+"."+method.name+"("+args+") );\n\treturn;\n}\n";
}

file.saveAttachment("/OpenForum/Javascript/JavaWrapper/"+targetName,"get.sjs",script);
  
transaction.sendPage( script );
} else {
  transaction.sendPage("what ?");
}