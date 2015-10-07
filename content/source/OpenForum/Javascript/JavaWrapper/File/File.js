OpenForum.file = {};
OpenForum.file.deleteAttachmentNoBackup = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","deleteAttachmentNoBackup","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=deleteAttachmentNoBackup&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.getAttachmentTimestamp = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","getAttachmentTimestamp","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=getAttachmentTimestamp&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.getAttachmentsForPage = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","getAttachmentsForPage","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=getAttachmentsForPage&"+"arg0="+arg0);
	}
};

OpenForum.file.saveAttachmentNoBackup = function(arg0,arg1,arg2,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","saveAttachmentNoBackup","arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=saveAttachmentNoBackup&"+"arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2);
	}
};

OpenForum.file.incrementAttachment = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","incrementAttachment","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=incrementAttachment&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.unZipAttachment = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","unZipAttachment","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=unZipAttachment&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.appendStringToFile = function(arg0,arg1,arg2,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","appendStringToFile","arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=appendStringToFile&"+"arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2);
	}
};

OpenForum.file.getAttachmentSize = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","getAttachmentSize","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=getAttachmentSize&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.attachmentExists = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","attachmentExists","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=attachmentExists&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.getPageInheritedFilePath = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","getPageInheritedFilePath","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=getPageInheritedFilePath&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.zipPage = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","zipPage","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=zipPage&"+"arg0="+arg0);
	}
};

OpenForum.file.getAttachment = function(arg0,arg1,arg2,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","getAttachment","arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=getAttachment&"+"arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2);
	}
};

OpenForum.file.getAttachment = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","getAttachment","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=getAttachment&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.isImageAttachment = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","isImageAttachment","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=isImageAttachment&"+"arg0="+arg0);
	}
};

OpenForum.file.pageExists = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","pageExists","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=pageExists&"+"arg0="+arg0);
	}
};

OpenForum.file.getAttachmentOutputStream = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","getAttachmentOutputStream","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=getAttachmentOutputStream&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.getPageInheritedFileAsString = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","getPageInheritedFileAsString","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=getPageInheritedFileAsString&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.getAttachmentInputStream = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","getAttachmentInputStream","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=getAttachmentInputStream&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.copyAttachment = function(arg0,arg1,arg2,arg3,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","copyAttachment","arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2+"&"+"arg3="+arg3).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=copyAttachment&"+"arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2+"&"+"arg3="+arg3);
	}
};

OpenForum.file.appendToPageSource = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","appendToPageSource","arg0="+arg0+"&"+"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=appendToPageSource&"+"arg0="+arg0+"&"+"arg1="+arg1);
	}
};

OpenForum.file.saveAttachment = function(arg0,arg1,arg2,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/File","saveAttachment","arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/File?action=saveAttachment&"+"arg0="+arg0+"&"+"arg1="+arg1+"&"+"arg2="+arg2);
	}
};

