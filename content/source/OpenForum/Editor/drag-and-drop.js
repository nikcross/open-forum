
function allowDrop(event) {
    event.preventDefault();
}

function drag(attachmentId) {
    event.dataTransfer.setData("text", attachmentId);
}

function drop(event,pageName) {
    event.preventDefault();
    var attachmentId = event.dataTransfer.getData("text");
  if(pageName==="#parentPage") {
    pageName = parentPage;
  }
  
  attachmentPageToCopy=attachments[attachmentId].pageName;
  attachmentToCopy=attachments[attachmentId].fileName;
  attachmentPageToCopyTo=pageName;
  attachmentToCopyTo=attachments[attachmentId].fileName;
  
  $('#OpenForumCopyAttachmentModal').foundation('reveal', 'open');
}
