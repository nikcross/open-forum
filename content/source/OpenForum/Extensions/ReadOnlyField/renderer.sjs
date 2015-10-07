name = extension.getAttribute("name");
value = extension.getAttribute("value");

if(value==null)
{
  value="&"+name+";";
}

return "<input type='hidden' name='"+name+"' id='"+name+"' value='"+value+"'>"+value;