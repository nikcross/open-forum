OpenForum.js = {};
OpenForum.js.pageExists = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","pageExists","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=pageExists&"+"arg0="+arg0);
	}
};

OpenForum.js.getPageAttachmentAsString = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","getPageAttachmentAsString","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=getPageAttachmentAsString&"+"arg0="+arg0&"arg1="+arg1);
	}
};

OpenForum.js.getApi = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","getApi","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=getApi&"+"arg0="+arg0);
	}
};

OpenForum.js.getPageAttachmentAsXml = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","getPageAttachmentAsXml","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=getPageAttachmentAsXml&"+"arg0="+arg0);
	}
};

OpenForum.js.getPageAttachmentAsXml = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","getPageAttachmentAsXml","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=getPageAttachmentAsXml&"+"arg0="+arg0&"arg1="+arg1);
	}
};

OpenForum.js.getPageTags = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","getPageTags","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=getPageTags&"+"arg0="+arg0);
	}
};

OpenForum.js.startJavascript = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","startJavascript","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=startJavascript&"+"arg0="+arg0);
	}
};

OpenForum.js.getTemplateHelper = function(successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","getTemplateHelper",).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=getTemplateHelper&"+);
	}
};

OpenForum.js.getStringAsXml = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","getStringAsXml","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=getStringAsXml&"+"arg0="+arg0);
	}
};

OpenForum.js.refreshJarManager = function(successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","refreshJarManager",).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=refreshJarManager&"+);
	}
};

OpenForum.js.loadObject = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","loadObject","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=loadObject&"+"arg0="+arg0&"arg1="+arg1);
	}
};

OpenForum.js.getStringBuffer = function(successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","getStringBuffer",).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=getStringBuffer&"+);
	}
};

OpenForum.js.getObject = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","getObject","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=getObject&"+"arg0="+arg0&"arg1="+arg1);
	}
};

OpenForum.js.sleep = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Js","sleep","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Js?action=sleep&"+"arg0="+arg0);
	}
};

