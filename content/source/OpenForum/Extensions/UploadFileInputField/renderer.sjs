// Version: {{version}}
try {

        var name = extension.getAttribute("name");

        var targetPageName = extension.getAttribute("targetPageName");
		if(targetPageName.charAt(0)=="/") {
          targetPageName = "'" +  targetPageName + "'";
        }
  
        var text = extension.getAttribute("text");

        var message = extension.getAttribute("message");

  		var then = extension.getAttribute("then");
  
  		if( then == null ) {
        	then = "alert('{{message}}');});";
        }
  
        var content = "" + file.getAttachment("/OpenForum/Extensions/UploadFileInputField","uploader.html.template");

  		content = content.replace(/{{then}}/g, then);
  
        content = content.replace(/{{name}}/g, "" + name);

        content = content.replace(/{{targetPageName}}/g, "" + targetPageName);

        content = content.replace(/{{text}}/g, "" + text);

        content = content.replace(/{{message}}/g, "" + message);

        return content;
} catch(e) {
        return "" + e;
}
