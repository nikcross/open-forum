var tabsTree = [];

function addTreeLeaf(attachments,attachmentId) {
  tabsTree.addChild( attachments[attachmentId].fileName, {
    icon: "brick",
    id: attachmentId,
    actions: [
      new Action( function(node) { openAttachment( node.getAttribute("id") ); },"pencil" ),
      new Action( function(node) { saveAttachment( node.getAttribute("id") ); },"disk" ),
      new Action( function(node) { deleteAttachment( node.getAttribute("id") ); },"cancel" )
    ]
  }
                   );

  tabsTree.render();
}


function addAttachmentToTree(attachmentId) {
  var extension = attachments[attachmentId].fileName;
  extension = extension.substring(extension.lastIndexOf("."));
  var actions = [];
  if(extension === ".link") {
    actions.push( new Action( function(node) { openAttachment( node.getAttribute("id") ); },"pencil" ) );
    actions.push( new Action( function(node) { saveAttachment( node.getAttribute("id") ); },"disk" ));
    actions.push(  new Action( function(node) { deleteAttachment( node.getAttribute("id") ); },"cancel" ));
    actions.push( new Action( function(node) { forkAttachment( node.getAttribute("id") ); },"arrow_divide" ) );
  } else {
    actions.push( new Action( function(node) { openAttachment( node.getAttribute("id") ); },"pencil" ) );
    actions.push( new Action( function(node) { saveAttachment( node.getAttribute("id") ); },"disk" ));
    actions.push(  new Action( function(node) { deleteAttachment( node.getAttribute("id") ); },"cancel" ));
  }

  tabsTree.addChild( attachments[attachmentId].fileName, {
    icon: "brick",
    id: attachmentId,
    actions: actions
  }
                   );
}

function showTab(editorId) {
  var editor = editorList[editorId];
  OpenForum.showTab("editor"+editorId);
  for(var edId in editorList) {
    editorList[edId].tabButtonStyle="";
  }
  editor.tabButtonStyle = "active";
  documentation = [];
  if(editor.editor && editor.editor!==null) {
    editor.editor.refresh();
      if(editor.editor.documentation && editor.editor.documentation!==null) {
        documentation = editor.editor.documentation;
      }
  }
  currentEditor = editor;
}

function closeTab(tabId) {
  var editor = editorList[tabId];
  editorList.splice(tabId,1);
  editor.attachment.action = "openAttachment";
  editor.attachment.actionName = "Open Editor";
}

