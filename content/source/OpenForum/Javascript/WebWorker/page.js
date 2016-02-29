/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/Javascript/WebWorker/WebWorker.js");

var results = "Results\n";

OpenForum.init = function() {
  OpenForum.WebWorker.includeScript("/OpenForum/Javascript/WebWorker/test-functions.js");
  
  var worker2 = OpenForum.WebWorker.newWorker();
  worker2.includeScript("/OpenForum/Javascript/WebWorker/test-functions.js");
  
  worker2.run( "sumTo(999999);",processSum );
  OpenForum.WebWorker.run( "square(9);" );
  OpenForum.WebWorker.run( "square(10);",processIt );
  OpenForum.WebWorker.run( "square(11);" );
  OpenForum.WebWorker.run( "square(12);" );
  
  OpenForum.WebWorker.run("toCaps('text');",processIt);
};

function processIt(result) {
  results += "\nResult:"+result;
}

function processSum(result,jobId) {
  results += "\nSum:"+result+" job:"+jobId;
}