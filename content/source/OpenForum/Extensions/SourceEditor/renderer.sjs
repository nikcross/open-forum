source = extension.getAttribute("source");

data = "<form><textarea id=\"codeTextarea\" cols=\"80\" rows=\"10\">";

sourceData = file.getAttachment(pageName,source);
sourceData = sourceData.replace(">","&gt;");

data+= sourceData;
data+= "</textarea></form><script>includeLibrary(\"/OpenForum/Extensions/SourceEditor/source-editor.js\");includeInitFunction(\"createTextAreaWithLines(\\\"codeTextarea\\\");\");</script>";

return data;