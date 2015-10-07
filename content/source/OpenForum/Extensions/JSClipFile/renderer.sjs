clipPageName = extension.getAttribute("pageName");
clipFileName = extension.getAttribute("fileName");

data = "<a href=\"\"";
data += "onclick=\"addJSClipFromFile('"+clipPageName+"','"+clipFileName+"');return false;\"";
data += " title=\"Paste Code\"><img src=\"/OpenForum/Images/icons/gif/page_paste.gif\" border=\"0\"></a>";

return data;