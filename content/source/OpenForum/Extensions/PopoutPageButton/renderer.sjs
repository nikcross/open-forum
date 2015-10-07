pageName = extension.getAttribute("page");
title = extension.getAttribute("title");

data = "<form name=\"opener\"><input type=\"button\" value=\"Open "+title+"\" ";
data += "onClick=\"popout('"+pageName+"');\"></form>";

return data;

