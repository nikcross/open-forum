//This needs rework into a transform
//
var d = new Date();
var n = "date";
var w = "";
for(i in d) {
  var name = i;
  var fn = ""+d[i];

  if(fn.indexOf("function (")==0) {
    var params = fn.substring(fn.indexOf("(")+1,fn.indexOf(")"));
      w+= "this."+name+"= function("+params+") { return "+n+"."+name+"("+params+"); };";
    } else {
    w+= "this."+name+"="+n+"."+name+";";
  }
    w+="\n\n";
}

  console.log( w.replace(/\n/g,"<br/>") );