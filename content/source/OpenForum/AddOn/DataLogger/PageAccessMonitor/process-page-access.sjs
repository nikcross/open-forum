/*
* Author: 
* Description: 
*/

var PageAccessMonitor = null;
try{
	PageAccessMonitor = openForum.retrieveObject("/OpenForum/AddOn/DataLogger/PageAccessMonitor");
} catch(e) {
  //First Time
}
if(PageAccessMonitor==null) { 
  PageAccessMonitor = js.getObject("/OpenForum/AddOn/DataLogger/PageAccessMonitor","PageAccessMonitor.sjs");
  openForum.storeObject("/OpenForum/AddOn/DataLogger/PageAccessMonitor", PageAccessMonitor);
}
PageAccessMonitor.processViews();
