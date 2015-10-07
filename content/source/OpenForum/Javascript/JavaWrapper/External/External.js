OpenForum.external = {};
OpenForum.external.getURLAsString = function(arg0,arg1,arg2,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/External","getURLAsString","arg0="+arg0&"arg1="+arg1&"arg2="+arg2).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/External?action=getURLAsString&"+"arg0="+arg0&"arg1="+arg1&"arg2="+arg2);
	}
};

OpenForum.external.getURLAsString = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/External","getURLAsString","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/External?action=getURLAsString&"+"arg0="+arg0);
	}
};

OpenForum.external.getURLAsFile = function(arg0,arg1,arg2,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/External","getURLAsFile","arg0="+arg0&"arg1="+arg1&"arg2="+arg2).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/External?action=getURLAsFile&"+"arg0="+arg0&"arg1="+arg1&"arg2="+arg2);
	}
};

OpenForum.external.getURLAsFile = function(arg0,arg1,arg2,arg3,arg4,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/External","getURLAsFile","arg0="+arg0&"arg1="+arg1&"arg2="+arg2&"arg3="+arg3&"arg4="+arg4).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/External?action=getURLAsFile&"+"arg0="+arg0&"arg1="+arg1&"arg2="+arg2&"arg3="+arg3&"arg4="+arg4);
	}
};

