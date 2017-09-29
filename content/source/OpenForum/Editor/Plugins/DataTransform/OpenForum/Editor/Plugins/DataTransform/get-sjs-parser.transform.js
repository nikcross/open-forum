var PARAM_START = "transaction.getParameter(";
var PARAM_END = ");";

var found = input.match( new RegExp(PARAM_START+".*"+PARAM_END,"g") );
for(var i in found) {
 var param = found[i];
 param = param.substring( PARAM_START.length+1,param.indexOf(PARAM_END)-1 );
  output += " param:"+param;
}

var ACTION_START = "action\\s*===\\s*\\\"";
var ACTION_END = "\\)";

var found = input.match( new RegExp(ACTION_START+".*"+ACTION_END,"g") );
for(var i in found) {
 var action = found[i];
 action = action.substring( action.indexOf("\"")+1,action.indexOf(")")-1 );
  output += " action:"+action;
}