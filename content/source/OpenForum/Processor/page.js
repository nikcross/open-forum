OpenForum.loadScript("/OpenForum/Processor/Processor.js");

var processor;

OpenForum.init = function() {
  processor = new Processor();

  processor.processLine = function(line) {
    document.getElementById( "queueData" ).innerHTML += line + "\n";
    var queueBox = document.getElementById("queueBox");
    queueBox.scrollTop = queueBox.scrollHeight;
  };
};

function execute(keycode) {
  if(keycode!==13) return;
  
  var command = document.getElementById("exec").value;
  processor.exec(command);
  document.getElementById("exec").value = "";
}

function clearLog() {
  document.getElementById( "queueData" ).innerHTML = "--";
}