function setSelect(id)
{
  field = document.getElementById(id);

  data = fileManager.loadFile("/OpenForum/Actions/","GetPagesListAsJavascript?pageName=dummy");

  eval(data);

  for(loop=0;loop<pages.length;loop++)
  {
   field.options[field.options.length] = new Option(pages[loop],pages[loop]);
  }
}

function setSelectValue(id,value)
{
  field = document.getElementById(id);

  for(loop=0;loop<field.options.length;loop++)
  {
    if(field.options[loop].value == value)
    {
      field.options[loop].selected = true;
    }
  }  
}