var parts = pageName.split("/");
var htmlData = '<nav class="breadcrumbs" role="menubar" aria-label="breadcrumbs">';

var path = "";
for(loop=0;loop<parts.length-1;loop++)
{
    path+="/"+parts[loop];
    htmlData += '<li role="menuitem"><a href="'+path+'">'+parts[loop]+'</a></li>';
}

htmlData += '<li role="menuitem" class="current"><a href="'+path+'">'+parts[loop]+'</a></li>';
htmlData += '</nav>';

return htmlData;