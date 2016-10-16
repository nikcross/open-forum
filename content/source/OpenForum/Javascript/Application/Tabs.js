/*
* Author: 
* Description: 
*/

/*
 * var tabs = [
    {id: "tabContentId", button:"tabButtonId", title: "tabTitle", src: "html source file"},...
    ];
*/

function Tabs(tabs) {
  var self = this;
  self.tabList = tabs;
  
  //OpenForum.crawl(document.body);
  OpenForum.scan();

  for(var i in tabs) {
    var tab = tabs[i];
    OpenForum.addTab(tab.id);
  }
  //OpenForum.scan();
  for(var i in tabs) {
    var tab = tabs[i];
    if(tab.src) {
      OpenForum.loadFile("/"+pageName+"/"+tab.src,function(tab) { return function(response) {
        OpenForum.setElement(tab.id, response);
        OpenForum.crawl(document.getElementById(tab.id));
        if(tab.script) OpenForum.loadScript( tab.script );
      }; }(tab) );
    }
  }

  self.showTab = function(id) {
    OpenForum.showTab(id);
    for(var i in tabs) {
      var tab = tabs[i];
      if(tab.id==id) {
        document.getElementById(tab.button).className="active";
      } else {
        document.getElementById(tab.button).className="";
      }
    }
  };
  
  self.showTab(tabs[0].id);
  
}