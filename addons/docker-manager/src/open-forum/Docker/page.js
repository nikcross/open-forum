OpenForum.loadScript("/OpenForum/MessageQueue/MessageQueue.js");

var images = [];
var containers = [];
var updated = "--";
var consoleTitle = "--";
var console = "--";
var queue = null;

OpenForum.init = function() {
  
  requestUpdateImages();
  
  requestUpdateContainers();
  setInterval( requestUpdateContainers, 10000);
};

function requestUpdateContainers() {
  JSON.get("/Docker","ps").onSuccess(updateContainers).go();
}

function updateContainers(response) {
  containers = response.containers;
  updated = "Updated @ "+new Date();
}

function requestUpdateImages() {
  JSON.get("/Docker","images").onSuccess(updateImages).go();
}

function updateImages(response) {
  images = response.images;
}

function kill(containerId) {
  JSON.get("/Docker","kill","containerId="+containerId).onSuccess(updateContainers).go();
}

function watch(containerId,containerTitle) {
  consoleTitle = " for "+containerTitle;
  JSON.get("/Docker","log","containerId="+containerId).onSuccess(startWatching).go();
}

function startWatching(response) {
  
  console = "";
  queue = new MessageQueue(response.queue);

  queue.processMessages = function(messages) {
    for(var message in messages) {
		console += messages[message].substring(8) + "<br/>";
      
      if(console.length>5000) {
        console = console.substring(console.length-5000);
      }
    }
  };

  timer = setInterval( queue.pull , 1000 );
  
}

