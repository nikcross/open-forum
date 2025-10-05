
OpenForum.loadCSS("/OpenForum/AddOn/ContentEditor/page.css");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/BlockPrototype.js");
OpenForum.includeScript("/OpenForum/Javascript/OpenForumServer/File/File.js");
//OpenForum.includeScript("/OpenForum/Javascript/Application/Panels.js");
//OpenForum.includeScript("/OpenForum/AddOn/Publisher/development.js");
OpenForum.includeScript("/OpenForum/Javascript/Application/publish.js");
OpenForum.includeScript("/OpenForum/Javascript/CKEditor/ck-classic-editor.js");
OpenForum.includeScript("/OpenForum/AddOn/ContentEditor/ContentEditorClient.js");
OpenForum.includeScript("/OpenForum/AddOn/ImageProcessor/ImageProcessorClient.js");
//OpenForum.includeScript("/OpenForum/Javascript/CKEditor/ck-inline-editor.js");
//OpenForum.loadScript("https://cdn.ckeditor.com/ckeditor5/29.1.0/classic/ckeditor.js");

var version = "Content Editor v0.0.1";

/*var fileActions = [
  {name: "Save", decription:"Save Current Page", fn:"save", icon:"disk"},
  {name: "Preview", decription:"Open Current Page Preview", fn:"preview", icon:"eye"},
  {name: "Publish", decription:"Publish Current Page", fn:"publishPage", icon:"world_go"},
  {name: "New", decription:"Create a new page", fn:"createNewPage", icon:"page_add"}
];*/

var pagesList = [];

var defaultPageData = {
  pageName: "",
  title: "",
  block: "page",
  content: []
};

var pagesRoot = "/Develop"+"ment";
var pageCategories = [];
var newPageCategory = "";
var newPageFileName = "";
var newPageTitle = "";
var pageData = OpenForum.clone( defaultPageData );
var content = "";

var tree;

var blockEditors = [];
var blockEditor = {};
var activeEditors = {};
var holdingInstruction = null;

var images = {};
var imageCategories = [];
var imageCategory = "Photo";

OpenForum.init = function() {
  
  document.getElementById( "applicationView" ).style.height = (window.innerHeight-47)+"px";
  
  OpenForum.getObject("newPageTitle").addListener( createNewPageFileName );
  OpenForum.getObject("newPageCategory").addListener( createNewPageFileName );

  //Panels.makeResizeable(document.getElementById("rightPanel"),document.getElementById("leftPanel"));

  ContentEditorClient.getBlockEditors(  function(response){ 
    blockEditors=response.data;
  } );

  updatePagesList();

  updatePageCategories();

  updateImages();

  tree = new Tree("pageTree","","","");

  if(OpenForum.getParameter("pageName")!="") {

    var editPageName = OpenForum.getParameter("pageName");

    //Check for Development version
    OpenForum.runAsync(
      function() {
        if( OpenForum.fileExists( "/" + editPageName + "/page.content" ) ) {
          if( confirm( "A version of this page exists in Development. Would you like to switch to it ?" ) ) {
            editPage( "/" + editPageName );
          }
        }
      }
    );

    editPage( editPageName );
  }

  //OpenForum.hideElement("splash");
  //OpenForum.showElement("application");
};

function showPageTree( ) {
  $('#PageTreeModal').foundation('reveal', 'open');
}

function updatePagesList() {
  ContentEditorClient.getPages(  function(response) {
    pagesList = response.data;
  } );
}

function updatePageCategories() {
  OpenForum.loadJSON("/OpenForum/AddOn/ContentEditor/page-categories.json", function(data) {
    pageCategories = data;
  });
}

function selectImage( ) {
  $('#ImageSelectModal').foundation('reveal', 'open');
}

function updateImages() {
  OpenForum.scan();
  
  ImageProcessorClient.getImages( imageCategory, function(response) {
    var allImages = response.data;
    images = [];
    for(var c in allImages) {
      for(var i in allImages[c].images ) {
        images.push(  allImages[c].images[i] );
      }
    }
  });

  ImageProcessorClient.getCategories( function(response) {
    var list = response.data;
    imageCategories = [];
    for(var l in list) {
      imageCategories.push( list[l].name );
    }
  });
}

function openAdvancedEditor() {
  window.open("/OpenForum/Editor?pageName=" + pageData.pageName + "&overrideEditor=true", "advancedEditor");
}

function initialisePageEditor( data ) {
  pageData = data;
  //tree = new Tree("pageTree","Content Editor","","");
  document.title = "Editing: " + data.title + " at " + data.pageName;

  activeEditors = {};
  createBlockEditor( pageData.block, pageData, "pageEditor", "pageEditor", tree );
}

