if(!OpenForum) {
  OpenForum = {};
}

OpenForum.saveCanvas = function(canvas,pageName,fileName) {
  data = canvas.toDataURL();
  data = data.substring(22);

  /*post = new Post(data);
      post.addItem("data",data);
      post.addItem("fileName",fileName);
      post.addItem("pageName",pageName);
      result = ajax.doPost("/OpenForum/Giraffe/SaveCanvas",post.data);
      return result;*/

  JSON.post("/OpenForum/Giraffe/SaveCanvas","save","pageName="+pageName+"&fileName="+fileName+"&date="+data).go();
};

OpenForum.downloadCanvas = function(canvas, filename) {
  var hiddenElement = document.createElement('a');
  hiddenElement.href = canvas.toDataURL();
  hiddenElement.download = filename;
  hiddenElement.style.display = "none";
  document.body.appendChild(hiddenElement);
  hiddenElement.click();
};
