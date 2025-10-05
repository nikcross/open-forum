// Version: {{version}}
try {

        var text = extension.getAttribute("text");

        var backgroundColor = extension.getAttribute("backgroundColor");

        var textColor = extension.getAttribute("textColor");

        var imageURL = extension.getAttribute("imageURL");
  
        var imageRight = extension.getAttribute("imageRight");

        var content = "";
 
  		if(imageRight==null || imageRight=="false") {
          content += file.getAttachment("/OpenForum/Extensions/ContrastBlock","contrast-block.html.template");
        } else {
          content += file.getAttachment("/OpenForum/Extensions/ContrastBlock","contrast-block-image-right.html.template");
        }

        content = content.replace(/{{text}}/g, "" + text);

        content = content.replace(/{{backgroundColor}}/g, "" + backgroundColor);

        content = content.replace(/{{textColor}}/g, "" + textColor);

        content = content.replace(/{{imageURL}}/g, "" + imageURL);

        return content;
} catch(e) {
        return "" + e;
}
