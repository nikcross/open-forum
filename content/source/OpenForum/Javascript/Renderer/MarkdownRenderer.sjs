/*
 * 
* Author: 
* Description: 
*/
function MarkdownRenderer() {
  var self = this;

  var script = ""+file.getAttachment("/OpenForum/Javascript/Renderer","marked.js");

  module = { exports: {} };
  eval( script );

  self.getVersion = function() {
    return "MarkdownRenderer from https://github.com/chjj/marked v0.3.5 ";
  };

  self.render = function(pageName,text) {
    var htmlContent = marked(text);

    return htmlContent;
  };
}