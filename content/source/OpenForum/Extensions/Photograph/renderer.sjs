src = extension.getAttribute("src");
title = extension.getAttribute("title");
description = extension.getAttribute("description");

if(src!=null)
{
  src = new String(src);
  
  if( src.indexOf('/')!=0 )
  {
    src = "/"+pageName+"/"+src;
  }

  parts = src.split(".");
  thumbnail = parts[0]+".thumbnail.png";

  data = "<table class=\"box\"><tr><td><h2>"+title+"</h2><a href='' onclick='showAlert(\"<img src=\\\""+src+"\\\" border=0>\",\""+title+"<br/>"+description+"\");return false;'><img src='"+thumbnail+"' border=0/></a><br/>"+description+"</td></tr></table>";

  return data;
}
else
{
  return "Invalid Image. No src attribute given.";
}