// Version: {{version}}
try {

        var counter = extension.getAttribute("counter");

        var action = extension.getAttribute("action");

        var period = extension.getAttribute("period");

        var content = "" + file.getAttachment("/OpenForum/Extensions/CountDown","count-down.html.template");

        content = content.replace(/{{counter}}/g, "" + counter);

        content = content.replace(/{{action}}/g, "" + action);

        content = content.replace(/{{period}}/g, "" + period);

        return content;
} catch(e) {
        return "" + e;
}
