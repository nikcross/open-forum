function saveCanvas(pageName,fileName,canvas) {
	var data = canvas.toDataURL();
      data = data.substring(22);

      var post = new Post();
      post.addItem("data",data);
      post.addItem("fileName",fileName);
      post.addItem("pageName",pageName);
  
      JSON.post("/OpenForum/Actions/SaveImage","save",post.getData()).go();
}