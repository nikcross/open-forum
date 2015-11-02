var attachments = [];

function setAttachments(response) {
  attachments = response.attachments;
  for(var ai in attachments) {
    attachments[ai].id = ai;
    attachments[ai].action = "openAttachment";
    attachments[ai].actionName = "Open Editor";
    
    //addAttachmentToTree(ai);
  }
  //tabsTree.render();
    
  OpenForum.scan(document.body);

  openForFlavour();
}

function openFile() {
  var newAttachment = {pageName: openFilePageName, fileName: openFileName, id: attachments.length, action: "openAttachment", actionName: "OpenEditor"};
  attachments.push(newAttachment);
  openAttachment(newAttachment.id);
}


function loadUpdatedFilesList() {
//  document.getElementById("filesList").innerHTML="Loading...";
  JSON.get("/OpenForum/Actions/Attachments","","pageName="+openFilePageName).onSuccess(updateFilesList).go();
}

function updateFilesList(result) {
	attachements = result.attachments;
}

function forkAttachment(attachmentId) {
  var sourceAttachment = attachments[attachmentId];
  //alert("Fork"+sourceAttachment.pageName+" : "+sourceAttachment.fileName);
  var result = JSON.parse( OpenForum.loadFile("/OpenForum/Actions/ForkLink?pageName="+sourceAttachment.pageName+"&fileName="+sourceAttachment.fileName ));
  
 var newAttachment = {pageName: result.pageName, fileName: result.newFileName, id: attachments.length, action: "openAttachment", actionName: "OpenEditor"};
 attachments.push(newAttachment);
 openAttachment(newAttachment.id);
}


function saveAttachments() {
  showStatus("Saving all changes");
  if(hasChanges()) {
      for(var attachmentIndex in attachments) {
        if(attachments[attachmentIndex].editor && attachments[attachmentIndex].editor.changed=="*") {
          saveAttachment(attachmentIndex);
        }
      }
      showStatus("All changes saved.");
  } else {
    showStatus("No files have been changed.");
  }
}


function saveAttachment(attachmentIndex) {
  var fileToSave = attachments[attachmentIndex].pageName + "/" + attachments[attachmentIndex].fileName;
  var data = attachments[attachmentIndex].editor.editor.getValue();
  var result = OpenForum.saveFile(fileToSave,data);
  if(result.saved===true && attachments[attachmentIndex].editor) {
    attachments[attachmentIndex].editor.changed=" ";
    showStatus("Saved "+fileToSave);
  } else {
    showStatus("Failed to save "+fileToSave+" :"+result);
  }
}

function createAttachment() {
  var ai = attachments.length;
  attachments.push({});
  attachments[ai].id = ai;
  attachments[ai].fileName = newAttachmentName;
  attachments[ai].pageName = pageName;
  attachments[ai].action = "openAttachment";
  attachments[ai].actionName = "Open Editor";

  var fileToSave = pageName + "/" + attachments[ai].fileName;
  var data = "";
  var result = OpenForum.saveFile(fileToSave,data);
  if(result.saved===true) {
    showStatus("Created "+fileToSave);
    openAttachment(ai);
  } else {
    showStatus("Failed to create "+fileToSave+" :"+result);
  }
}

function findAttachment(fileName) {
  for(var ai in attachments) {
    if(attachments[ai].fileName==fileName) {
      return attachments[ai];
    }
  }
  return null;
}

function openAttachments(fileNames) {
  for(var i in fileNames) {
    var fileName = fileNames[i];
    var attachment = findAttachment(fileName);
    if(attachment!==null) {
      openAttachment(attachment.id);
    } else if( newPage ) {
      newAttachmentName = fileName;
      createAttachment();
    }
  }
}

function openAttachment(attachmentId) {
  var fileName = attachments[attachmentId].fileName;
  var pageName = attachments[attachmentId].pageName;

  var flavour = "text";
  if(fileName.indexOf(".js")==fileName.length-3) {
    flavour = "javascript";
  } else if(fileName.indexOf(".sjs")==fileName.length-4) {
    flavour = "javascript";
  } else if(fileName.indexOf(".json")==fileName.length-5) {
    flavour = "javascript";
  } else if(fileName.indexOf(".css")==fileName.length-4) {
    flavour = "css";
  } else if(fileName.indexOf(".wiki")==fileName.length-5) {
    flavour = "html";
  } else if(fileName.indexOf(".content")==fileName.length-8) {
    flavour = "html";
  } else if(fileName.indexOf(".html")==fileName.length-5) {
    flavour = "html";
  } else if(fileName.indexOf(".html.template")==fileName.length-14) {
    flavour = "html";
  } else if(fileName.indexOf(".html.fragment")==fileName.length-14) {
    flavour = "html";
  } else if(fileName.indexOf(".xml")==fileName.length-4) {
    flavour = "xml";
  }

  var editor = addEditor(pageName,fileName,flavour);
  showTab(editor.id);

  editor.attachment = attachments[attachmentId];
  attachments[attachmentId].action = "saveAttachment";
  attachments[attachmentId].actionName = "Save";
  attachments[attachmentId].editor = editor;
  
  //addTreeLeaf(attachments,attachmentId);
}

