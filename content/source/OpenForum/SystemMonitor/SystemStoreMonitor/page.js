var data = [{key: "Loading...", value: ""}];

OpenForum.init = function() {
  setInterval(updateView(),5000);
  updateView();
};

function updateView() {
  JSON.get("/OpenForum/SystemMonitor/SystemStoreMonitor","getData").onSuccess(displayData).go();
}

function displayData(response) {
  if(response.result==="ok") {
    data = response.data;
  } else {
    data = [{key: "Error", value: response.message}];
  }
}