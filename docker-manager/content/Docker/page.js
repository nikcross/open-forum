var images = [];
var containers = [];

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