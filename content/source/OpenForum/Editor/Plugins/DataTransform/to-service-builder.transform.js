/*
* Author: 
* Description: 
*
*/

/* Example config
{
  "libraries": ["Thing.sjs"]
  "actions": [
    { "action": "doIt", "parameters": [
      {"name": "name", "type": "string", "required": false},
      {"name": "page", "type": "string", "required": true}
    	] 
     "call": "Thing.doStuff();"
    }
    ]
}
*/

try{
  
var json = JSON.parse(input);

var template = OpenForum.loadFile("/OpenForum/FileTemplates/js/get.sjs.default");

var actionTemplate ="if(action===\"&actionName;\") {&parameters;&call;&result;}\n";
var defaultResultTemplate = "\n\t{result: \"ok\", message: \"Performed action \"+action, data: returned};\n";

/*To Do
 * Add library import
 * Make service to take library and make service
 * Add logging to queue option
*/
  
var actionSource = "";
for(var i in json.actions) {
  var actionDef = json.actions[i];
  
  var parameterSource = "";
  for(var p in actionDef.parameters) {
    var parameterDef = actionDef.parameters[p];
    parameterSource += "\n\tvar "+parameterDef.name+" = transaction.getParameter(\""+parameterDef.name+"\");\n";
    if(parameterDef.required===true) {
      parameterSource += "\tif("+parameterDef.name+"===null) throw \"Request is missing required parameter "+parameterDef.name+"\";\n";
    }
    parameterSource += "\t"+parameterDef.name+" = \"\" + "+parameterDef.name+";\n";
  }
  
  var callSource="\tvar returned = "+actionDef.call+"\n";
  
  actionSource += actionTemplate.
    replace("&actionName;",actionDef.action).
    replace("&parameters;",parameterSource).
    replace("&call;",callSource).
    replace("&result;",defaultResultTemplate);
}

var data = template.substring(0,template.indexOf("/*---8<---")) + actionSource + template.substring(template.indexOf("--->8---*/")+10);
  
} catch (e) {
  var data = ""+e;
}

output = data;