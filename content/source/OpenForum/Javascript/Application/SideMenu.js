/*
* Author: 
* Description: 
*
* OpenForum.includeScript("/OpenForum/Javascript/Application/SideMenu.js");

{
  "sideMenu": [
    { "view": "view title",
    	"id":"view id",
        "script": "script file name" (optional)
        "src": "view html or wiki source name (optional)"
        "default": (optional true/false)
        "pageName": (optional)
        "init": (optional script to run on view loaded)
        "content": (generated)
        "status": (generated)
        "ready":
        "callback":
        },
    { "category": "category title", "views": [
      { "view": "view title", "id": "view id" }
    ]}
  ]
}

*/
if( typeof OpenForum.sideViews == "undefined" ) {
  OpenForum.sideViews = [];
}

function SideMenu(menuElementId,applicationViewId,sideMenu,callback) {
  var self = this;
  var index = OpenForum.sideViews.length;
  OpenForum.sideViews[index] = self;

  var selectedView = {id: ""};
  //Ignore hash change on showView call to stop infinite regression
  var ignoreHash = false;

  OpenForum.scan();

  var viewsHtml = "";
  var viewList = [];
  var defaultView = null;
  for(var i in sideMenu) {
    var part = sideMenu[i];
    if( part.category ) {
      viewsHtml += "<li><label>" + part.category + "</label></li>";

      for(var j in part.views) {
        var cpart = part.views[j];
        if(cpart.view) {
          viewsHtml += "<li><a href=\"#\" onClick=\"OpenForum.sideViews["+index+"].showView('" + cpart.id + "'); return false;\">" + cpart.view + "</a></li>";
          viewList.push( cpart );
          if( cpart.default ) {
            defaultView = cpart;
          }
        }

        if(!cpart.src) {
          var fileName = cpart.id+".html.fragment";
          if(OpenForum.fileExists( pageName + "/" + fileName )) {
            cpart.src = fileName;
          } else {
            fileName = cpart.id+".wiki.fragment";
            if(OpenForum.fileExists( pageName + "/" + fileName )) {
              cpart.src = fileName;
            }
          }

        }
        if(!cpart.script) {
          var fileName = pageName + "/" + cpart.id+".js";
          if(OpenForum.fileExists( fileName )) {
            cpart.script = fileName;
          }
        }
      }
    } else if(part.view) {
      viewsHtml += "<li><a href=\"#\" onClick=\"OpenForum.sideViews["+index+"].showView('" + part.id + "'); return false;\">" + part.view + "</a></li>";
      viewList.push( part );
      if( part.default ) {
        defaultView = part;
      }

      if(!part.src) {
        var fileName = part.id+".html.fragment";
        if(OpenForum.fileExists( pageName + "/" + fileName )) {
          part.src = fileName;
        } else {
          fileName = part.id+".wiki.fragment";
          if(OpenForum.fileExists( pageName + "/" + fileName )) {
            part.src = fileName;
          }
        }

      }
      if(!part.script) {
        var fileName = pageName + "/" + part.id+".js";
        if(OpenForum.fileExists( fileName )) {
          part.script = fileName;
        }
      }
    }
  }
  OpenForum.scan();
  OpenForum.setElement(menuElementId,viewsHtml);
  //OpenForum.crawl(document.body);


  var html = "";
  for(var i in viewList) {
    var view = viewList[i];
    html += "<div id='" + view.id + "' style='display: none;'>";
    html += "" + view.id;
    html += "</div>";
  }
  OpenForum.setElement( applicationViewId, html );

  for(var i in viewList) {
    var view = viewList[i];
    OpenForum.addTab(view.id);
    view.status = "loading";
  }

  var dependency = DependencyService.createNewDependency();
  var hasScriptDependencies = false;

  var waitForViewReady = function(view) {
    if(OpenForum.evaluate(view.init)===false) {
      setTimeout( function() { waitForViewReady(view); },500 );
    } else {
      view.ready = true;
    }
  };

  var renderViewContents = function(newContent,view) {
    view.content = newContent;
    view.ready = false;
    if(view.script) {
      dependency.addDependency( view.script );
      hasScriptDependencies = true;
      view.callback = function() {
        OpenForum.debug("INFO","Loaded script for view " + view.id + " script:" + view.script );

        OpenForum.debug("INFO","Adding content for view " + view.id);
        OpenForum.setElement(view.id, view.content);
        OpenForum.crawl(document.getElementById(view.id));
        if(view.init) {
          OpenForum.debug("INFO","Running initiallise function for " + view.id + " " + view.init);
          if( OpenForum.evaluate(view.init)===false) {
            waitForViewReady( view );
          } else { 
            view.ready = true;
          }
        } else { 
          view.ready = true;
        }
      };
    } else {
      OpenForum.debug("INFO","Adding content for view " + view.id);
      OpenForum.setElement(view.id, view.content);
      OpenForum.crawl(document.getElementById(view.id));
      if(view.init) {
        OpenForum.debug("INFO","Running initiallise function for " + view.id + " " + view.init);
        if( OpenForum.evaluate(view.init)===false) {
          waitForViewReady( view );
        } else { 
          view.ready = true;
        }
      } else { 
        view.ready = true;
      }
    }
    view.status = "loaded";
  };

  for(var i in viewList) {
    var view = viewList[i];
    if(!view.pageName) view.pageName = pageName;
    if(view.script) hasScriptDependencies = true;
    if(view.src) {
      OpenForum.debug("INFO","Loading view " + view.id );

      if(view.src.indexOf(".wiki")==-1) {
        OpenForum.loadFile(
          view.pageName+"/"+view.src,
          function(view) {
            return function(response) {
              renderViewContents(response,view);
            };
          }(view),true
        );
      } else {
        JSON.post("/OpenForum/Actions/RenderWikiData","render","json=true&pageName="+view.pageName+"&sourcePageName="+view.pageName+"&fileName="+view.src).onSuccess( 
          function(view) {
            return function(response) {
              renderViewContents(response,view);
            };
          }(view)
        ).go();
      }
    } else if(view.elementId) {
      var element = document.getElementById(view.elementId);
      var content = element.innerHTML;
      //element.innerHTML = "";
      renderViewContents(content,view);
    }
  }

  var checkAllViewsReady = function() {
    for(var i in viewList) {
      var view = viewList[i];
      if(view.ready===false) {
        OpenForum.debug("INFO","Waiting for view " + view.id + " to be ready");
        setTimeout(checkAllViewsReady,100);
        return;
      }
    }
    OpenForum.debug("INFO","All views ready");
    if(callback) callback();

    OpenForum._onHash(OpenForum.hash);
  };

  var checkAllViewContentLoaded = function() {
    for(var i in viewList) {
      var view = viewList[i];
      if(view.status=="loading") {
        OpenForum.debug("INFO","Waiting for view " + view.id + " to load");
        setTimeout(checkAllViewContentLoaded,100);
        return;
      }
    }
    OpenForum.debug("INFO","Loading view scripts");
    dependency.loadDependencies();
  };

  var doOnLoad = function() {
    for(var i in viewList) {
      var view = viewList[i];
      if(view.callback) view.callback();

      OpenForum.addHashCall(
        escape(view.title),
        function(viewId) {
          return function() {
            if( ignoreHash ) {
              ignoreHash=false;
              return;
            }
            self.showView(viewId); 
          }; 
        }(view.id));
    }
    checkAllViewsReady();
  };

  if(hasScriptDependencies) {
    dependency.setOnLoadTrigger(doOnLoad);
  } else {
    setTimeout(doOnLoad,100);
  }

  checkAllViewContentLoaded();

  self.setViewRefresh = function(id, refreshFn) {
    for(var i in viewList) {
      var view = viewList[i];
      if(view.id==id) {
        view.refresh = refreshFn;
      }
    }
  };

  self.setViewClose = function(id, closeFn) {
    for(var i in viewList) {
      var view = viewList[i];
      if(view.id==id) {
        view.close = closeFn;
      }
    }
  };

  self.closeOnShow = function(state) {
    $(document).foundation({
      offcanvas : {
        // Sets method in which offcanvas opens.
        // [ move | overlap_single | overlap ]
        open_method: 'move', 
        // Should the menu close when a menu link is clicked?
        // [ true | false ]
        close_on_click : state
      }
    });
  };

  self.showView = function(id) {
    if(id == selectedView.id) {
      return;
    }

    OpenForum.showTab(id);

    for(var i in viewList) {
      var view = viewList[i];
      if(view.id==selectedView.id) {
        if( selectedView.close ) {
          selectedView.close();
        }
      }
    }

    for(var i in viewList) {
      var view = viewList[i];
      if(view.id==id) {
        selectedView = view;
        window.location.hash = selectedView.view;
        ignoreHash = true;
      }
    }
    if(selectedView && selectedView.refresh) {
      selectedView.refresh();
    }
  };

  self.addMenuOption = function( functionText, label, icon ) {
    document.getElementById("offCanvasMenu").innerHTML += "<li>"+
      "<a href=' ' onclick='" + functionText + "; return false;'>"+
      "<img style='width: 32px; height: 32px;' src='https://open-forum.onestonesoup.org/OpenForum/Images/icons/png/" + icon + ".png'>&nbsp;"+
      label +
      "</a></li>";
  };

  //Default is close on show
  self.closeOnShow(true);

  if( defaultView != null ) {
    self.showView( defaultView.id );
  }
}