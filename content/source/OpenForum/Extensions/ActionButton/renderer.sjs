action = extension.getAttribute("action");
parameters = extension.getAttribute("parameters");
text = extension.getAttribute("text");
id = extension.getAttribute("id");
img = extension.getAttribute("img");
icon = extension.getAttribute("icon");

if(icon!=null) {
  img = "/OpenForum/Images/icons/png/"+icon+".png";
}

if(img!=null) {
  var alt = "";
  if(text!=null) {
    alt = text;
  }
  text = "<img src='" + img + "' alt='" + alt + "' title='" + alt + "' />";
}

var idHtml = "";
if(id!=null) idHtml = "id = '"+ id +"'";

if(parameters==null) {
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
return "<a " + idHtml + " class='button radius tiny' href='#' onclick='"+action+"("+parameters+"); return false;'>"+text+"</a> ";
