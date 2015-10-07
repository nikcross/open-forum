OpenForum.wiki = {};
OpenForum.wiki.pageExists = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","pageExists","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=pageExists&"+"arg0="+arg0);
	}
};

OpenForum.wiki.rebuild = function(successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","rebuild").onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=rebuild");
	}
};

OpenForum.wiki.rebuild = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","rebuild","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=rebuild&"+"arg0="+arg0);
	}
};

OpenForum.wiki.validateWikiTitle = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","validateWikiTitle","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=validateWikiTitle&"+"arg0="+arg0);
	}
};

OpenForum.wiki.cleanUpQueues = function(successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","cleanUpQueues").onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=cleanUpQueues");
	}
};

OpenForum.wiki.getPageAsTable = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","getPageAsTable","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=getPageAsTable&"+"arg0="+arg0);
	}
};

OpenForum.wiki.getDateTimeStamp = function(successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","getDateTimeStamp").onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=getDateTimeStamp");
	}
};

OpenForum.wiki.getDateTimeStamp = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","getDateTimeStamp","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=getDateTimeStamp&"+"arg0="+arg0);
	}
};

OpenForum.wiki.addJournalEntry = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","addJournalEntry","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=addJournalEntry&"+"arg0="+arg0);
	}
};

OpenForum.wiki.buildPage = function(arg0,arg1,arg2,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","buildPage","arg0="+arg0&"arg1="+arg1&"arg2="+arg2).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=buildPage&"+"arg0="+arg0&"arg1="+arg1&"arg2="+arg2);
	}
};

OpenForum.wiki.buildPage = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","buildPage","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=buildPage&"+"arg0="+arg0);
	}
};

OpenForum.wiki.buildPage = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","buildPage","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=buildPage&"+"arg0="+arg0&"arg1="+arg1);
	}
};

OpenForum.wiki.buildPage = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","buildPage","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=buildPage&"+"arg0="+arg0&"arg1="+arg1);
	}
};

OpenForum.wiki.renderWikiData = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","renderWikiData","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=renderWikiData&"+"arg0="+arg0&"arg1="+arg1);
	}
};

OpenForum.wiki.buildEditPage = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","buildEditPage","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=buildEditPage&"+"arg0="+arg0);
	}
};

OpenForum.wiki.titleToWikiName = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","titleToWikiName","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=titleToWikiName&"+"arg0="+arg0);
	}
};

OpenForum.wiki.buildPageSection = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","buildPageSection","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=buildPageSection&"+"arg0="+arg0&"arg1="+arg1);
	}
};

OpenForum.wiki.getPageUpdateTemplate = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","getPageUpdateTemplate","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=getPageUpdateTemplate&"+"arg0="+arg0);
	}
};

OpenForum.wiki.deletePage = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","deletePage","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=deletePage&"+"arg0="+arg0);
	}
};

OpenForum.wiki.deleteAttachment = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","deleteAttachment","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=deleteAttachment&"+"arg0="+arg0&"arg1="+arg1);
	}
};

OpenForum.wiki.buildDifferencesPage = function(arg0,arg1,arg2,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","buildDifferencesPage","arg0="+arg0&"arg1="+arg1&"arg2="+arg2).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=buildDifferencesPage&"+"arg0="+arg0&"arg1="+arg1&"arg2="+arg2);
	}
};

OpenForum.wiki.buildHistoryPage = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","buildHistoryPage","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=buildHistoryPage&"+"arg0="+arg0);
	}
};

OpenForum.wiki.getPageAsList = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","getPageAsList","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=getPageAsList&"+"arg0="+arg0);
	}
};

OpenForum.wiki.revert = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","revert","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=revert&"+"arg0="+arg0&"arg1="+arg1);
	}
};

OpenForum.wiki.copyPage = function(arg0,arg1,arg2,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","copyPage","arg0="+arg0&"arg1="+arg1&"arg2="+arg2).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=copyPage&"+"arg0="+arg0&"arg1="+arg1&"arg2="+arg2);
	}
};

OpenForum.wiki.addToListPage = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","addToListPage","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=addToListPage&"+"arg0="+arg0&"arg1="+arg1);
	}
};

OpenForum.wiki.saveAsAttachment = function(arg0,arg1,arg2,arg3,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","saveAsAttachment","arg0="+arg0&"arg1="+arg1&"arg2="+arg2&"arg3="+arg3).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=saveAsAttachment&"+"arg0="+arg0&"arg1="+arg1&"arg2="+arg2&"arg3="+arg3);
	}
};

OpenForum.wiki.setHomePage = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","setHomePage","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=setHomePage&"+"arg0="+arg0);
	}
};

OpenForum.wiki.createQueue = function(successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","createQueue").onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=createQueue");
	}
};

OpenForum.wiki.storeValue = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","storeValue","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=storeValue&"+"arg0="+arg0+"&arg1="+arg1);
	}
};

OpenForum.wiki.retrieveValue = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","retrieveValue","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=retrieveValue&"+"arg0="+arg0);
	}
};

OpenForum.wiki.getMessagesSince = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","getMessagesSince","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=getMessagesSince&"+"arg0="+arg0&"arg1="+arg1);
	}
};

OpenForum.wiki.wikiToTitleName = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","wikiToTitleName","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=wikiToTitleName&"+"arg0="+arg0);
	}
};

OpenForum.wiki.setUseCompression = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","setUseCompression","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=setUseCompression&"+"arg0="+arg0);
	}
};

OpenForum.wiki.setUseKeepAlive = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","setUseKeepAlive","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=setUseKeepAlive&"+"arg0="+arg0);
	}
};

OpenForum.wiki.getTimeStamp = function(successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","getTimeStamp").onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=getTimeStamp");
	}
};

OpenForum.wiki.getPages = function(successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","getPages").onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=getPages");
	}
};

OpenForum.wiki.refreshPage = function(arg0,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","refreshPage","arg0="+arg0).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=refreshPage&"+"arg0="+arg0);
	}
};

OpenForum.wiki.postMessageToQueue = function(arg0,arg1,successFn) {
	 if(successFn) {
		JSON.get("/OpenForum/Javascript/JavaWrapper/Wiki","postMessageToQueue","arg0="+arg0&"arg1="+arg1).onSuccess(successFn).go();
	} else {
		return OpenForum.loadFile("/OpenForum/Javascript/JavaWrapper/Wiki?action=postMessageToQueue&"+"arg0="+arg0&"arg1="+arg1);
	}
};

