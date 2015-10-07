includeLibrary("/OpenForum/Javascript/mouse.js");

function Popup()
{
  this.show = function(pageName)
{
  this.layer = document.getElementById("modal");
  this.layer.style.top = mouse.y+20;
  this.layer.style.left = mouse.x;

  this.content = fileManager.loadFile(pageName,"page.html.fragment");

  this.layer.innerHTML = "<DIV onMouseOut=\"popup.hide();\" onMouseOver=\"popup.clearHide();\" style=\"background: #000000;\"><a href=\""+pageName+"\" class=\"box\">Open Page</a><DIV style=\"overflow: auto; height: 200px;\"><table><tr><td class=\"content\">"+this.content+"</td></tr></table></DIV></DIV>";

  this.layer.style.display = "block";
}

  this.showIFrame = function(pageName)
{
  this.layer = document.getElementById("modal");
  this.layer.style.top = mouse.y+20;
  this.layer.style.left = mouse.x;

  this.layer.innerHTML = "<DIV style=\"overflow: auto;\" onMouseOut=\"popup.hide();\" onMouseOver=\"popup.clearHide();\"><iframe src=\""+pageName+"/page.html\" width=\"400px\" height=\"200px\"></iframe></DIV>";

  this.layer.style.display = "block";
}

  this.showContent = function(content)
{
  this.layer = document.getElementById("modal");
  this.layer.style.top = mouse.y+20;
  this.layer.style.left = mouse.x;

  this.content = content;

  this.layer.innerHTML = "<DIV style=\"overflow: auto; height: 200px;\" onMouseOut=\"popup.hide();\" onMouseOver=\"popup.clearHide();\"><table><tr><td class=\"content\">"+this.content+"</td></tr></table></DIV>";

  this.layer.style.display = "block";
}

  this.clearHide = function()
{
  clearTimeout(this.timer);
}

  this.hide = function()
{
  this.timer = setTimeout("popup._hide();",1000);
}

  this._hide = function()
{
  this.layer = document.getElementById("modal");
  this.layer.style.display = "none";
}

}

var popup = new Popup();