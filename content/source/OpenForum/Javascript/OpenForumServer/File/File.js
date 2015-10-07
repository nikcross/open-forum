OpenForum.file = {};
OpenForum.file.deleteAttachmentNoBackup = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","deleteAttachmentNoBackup","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=deleteAttachmentNoBackup&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.getAttachmentTimestamp = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","getAttachmentTimestamp","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=getAttachmentTimestamp&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.getAttachmentsForPage = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","getAttachmentsForPage","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=getAttachmentsForPage&"+"arg0="+arg0);
	}
};

OpenForum.file.saveAttachmentNoBackup = function(arg0,arg1,arg2,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","saveAttachmentNoBackup","arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=saveAttachmentNoBackup&"+"arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2);
	}
};

OpenForum.file.incrementAttachment = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","incrementAttachment","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=incrementAttachment&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.unZipAttachment = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","unZipAttachment","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=unZipAttachment&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.appendStringToFile = function(arg0,arg1,arg2,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","appendStringToFile","arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=appendStringToFile&"+"arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2);
	}
};

OpenForum.file.getAttachmentSize = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","getAttachmentSize","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=getAttachmentSize&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.attachmentExists = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","attachmentExists","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=attachmentExists&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.getPageInheritedFilePath = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","getPageInheritedFilePath","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=getPageInheritedFilePath&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.zipPage = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","zipPage","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=zipPage&"+"arg0="+arg0);
	}
};

OpenForum.file.getAttachment = function(arg0,arg1,arg2,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","getAttachment","arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=getAttachment&"+"arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2);
	}
};

OpenForum.file.getAttachment = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","getAttachment","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=getAttachment&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.isImageAttachment = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","isImageAttachment","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=isImageAttachment&"+"arg0="+arg0);
	}
};

OpenForum.file.pageExists = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","pageExists","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=pageExists&"+"arg0="+arg0);
	}
};

OpenForum.file.getAttachmentOutputStream = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","getAttachmentOutputStream","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=getAttachmentOutputStream&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.getPageInheritedFileAsString = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","getPageInheritedFileAsString","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=getPageInheritedFileAsString&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.getAttachmentInputStream = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","getAttachmentInputStream","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=getAttachmentInputStream&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.copyAttachment = function(arg0,arg1,arg2,arg3,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","copyAttachment","arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2+"&"+"arg3="+arg3).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=copyAttachment&"+"arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2+"&"+"arg3="+arg3);
	}
};

OpenForum.file.appendToPageSource = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","appendToPageSource","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=appendToPageSource&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.saveAttachment = function(arg0,arg1,arg2,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/OpenForumServer/File","saveAttachment","arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/OpenForumServer/File?action=saveAttachment&"+"arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2);
	}
};
