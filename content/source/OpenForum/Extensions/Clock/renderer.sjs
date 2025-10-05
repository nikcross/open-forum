// Version: {{version}}
try {

        var content = "" + file.getAttachment("/OpenForum/Extensions/Clock","clock.fragment.html");

        return content;
} catch(e) {
        return "" + e;
}
