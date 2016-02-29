/*
* Author: 
* Description: 
*/

square  = function(a) { Return(a*a);};

sumTo = function(a) {
  var total = 0;
  for(var i=0;i<a;i++) {
    total += a;
  }
  Return(total);
};

toCaps = function(elementId) {
  get("document.getElementById('"+elementId+"').innerHTML",
    function(value) {
      value = value.toUpperCase();
      
      set("document.getElementById('"+elementId+"').innerHTML",value);
      
      Return( value );
    }
  );
};