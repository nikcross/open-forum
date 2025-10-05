/*
* Author: 
* Description: 
*/
var Files = new function() {
  var self = this;
  var tree;
  var elementId;
  var callBack;
  var fileExtension = ".*";

  var initialiseModal = function() {
    var modalContent = OpenForum.loadFile("/OpenForum/Javascript/Application/files.html.fragment");
    document.getElementById(elementId).innerHTML = modalContent;
    OpenForum.crawl(document.getElementById(elementId));
  };

  var initialiseTree = function() {
    tree = new Tree("Files.fileTree","Loading...","",modifyTreeNode);
    JSON.get("/OpenForum/Javascript/Tree","getPageTree","pageName="+self.pageName+"&match=.*\."+fileExtension).onSuccess(
      function(result) {
        tree.setJSON(result);
        tree.render();
        tree.getRoot().expand();
        tree.init();
      }
    ).go();
  };

  var modifyTreeNode  =function(data) {
    delete data.attributes.link;
    if(data.attributes.actions) {
      var actions = data.attributes.actions;
      var newActions = [];
      for(var a = 0;a<actions.length;a++) {
        if(data.attributes.type==="more") {
          newActions.push(actions[a]);
        } else if(data.attributes.type==="file" && actions[a].icon==="pencil") {
          actions[a].fn = "function(node) { Files.openFile('"+data.attributes.pageName+"','"+data.attributes.fileName+"'); }";
          newActions.push(actions[a]);
        }
      }
      data.attributes.actions = newActions;
    }

    for(var l=0;l<data.leaves.length;l++) {
      modifyTreeNode(data.leaves[l]);
    }
  };

  self.fileTree = {};
  self.newFileName = "";
  self.pageName = "/";
  var waitToUpdateTree;

  self.updateTreeView = function(inputField) {
    var newFileName = inputField.value;
    if(newFileName.indexOf('~')==0) {
      newFileName = "/OpenForum/Users/"+currentUser+"/";
      inputField.value = newFileName;
    }
    if(newFileName.indexOf("/")===0) {
      var newPageName = newFileName.substring(0,newFileName.lastIndexOf("/"));
      if(newPageName!==self.pageName) {

        //Stop tree updateing too fast
        if(waitToUpdateTree) clearTimeout(waitToUpdateTree);
        waitToUpdateTree = setTimeout( function() {
          self.pageName = newPageName;
          initialiseTree();
        },2000);
      }
    }
  };

  self.createNew = function(fileName,keyEvent) {  
    if(keyEvent) {
      if(keyEvent.charCode!=13) {
        return;
      }
    }

    self.pageName = fileName.substring(0,fileName.lastIndexOf("/"));
    self.newFileName = fileName.substring(fileName.lastIndexOf("/")+1);
    
    self.openFile(self.pageName,self.newFileName);
  };

  self.openFileSelect = function(callBackFn,newPageName,newElementId) {
    if(newPageName) self.pageName = newPageName;
    if(newElementId) elementId = newElementId;
    callBack = callBackFn;
    if(!tree) {
      initialiseModal();
      initialiseTree();
    }
    $("#filesOpenModal").foundation('reveal', 'open');
  };

  self.openFile = function( pageName,fileName ) {
    $("#filesOpenModal").foundation('reveal', 'close');
    callBack(pageName,fileName);
  };

  self.init = function(newPageName,newElementId) {
    self.pageName = newPageName;
    elementId = newElementId;
    initialiseModal();
    initialiseTree();
  };
};