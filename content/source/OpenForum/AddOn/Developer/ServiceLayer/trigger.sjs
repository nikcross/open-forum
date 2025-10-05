/*
* Author: Admin 
* Description: To run on server start
*/
try{
  var RefreshService = js.getObject("/Development/ServiceLayer","RefreshService.sjs");
  RefreshService.refresh();
} catch(e) {
  log.error(e + " in /Development/ServiceLayer/RefreshService.sjs");
}