var linkURL = ""+extension.getAttribute("linkURL");
var linkText = ""+extension.getAttribute("linkText");
var title = ""+extension.getAttribute("title");
var description = ""+extension.getAttribute("description");
var imageURL = extension.getAttribute("imageURL");

var template = "";
if(imageURL==null) {
  template = ""+file.getAttachment("/OpenForum/Extensions/DisplayCard","text-card.html.template");
} else {
  imageURL = ""+imageURL;
  template = ""+file.getAttachment("/OpenForum/Extensions/DisplayCard","image-card.html.template");
}
template = template.replace("&linkURL;",linkURL);
template = template.replace("&linkText;",linkText);
template = template.replace("&title;",title);
template = template.replace("&description;",description);
template = template.replace("&imageURL;",imageURL);

return template;