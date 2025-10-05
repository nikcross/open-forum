/*
* Author: 
* Description: 
*/
OpenForum.includeScript("/OpenForum/Javascript/OpenForumServer/File/File.js");
OpenForum.includeScript("/OpenForum/Javascript/Application/Panels.js");

OpenForum.addInitialiser( function() {
  Panels.makeResizeable(document.getElementById("rightPanel"),document.getElementById("leftPanel"));
  createFileTree("tree","/Development");
});

function createFileTree(id,root) {
  var tree = new Tree(id,"Loading...","",augmentTree);

  JSON.get("/OpenForum/Javascript/Tree","getPageTree","pageName="+root).onSuccess(
    function(result) {

      tree.setJSON(result);
      tree.render();
      tree.getRoot().expand();
      tree.init();

      showUnpublished();
    }
  ).go();

  return tree;
}

function augmentTree(result) {
  //augmentLeaves(result.leaves);
  augmentLeaf(result);
}

function augmentLeaves(leaves) {
  for(var i=0;i<leaves.length;i++) {
    var leaf = leaves[i];
    augmentLeaf(leaf);
  }
}

var popupView = {
  title: "",
  content: ""
};

if( document.getElementById("popupView") == null ) {
  OpenForum.loadFile( "/OpenForum/AddOn/Publisher/popup-view.html.fragment", function(html) {
    var div = document.createElement( "div" );
    div.innerHTML = html;
    document.body.appendChild( div );
    OpenForum.scan( document.body );
  });
}

function showPageChanges( pageName ) {
  OFX.get("/OpenForum/AddOn/Publisher").withAction("getPublishedPageDifferences").withData( { pageName: pageName } ).onSuccess( function(response) {
    popupView.title= pageName + " Page Changes";
    popupView.content = "<ul>";
    for( var p in response.data) {
      var entry = response.data[p];
      var changeDate = "";
      if( entry.dev.changed > entry.pub.changed ) {
        changeDate = new Date( parseInt(entry.dev.changed,10) ).toDateString();
      } else {
        changeDate = "" + new Date( parseInt(entry.pub.changed,10) ).toDateString() + " Published Page AHEAD";
      }
      popupView.content += "<li>" + entry.dev.pageName + "/" + entry.dev.fileName + " on " + changeDate + "</li>";
    }
    popupView.content += "</ul>";
    $('#popupView').foundation('reveal', 'open');
  }
                                                                                                                              ).go();
}

function showUnpublished() {
  JSON.get("/OpenForum/AddOn/Publisher","getNeedsPublishing").onSuccess(
    function (result) {
      $("a").each( 
        function() { 
          if(this.attributes.href && this.attributes.href.nodeValue &&
             this.attributes.href.nodeValue.indexOf("/")==0
            ) {
            for(var i=0;i<result.data.length;i++) {
              if("/Development"+result.data[i].pageName == this.attributes.href.nodeValue) {
                if(result.data[i].alert) {
                  this.innerHTML = "<span title='Published version is ahead of Development Version' style='color: red;'>" +
                    this.innerHTML + 
                    "<sup style='padding-right: 10px;'>!!</sup></span><a href='#' onClick='publish(\"" + 
                    this.attributes.href.nodeValue + 
                    "\",true); return false;'>" +
                    "<i style='background: url(&quot;/OpenForum/Images/icons/png/page_go.png&quot;) "+
                    "no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;' title='Publish'></i></a>" +

                    "<a href='#' onClick='checkForDifferences(\"" + 
                    this.attributes.href.nodeValue + 
                    "\"); return false;'>" +
                    "<i style='background: url(&quot;/OpenForum/Images/icons/png/find.png&quot;) "+
                    "no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;' title='Check Differences'></i></a>";

                } else if(result.data[i].liveTS==-1) {
                  this.innerHTML = "<span title='Not published yet' style='color: red;'>" +
                    this.innerHTML + 
                    "<sup style='padding-right: 10px;'>**</sup></span><a href='#' onClick='publish(\"" + 
                    this.attributes.href.nodeValue + 
                    "\",true); return false;'>" +
                    "<i style='background: url(&quot;/OpenForum/Images/icons/png/page_go.png&quot;) "+
                    "no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;' title='Publish'></i></a>"; 
                } else {
                  var devDate = new Date(result.data[i].devTS);
                  devDate = devDate.toDateString() + " " + devDate.toLocaleTimeString();
                  var liveDate = new Date(result.data[i].liveTS);
                  liveDate = liveDate.toDateString() + " " + liveDate.toLocaleTimeString();
                  this.innerHTML = "<span title='Latest version not published. Live date " + liveDate + 
                    " Dev date " + devDate + "' style='color: red;'>" + this.innerHTML + 
                    "<sup style='padding-right: 10px;'>*</sup></span><a href='#' onClick='publish(\"" + 
                    this.attributes.href.nodeValue + 
                    "\",true); return false;' ><i style='background: url(&quot;/OpenForum/Images/icons/png/page_go.png&quot;) "+
                    "no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;' title='Publish'></i></a>" +
                    "<a href='#' onClick='checkForDifferences(\"" + 
                    this.attributes.href.nodeValue + 
                    "\"); return false;'>" +
                    "<i style='background: url(&quot;/OpenForum/Images/icons/png/find.png&quot;) "+
                    "no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;' title='Check Differences'></i></a>";          
                }
                break;
              }
            }

            if( (!this.attributes.target || (this.attributes.target && this.attributes.target.nodeValue=="newTab")) && this.attributes.href.nodeValue.indexOf("?")==-1) {
              this.innerHTML += "<a href='" + this.attributes.href.nodeValue + "?edit' style='padding-left: 10px;'  title='Edit Page' target='editor'><i style='background: url(&quot;/OpenForum/Images/icons/png/pencil.png&quot;) "+
                "no-repeat scroll; min-width: 16px; min-height: 16px; display: inline-block;'></i></a>";
            }
          }
        } 
      );
    }
  ).go();

}

function checkForDifferences(pageName) {
  window.open( "/OpenForum/AddOn/Publisher?pageName=" + pageName, "compare" );
}

function publish(pageName,practice) {
  JSON.get("/OpenForum/AddOn/Publisher","publish","pageName="+pageName+"&practice="+practice).onSuccess(
    function(response) {
      var htmlData = "<div style='overflow: scroll; height: 400px;'>"+response.data.notes+"</div>";
      if(practice===true) {
        htmlData += "<a class='button round' href='#' onclick='publish(\"" + pageName + "\",false)'>Complete Publication of "+response.data.publishedPageName+"</a>";
      } else {
        htmlData += "<a class='button round' href='" + response.data.publishedPageName + "' target='published'>View Published Page</a>";
      }
      popupView.title = "Publish "+pageName+" to "+response.data.publishedPageName;
      popupView.content = htmlData;
      OpenForum.scan( document.body );
      $(document).foundation();
      $('#popupView').foundation('reveal', 'open');
    }).go();
}

function augmentLeaf(leaf) {
  if(leaf.attributes.type=="page" && leaf.attributes.actions) {
    leaf.attributes.actions.push(
      {
        fn: "function(node){ publish(node.getAttribute('pageName'),true); }",
        icon: "page_go",
        toolTip: "Publish"
      }
    );
    augmentLeaves(leaf.leaves);
  }
}


