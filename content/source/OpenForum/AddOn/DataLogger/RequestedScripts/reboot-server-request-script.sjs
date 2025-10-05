/*
* Author: 
* Description: 
*/

var processor = js.getApi("/OpenForum/Processor");
var result = processor.createProcess("reboot -f").run(true);