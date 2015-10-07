var pageManager = {
  open: false,
  copyPage: function() {
        window.open("/OpenForum/Actions/Copy?sourcePageName="+sourcePageName+"&newPageName="+targetPageName,"copyEditor");
	},
  movePage: function() {
        window.open("/OpenForum/Actions/Move?pageName="+sourcePageName+"&newPageName="+targetPageName,"moveEditor");
	},
  deletePage: function() {
        window.open("/OpenForum/Actions/Delete?pageName="+deletePageName,"deleteEditor");
  },
  createPage: function() {
        window.open("/OpenForum/Actions/Edit?pageName="+createPageName,"createEditor");
  }
};

addPlugin( {
  name: "Page Manager",
  init: function() {
      if(pageManager.open===true) {
        return;
      }
      pageManager.open=true;
      editorIndex++;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/PageManager/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);

      OpenForum.crawl(document.getElementById("editor"+editorIndex));
    
      OpenForum.addTab("editor"+editorIndex);
      editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "pageManager", changed: ""};
      showTab(editorIndex);
      pageManager.log("pageManager Ready");
      return editorList[editorIndex];
    }
});