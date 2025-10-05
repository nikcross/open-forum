var text = extension.getAttribute("text");
var action = extension.getAttribute("action");

var config = openForum.retrieveObject("config");
var key = config.getValue("recaptcha-key");

if(typeof key == "undefined") {
  return( "<b>Missing configuration value for recaptcha-key</b>" );
}

return "<script src=\"https://www.google.com/recaptcha/api.js\"></script>" +
	"<button" + 
    "  class=\"g-recaptcha button\"" + 
    "  data-sitekey=\"" + key + "\"" + 
    "  data-callback=\"" + action + "\">" + 
    text + 
    "</button>";