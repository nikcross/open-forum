// Version: {{version}}
try {

        var imageURL = extension.getAttribute("imageURL");

        var title = extension.getAttribute("title");

        var text = extension.getAttribute("text");

        var ctaText = extension.getAttribute("ctaText");

        var ctaURL = extension.getAttribute("ctaURL");

        var content = "" + file.getAttachment("/OpenForum/Extensions/CTABanner","ctabanner.html.template");

        content = content.replace(/{{imageURL}}/g, "" + imageURL);

        content = content.replace(/{{title}}/g, "" + title);

        content = content.replace(/{{text}}/g, "" + text);

        content = content.replace(/{{ctaText}}/g, "" + ctaText);

        content = content.replace(/{{ctaURL}}/g, "" + ctaURL);

        return content;
} catch(e) {
        return "" + e;
}
