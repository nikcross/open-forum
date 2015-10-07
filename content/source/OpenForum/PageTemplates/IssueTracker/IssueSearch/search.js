includeInitFunction("initSearch();");

function initSearch()
{
  options = document.getElementById("search")._type.options
  option = new Option("*");
  options[options.length] = option;
  options.selectedIndex = options.length-1;
  document.getElementById("search").type.value="*";

  options = document.getElementById("search")._priority.options
  option = new Option("*");
  options[options.length] = option;
  options.selectedIndex = options.length-1;
  document.getElementById("search").priority.value="*";

  options = document.getElementById("search")._status.options
  option = new Option("*");
  options[options.length] = option;
  options.selectedIndex = options.length-1;
  document.getElementById("search").status.value="*";

  options = document.getElementById("search")._owner.options
  option = new Option("*");
  options[options.length] = option;
  options.selectedIndex = options.length-1;
  document.getElementById("search").owner.value="*";

  options = document.getElementById("search")._assigned.options
  option = new Option("*");
  options[options.length] = option;
  options.selectedIndex = options.length-1;
  document.getElementById("search").assigned.value="*";
}