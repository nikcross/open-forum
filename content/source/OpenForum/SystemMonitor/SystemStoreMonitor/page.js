var dataView = "Loading...";

OpenForum.init = function() {
  setInterval(updateView(),5000);
  updateView();
};

function updateView() {
  JSON.get("/OpenForum/SystemMonitor/SystemStoreMonitor","getData").onSuccess(displayData).go();
}

function displayData(response) {
  if(response.result==="ok") {
    dataView = JSON.stringify(response.data,null,4);
  } else {
    dataView = "Error: "+response.message;
  }
}