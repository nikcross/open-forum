name = extension.getAttribute("name");
value = extension.getAttribute("value");
type = extension.getAttribute("type");
action = extension.getAttribute("action");

if(value==null)
{
  value="{{"+name+"}}";
}

if(type==null)
{
  type="text";
}

var onChange = "";
if(action!=null) {
  onChange = "onChange='"+action+"(); return false;'";
}

return "<input type='"+type+"' name='"+name+"' id='"+name+"Field' of-id='"+name+"' value='"+value+"' "+onChange+" />";
