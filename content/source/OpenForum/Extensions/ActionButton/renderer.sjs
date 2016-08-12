action = extension.getAttribute("action");
parameters = extension.getAttribute("parameters");
text = extension.getAttribute("text");

if(parameters===null) {
  parameters = "";
} else {
  var parts = (""+parameters).split(",");
  parameters = "";
  for(var part in parts) {
    if(parameters.length>0) parameters += ",";
    parameters += "\""+parts[part]+"\"";
  }
}
//return "<a class='button' href='#' onclick='"+action+"(); return false;'>"+text+"</a>";
return "<a class='button' href='#' onclick='"+action+"("+parameters+"); return false;'>"+text+"</a>";
