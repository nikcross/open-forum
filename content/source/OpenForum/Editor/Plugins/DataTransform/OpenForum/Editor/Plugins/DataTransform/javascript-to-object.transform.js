var name = "Solar";

//SuperString

var SuperString = function( data ) {
  var self = this;
  
  self.replace = function( find,replacement ) {
    var start = find.substring(0,find.indexOf("*"));
    var end = find.substring( find.indexOf("*")+1);
    
    var s = data;
    var o  = "start:["+start+"] end:["+end+"] replacement:["+replacement+"]";
    while(true) {
      var a = s.indexOf(start);
      if(a==-1)  {
        o+=s;
        break;
      }
      
      o = o+s.substring(0,a);
      s = s.substring(a);
      
      var b = s.indexOf(end);
      if(b==-1)  {
        o+=s;
        break;
      }
      b += end.length;
      
      var star = s.substring(start.length,b-end.length);
      
      o += replacement.replace("*",star);
      s = s.substring( b );
    }
    return o;
  }
}

//

var script = input;
script = new SuperString(script).replace( "function *(","var.* function(" );
script = "var "+name+" = function() {\nvar self = this;\n" + script + "\n}\n";

output = script;