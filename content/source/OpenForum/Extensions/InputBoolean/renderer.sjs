text = extension.getAttribute("text");
id = extension.getAttribute("id");

return "<label for='" + id + "CheckBoxField'>" + text + "</label>" +
  "<div class='switch'>" +
  "<input of-id='" + id + "' id='" + id + "CheckBoxField' type='checkbox'>" +
  "<label for='" + id + "CheckBoxField'></label>" +
  "</div>";
