// Version: {{version}}
try {

        var imageURL = extension.getAttribute("imageURL");

        var title = extension.getAttribute("title");

        var text = extension.getAttribute("text");

        var content = "" + file.getAttachment("/OpenForum/Extensions/Banner","banner.html.template");

        content = content.replace(/{{imageURL}}/g, "" + imageURL);

        content = content.replace(/{{title}}/g, "" + title);

        content = content.replace(/{{text}}/g, "" + text);

        return content;
} catch(e) {
        return "" + e;
}