function loadBlockEditor( name, data, parentId, elementId, treeNode, callBack ) {
  blockEditor[name] = "loading";

  var className = name.toUpperCase().substring(0,1) + name.substring(1);

  blockEditor[name] = {
    pageName: "/OpenForum/AddOn/ContentEditor",
    scriptName: className + "BlockEditor.js",
    objectName: className + "BlockEditor"
  };
  OpenForum.addScript( blockEditor[name].pageName + "/" + blockEditor[name].scriptName)
    .then(
    function() {
      blockEditor[name].objectContstructor = OpenForum.evaluate( "block = "+blockEditor[name].objectName+";" );
      blockEditor[name].objectContstructor.definition = blockEditor[name];
      callBack( name, data, parentId, elementId, treeNode );
    }
  );
  //});
}

function createBlockEditor( name, data, parentId, elementId, treeNode ) {
  if( !blockEditor[name] ) {
    loadBlockEditor( name, data, parentId, elementId, treeNode, createBlockEditor );
    return;
  }
  new Process().waitFor( 
    function() { 
      return (blockEditor[name] != "loading" && typeof blockEditor[name].objectContstructor != "undefined"); 
    }
  ).then( function() {

    var newBlockEditor = new blockEditor[name].objectContstructor( data, parentId );
    data.blockEditor = newBlockEditor;
    var node = newBlockEditor.initTree( treeNode );
    newBlockEditor.initView( elementId );

    activeEditors[elementId] = newBlockEditor;
    var o = OpenForum.getObjects();
    for( var i in o ){ if(o[i]) o[i].reset(); }

    tree.getRoot().render();
    tree.expandAll();
    //node.expand();

  } ).run(); 
}

function setViewMode() { 
  for( var i in activeEditors) { activeEditors[i].setViewMode(); }
}

function editBlock( id ) {
  setViewMode();
  activeEditors[id].setEditMode();
}

/*
 * addBlock( instruction )
 * instruction = { action: "addAfter|addToTop", id: "id", section: "columnA|columnB" }
 * completeAddBlock(type)
*/
function addBlock( instruction ) {
  holdingInstruction = instruction;
  $('#BlockSelectModal').foundation('reveal', 'open');
}

function completeAddBlock(type) {
  setViewMode();
  $('#BlockSelectModal').foundation('reveal', 'close');
  if(holdingInstruction.callParent) {
    var parentId = activeEditors[holdingInstruction.id].getParentId();
    var parent = activeEditors[parentId];
    parent.addBlock( holdingInstruction, type );
  } else {
    activeEditors[holdingInstruction.id].addBlock( holdingInstruction, type );
  }
}

function moveBlockUp( id ) {
  var parentId = activeEditors[id].getParentId();
  var parent = activeEditors[parentId];
  parent.moveBlockUp( id );
}

function moveBlockDown( id ) {
  var parentId = activeEditors[id].getParentId();
  var parent = activeEditors[parentId];
  parent.moveBlockDown( id );
}

function removeBlock( id ) {
  var parentId = activeEditors[id].getParentId();
  var parent = activeEditors[parentId];
  parent.removeBlock( id );
}

function editPage( editPageName ) {
  OpenForum.scan();
  OpenForum.loadJSON(editPageName + "/data.json",initialisePageEditor);
}

function showMessage() {
  alert("Message");
}

function preview() {
  save();
  window.open('/OpenForum/Editor/Plugins/PagePreview?pageName='+pageData.pageName,'preivew');
}

function createNewPage() {
  $('#NewPageModal').foundation('reveal', 'open');
}

function createNewPageFileName() {
  OpenForum.scan();
  newPageFileName = newPageTitle.replace(/[^a-zA-Z\d\s]/g,"");
  var words = newPageFileName.split(" ");
  newPageFileName="";
  for(var i in words) {
    newPageFileName += words[i].toUpperCase().substring(0,1) + words[i].toLowerCase().substring(1);
  }
  newPageFileName = pagesRoot+ newPageCategory +"/"+newPageFileName;
}

function completeCreateNewPage() {
  $('#NewPageModal').foundation('reveal', 'close');

  //Validate new name

  //Check if save required

  var newPageData = OpenForum.clone( defaultPageData );
  newPageData.pageName = newPageFileName;
  newPageData.title = newPageTitle;

  OpenForum.saveJSON( newPageData.pageName + "/data.json", newPageData, function() {
    ContentEditorClient.convertHTMLPage( 
      newPageData.pageName, function() {
        updatePagesList();
        initialisePageEditor(newPageData);
      });
  });
}

function save() {
  setViewMode();
  OpenForum.scan();
  var saveData = OpenForum.clone( pageData );
  saveData.editor = "/OpenForum/AddOn/ContentEditor";

  OpenForum.saveJSON( pageData.pageName + "/data.json", saveData, function() {
    alert("Page Definition Saved");
  });

  var pageContent = pageData.blockEditor.render();
  pageContent = pageContent.replaceAll( "<br","\n<br" );
  OpenForum.saveFile( pageData.pageName + "/page.content", pageContent , function() {
    alert("Page Content Saved");
  });
}

function publishPage() {
  publish(pageData.pageName,true);
}

function highlight( elementId, state ) {
  if(state) {
    document.getElementById( elementId ).style.borderColor = "red";
  } else {
    document.getElementById( elementId ).style.borderColor = "white";
  }
}



