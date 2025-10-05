/*
* Author: 
* Description: 
*/
var Modals = new function() {
  var self = this;
  
  self.modal = function(id,title,content) {
    return     "<div id=\""+id+"Modal\" class=\"reveal-modal\" data-reveal aria-labelledby=\""+id+"modalTitle\" aria-hidden=\"true\" role=\"dialog\">" + 
    "  <h2 id=\""+id+"modalTitle\">"+title+"</h2>" + 
    content + 
    "  <a class=\"close-reveal-modal\" aria-label=\"Close\">&#215;</a>" + 
    "</div>";
  };
  
  self.showModal = function(id) {
    $("#"+id+"Modal").foundation('reveal', 'open');
  };
  
  self.hideModal = function(id) {
    $("#"+id+"Modal").foundation('reveal', 'close');
  };
};