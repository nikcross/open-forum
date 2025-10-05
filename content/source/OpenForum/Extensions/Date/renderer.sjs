// Version: {{version}}
try {

        var content = "" + file.getAttachment("/OpenForum/Extensions/Date","date.fragment.html");

        return content;
} catch(e) {
        return "" + e;
}
