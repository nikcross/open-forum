showPage = extension.getAttribute("showPage");
text = extension.getAttribute("text");
asIFrame = extension.getAttribute("asIFrame");
if(asIFrame==null || asIFrame=="false")
{
  asIFrame = false
}
else
{
  asIFrame = true;
}

if(asIFrame==false)
{

data = "<a href=\"\" onclick=\"popup.show('"+showPage+"');return false;\" onMouseOut=\"popup.hide();\" onMouseOver=\"popup.clearHide();\">"+text+"</a>";
data+= "<script>includeLibrary(\"/OpenForum/Extensions/Popup/popup.js\");</script>"

}
else
{

data = "<a href=\"\" onclick=\";popup.showIFrame('"+showPage+"');return false;\" onMouseOut=\"popup.hide();\" onMouseOver=\"popup.clearHide();\">"+text+"</a>";
data+= "<script>includeLibrary(\"/OpenForum/Extensions/Popup/popup.js\");</script>"

}
return data;