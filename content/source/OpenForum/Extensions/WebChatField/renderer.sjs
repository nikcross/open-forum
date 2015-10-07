queueName = extension.getAttribute("queueName");

data = "<script>";
data+=   "includeLibrary(";
data+=     "\"/OpenForum/Extensions/WebChatField/webChatSender.js\"";
data+=   ");";
data+= "</script>";
data+= "<form action=\"javascript:sendMessage();return false;\">";
data+= "<input type=\"image\" title=\""+queueName+" Web Chat\" src=\"/OpenForum/Images/icons/gif/comment.gif\"><input type=\"text\" id=\"message\" size=\"60\">";
data+= "<input type=\"button\" value=\"Send\"";
data+=   "onClick=\"";
data+=   "webChatSender.sendMessage(";
data+=     "'"+queueName+"'";
data+=   ");return false;\"";
data+= ">";
data+= "</form>";

return data;