id = extension.getAttribute( "name" );

return "<select name=\""+id+"\" id=\""+id+"\"></select><script> includeInitFunction(\"setSelect(\\\""+id+"\\\");\");includeLibrary(\"/OpenForum/Extensions/PagesListField/select.js\");</script>";