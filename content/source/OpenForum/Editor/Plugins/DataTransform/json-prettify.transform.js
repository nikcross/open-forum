try{
  var json = JSON.parse(input);
  output = JSON.stringify( json,null,4 );
} catch(e) {
  output = ""+e;
  
  if(output.indexOf("SyntaxError")==0) {
    if(output.indexOf("in JSON at position ")!=-1) {
      var pos = output.substring(output.indexOf("in JSON at position ") + "in JSON at position ".length);
      pos = pos.substring( 0,pos.indexOf(" ") );
      
      output += pos;
    }
  }
}