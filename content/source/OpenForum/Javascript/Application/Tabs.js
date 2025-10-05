/*
* Author: 
* Description: 
*/
function Tabs(tabsElementId,tabs,callback) {
  var self = this;

  //Ignore hash change on showTab call to stop infinite regression
  var ignoreHash = false;

  OpenForum.scan();
  //OpenForum.crawl(document.body);
  var tabsHtml = "";
  for(var i in tabs) {
    var tab = tabs[i];
    if(!tab.title) throw "All tabs must have a title";
    if(!tab.id) tab.id = tab.title.toLowerCase().replaceAll(" ","_");
    if(!tab.button) tab.button = tab.id + "_TabButton";
    if(!tab.src) {
      var fileName = tab.id+".html.fragment";
      if(OpenForum.fileExists( pageName + "/" + fileName )) {
        tab.src = fileName;
      } else {
        fileName = tab.id+".wiki.fragment";
        if(OpenForum.fileExists( pageName + "/" + fileName )) {
          tab.src = fileName;
        }
      }

    }
    if(!tab.script) {
      var fileName = pageName + "/" + tab.id+".js";
      if(OpenForum.fileExists( fileName )) {
        tab.script = fileName;
      }
    }

    tabsHtml += "<div id='" + tab.id + "' style='height: 100%;'></div>";
  }
  OpenForum.scan();
  OpenForum.setElement(tabsElementId,tabsHtml);
  //OpenForum.crawl(document.body);

  for(var i in tabs) {
    var tab = tabs[i];
    OpenForum.addTab(tab.id);
    tab.status = "loading";
  }

  var dependency = DependencyService.createNewDependency();
  var hasScriptDependencies = false;

  var waitForTabReady = function(tab) {
    if(OpenForum.evaluate(tab.init)===false) {
      setTimeout( function() { waitForTabReady(tab); },500 );
    } else {
      tab.ready = true;
    }
  };

  var renderTabContents = function(newContent,tab) {
    tab.content = newContent;
    tab.ready = false;
    if(tab.script) {
      dependency.addDependency( tab.script );
      hasScriptDependencies = true;
      tab.callback = function() {
        OpenForum.debug("INFO","Loaded script for tab " + tab.id + " script:" + tab.script );

        OpenForum.debug("INFO","Adding content for tab " + tab.id);
        OpenForum.setElement(tab.id, tab.content);
        OpenForum.crawl(document.getElementById(tab.id));
        if(tab.init) {
          OpenForum.debug("INFO","Running initiallise function for " + tab.id + " " + tab.init);
          if( OpenForum.evaluate(tab.init)===false) {
            waitForTabReady( tab );
          } else { 
            tab.ready = true;
          }
        } else { 
          tab.ready = true;
        }
      };
    } else {
      OpenForum.debug("INFO","Adding content for tab " + tab.id);
      OpenForum.setElement(tab.id, tab.content);
      OpenForum.crawl(document.getElementById(tab.id));
      if(tab.init) {
        OpenForum.debug("INFO","Running initiallise function for " + tab.id + " " + tab.init);
        if( OpenForum.evaluate(tab.init)===false) {
          waitForTabReady( tab );
        } else { 
          tab.ready = true;
        }
      } else { 
        tab.ready = true;
      }
    }
    tab.status = "loaded";
  };

  for(var i in tabs) {
    var tab = tabs[i];
    if(!tab.pageName) tab.pageName = pageName;
    if(tab.script) hasScriptDependencies = true;
    if(tab.src) {
      OpenForum.debug("INFO","Loading tab " + tab.id );

      if(tab.src.indexOf(".wiki")==-1) {
        OpenForum.loadFile(
          tab.pageName+"/"+tab.src,
          function(tab) {
            return function(response) {
              renderTabContents(response,tab);
            };
          }(tab),true
        );
      } else {
        JSON.post("/OpenForum/Actions/RenderWikiData","render","json=true&pageName="+tab.pageName+"&sourcePageName="+tab.pageName+"&fileName="+tab.src).onSuccess( 
          function(tab) {
            return function(response) {
              renderTabContents(response,tab);
            };
          }(tab)
        ).go();
      }
    } else if(tab.elementId) {
      var element = document.getElementById(tab.elementId);
      var content = element.innerHTML;
      //element.innerHTML = "";
      renderTabContents(content,tab);
    }
  }

  var doOnLoad = function() {
    for(var i in tabs) {
      var tab = tabs[i];
      if(tab.callback) tab.callback();

      OpenForum.addHashCall(
        escape(tab.title),
        function(tabId) {
          return function() {
            if( ignoreHash ) {
              ignoreHash=false;
              return;
            }
            pageTabs.showTab(tabId); 
          }; 
        }(tab.id));
    }
    checkAllTabsReady();
  };

  var checkAllTabsReady = function() {
    for(var i in tabs) {
      var tab = tabs[i];
      if(tab.ready===false) {
        OpenForum.debug("INFO","Waiting for tab " + tab.id + " to be ready");
        setTimeout(checkAllTabsReady,100);
        return;
      }
    }
    OpenForum.debug("INFO","All tabs ready");
    if(callback) callback();

    if(OpenForum.hash != "") {
      OpenForum._onHash(OpenForum.hash);
    } else { 
        pageTabs.showTab( tabs[0].id );
      }
    };

    var checkAllTabContentLoaded = function() {
      for(var i in tabs) {
        var tab = tabs[i];
        if(tab.status=="loading") {
          OpenForum.debug("INFO","Waiting for tab " + tab.id + " to load");
          setTimeout(checkAllTabContentLoaded,100);
          return;
        }
      }
      OpenForum.debug("INFO","Loading tab scripts");
      dependency.loadDependencies();
    };

    if(hasScriptDependencies) {
      dependency.setOnLoadTrigger(doOnLoad);
    } else {
      setTimeout(doOnLoad,100);
    }

    checkAllTabContentLoaded();

    self.showTab = function(id) {
      for(var i in tabs) {
        var tab = tabs[i];
        if(tab.id==id && (document.getElementById(tab.button)==null || document.getElementById(tab.button).className==="active") ) return;
      }

      OpenForum.showTab(id);

      var selectedTab;
      for(var i in tabs) {
        var tab = tabs[i];
        var hasOptions = "";
        if(tab.options) {
          hasOptions = "has-dropdown not-click";
        }
        if(tab.id==id) {
          selectedTab = tab;
          document.getElementById(tab.button).className=hasOptions+" active";
          window.location.hash = selectedTab.title;
          ignoreHash = true;
        } else {
          document.getElementById(tab.button).className=hasOptions;
        }
      }
      if(selectedTab && selectedTab.refresh) {
        selectedTab.refresh();
      }
    };
  }