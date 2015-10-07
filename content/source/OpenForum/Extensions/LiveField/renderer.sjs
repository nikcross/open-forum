pageName=extension.getAttribute("pageName");
fileName=extension.getAttribute("fileName");
refreshTime=extension.getAttribute("refreshTime");
layerId=pageName+"/"+fileName;
data = "<DIV id=\""+layerId+"\"></DIV>";
data+= "<script>includeLibrary(\"/OpenForum/Extensions/LiveField/live-field.js\");\n";
data+= "includeInitFunction(\"";
data+=  "updateLiveField(";
data+=   "\\\""+pageName+"\\\",";
data+=   "\\\""+fileName+"\\\",";
data+=   "\\\""+layerId+"\\\",";
data+=   refreshTime;
data+=  ")";
data+= "\");</script>";

return data;
