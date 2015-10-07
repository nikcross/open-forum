/*function wrap(instance) {
  //if primative, convert to javascript type
  if(instance instanceof String) {
    return ""+instance;
  } //etc
  
  var jsWrapper = {};
  // original instance held in wrapper
  jsWrapper._original = instance;
  // loop through each method in instance and add matching js method
  {
    jsWapper.method = function(signature) {
        // if call parameter is non primative, if has wrapped java, use wrapped
      var result = _original.method();
      // if method returns non primative, include call to wrap so java wrapped on demand
      return wrap(result);
    }
  }
  return jsWapper;
}*/

function wrap(instance) {
  for(var fn in instance) {
    println(instance[fn]);
  }
}

wrap(js);