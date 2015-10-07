src = extension.getAttribute("src");

if(src!=null)
{
  src = new String(src);
  
  if( src.indexOf('/')!=0 )
  {
    src = "/"+pageName+"/"+src;
  }

  parts = src.split(".");
  thumbnail = parts[0]+".thumbnail.png";

  data = "<a href='' onclick='showAlert(\"<img src=\\\""+src+"\\\" border=0>\",\""+src+"\");return false;'><img src='"+thumbnail+"' border=0/></a>";

  return data;
}
else
{
  return "Invalid Image. No src attribute given.";
}