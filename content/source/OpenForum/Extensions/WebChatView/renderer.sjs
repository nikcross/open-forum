queueName = extension.getAttribute("queueName");

data = "<script>";
data+=   "includeLibrary(\"/OpenForum/Extensions/WebChatView/webChatView.js\");";
data+=   "includeInitFunction(\"webChatView.init('"+queueName+"');\");";
data+= "</script><DIV id=\""+queueName+"\"></DIV>";

return data;