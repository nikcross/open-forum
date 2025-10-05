// Version: {{version}}
try {

        var title = extension.getAttribute("title");

        var description = extension.getAttribute("description");

        var linkText = extension.getAttribute("linkText");

        var linkURL = extension.getAttribute("linkURL");

        var imageURL = extension.getAttribute("imageURL");

        var content = "" + file.getAttachment("/OpenForum/Extensions/ImageDisplayCard","image-display-card.html.template");

        content = content.replace(/{{title}}/g, "" + title);

        content = content.replace(/{{description}}/g, "" + description);

        content = content.replace(/{{linkText}}/g, "" + linkText);

        content = content.replace(/{{linkURL}}/g, "" + linkURL);

        content = content.replace(/{{imageURL}}/g, "" + imageURL);

        return content;
} catch(e) {
        return "" + e;
}
