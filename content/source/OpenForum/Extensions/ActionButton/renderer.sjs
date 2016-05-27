action = extension.getAttribute("action");
parameters = extension.getAttribute("parameters");
text = extension.getAttribute("text");

return "<a class='button' href='#' onclick='"+action+"(); return false;'>"+text+"</a>";
//return "<a class='button' href='#' onclick='"+action+"("+parameters+"); return false;'>"+text+"</a>";
