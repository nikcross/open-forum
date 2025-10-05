
var Publisher = js.getObject("/OpenForum/AddOn/Publisher","Publisher.sjs");
log = {
  debug: function(message) { println("DEBUG: "+message); }
};
Publisher.log = log;

Publisher.getNeedsPublishing(log);