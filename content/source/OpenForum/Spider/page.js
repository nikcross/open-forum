OpenForum.loadCSS("/OpenForum/Javascript/CodeMirror/lib/codemirror.css");
OpenForum.loadCSS("/OpenForum/Editor/code-mirror.css");
OpenForum.includeScript("/OpenForum/Javascript/CodeMirror/lib/codemirror.js");
OpenForum.includeScript("/OpenForum/Editor/Editors/JavascriptEditor/editor.js");
OpenForum.loadScript("/OpenForum/MessageQueue/MessageQueue.js");
OpenForum.includeScript("/OpenForum/Javascript/JavaWrapper/File/File.js");

var queue = null;
var timer = null;
var message = null;

var editor = { changed: " " };
var editorList = [ {changed: " "} ];

OpenForum.init = function() {
  
  editor = new JavascriptEditor(0, "/OpenForum/Spider", "spider.config.json");
  
  var queueName = "/OpenForum/Spider";
  queue = new MessageQueue(queueName);

  queue.processMessages = function(messages) {
    for(var message in messages) {
		document.getElementById( "queueData" ).innerHTML += messages[message].substring(messages[message].indexOf(":")+1) + "\n";
    }
  };

  timer = setInterval( queue.pull , 1000 );
};

function runSpider() {
  document.getElementById( "queueData" ).innerHTML = "Starting\n\n";
  var config = editor.getValue().replaceAll("\n","\\n");
  JSON.get("/OpenForum/Spider","crawl","config="+config).go();
}

function stopSpider() {
  document.getElementById( "queueData" ).innerHTML = "Requesting stop\n\n";
  JSON.get("/OpenForum/Spider","stop","").go();
}

function clearLog() {
  document.getElementById( "queueData" ).innerHTML = "Cleared\n\n";
}