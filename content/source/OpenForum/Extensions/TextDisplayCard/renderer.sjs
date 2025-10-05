// Version: {{version}}
try {

        var title = extension.getAttribute("title");

        var description = extension.getAttribute("description");

        var linkText = extension.getAttribute("linkText");

        var linkURL = extension.getAttribute("linkURL");

        var content = "" + file.getAttachment("/OpenForum/Extensions/TextDisplayCard","text-display-card.html.template");

        content = content.replace(/{{title}}/g, "" + title);

        content = content.replace(/{{description}}/g, "" + description);

        content = content.replace(/{{linkText}}/g, "" + linkText);

        content = content.replace(/{{linkURL}}/g, "" + linkURL);

        return content;
} catch(e) {
        return "" + e;
}
