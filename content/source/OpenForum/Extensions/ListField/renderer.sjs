name = extension.getAttribute("name");
value = extension.getAttribute("value");
action = extension.getAttribute("action");
list = extension.getAttribute("list");
listField = extension.getAttribute("listField");

if(value==null)
{
  value="";
}

if(listField==null) {
  listField = "optionValue";
} else {
  listField = "optionValue."+listField;
}

var onChange = "";
if(action!=null) {
  onChange = "onChange='"+action+"(); return false;'";
}

var uid = ( ""+Math.random() + new Date().getTime() ).replace(".","");

return "<input type='text' list='dataList_"+list+uid+"' name='"+name+"Input' id='"+name+"Field'  of-id='"+name+"' value='"+value+"' "+onChange+" ondblclick='"+ name + "=OpenForum.BLANK;' title='Double click to clear'/>" +
  "<datalist id='dataList_"+list+uid+"'>\n<option of-repeatFor='optionValue in "+list+"'>{{" + listField + "}}</option>\n</datalist>";
