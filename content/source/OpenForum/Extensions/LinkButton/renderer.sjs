// Version: {{version}}
try {

        var href = extension.getAttribute("href");

        var target = extension.getAttribute("target");

        var text = extension.getAttribute("text");

        var content = "" + file.getAttachment("/OpenForum/Extensions/LinkButton","link-button.html.template");

        content = content.replace(/{{href}}/g, "" + href);

        content = content.replace(/{{target}}/g, "" + target);

        content = content.replace(/{{text}}/g, "" + text);

        return content;
} catch(e) {
        return "" + e;
}
