term = extension.getAttribute("term");

if(pageName=="Glossary")
{
  return "<hr><a name=\""+term+"\"><h3>"+term+"</h3>";
}
else
{
  return "<a href=\"/Glossary#"+term+"\" title=\"Glossary entry for "+term+"\"><img src=\"/OpenForum/Images/icons/gif/information.gif\" border=\"0\"></a>";
}
