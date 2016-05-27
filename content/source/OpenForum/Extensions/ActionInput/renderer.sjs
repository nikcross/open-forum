action = extension.getAttribute("action");

return "<input type=\"text\" onKeyPress=\"(function(element,event) { if(event.charCode != 13) {return false;} else { "+action+"( element.value ); } })(this,event);\">";
