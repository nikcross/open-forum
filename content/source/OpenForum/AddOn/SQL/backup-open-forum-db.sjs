/*
* Author: 
* Description: 
*/

var dir = "/postgres/open-forum-db/backups";
var script = "backup.sh";

var processService = new org.onestonesoup.javascript.helper.Process();
var process = processService.createProcess(script);
process.onEnd("println('Done It');");
process.runInDirectory(dir,false);

