if(!OpenForum) {
  OpenForum = {};
}

OpenForum.clipCanvas = function (canvas,x,y,w,h) {
  var newCanvas = document.createElement('canvas');
  newCanvas.width = w;
  newCanvas.height = h;

  var newContext = newCanvas.getContext('2d');

  newContext.drawImage(
    canvas,
    x,
    y,
    w,
    h,
    0,
    0,
    w,
    h
  );

  return newCanvas;
};

OpenForum.saveCanvas = function(canvas,targetPageName,fileName,x,y,w,h) {

  if(x && y && w && h) {
    canvas = OpenForum.clipCanvas(canvas,x,y,w,h);
  }

  var mimeType = "image/png";
  var offset = 22;
  if( fileName.indexOf("jpg")!=-1 || fileName.indexOf("jpeg")!=-1 ) {
    mimeType = "image/jpeg";
    offset = 23;
  }
  data = canvas.toDataURL( mimeType, 0.3 );
  //data.replaceAll("/+"," ");
  //data = JSON.stringify(data);

  OFX.post("/OpenForum/Giraffe/SaveCanvas")
    .withAction("save")
    .withData( {pageName: targetPageName, fileName: fileName, data: data} )
    .onSuccess( function() {
    	console.log("File " + targetPageName + "/" + fileName + " saved");
  	})
    .go();
};

OpenForum.downloadCanvas = function(canvas, fileName,x,y,w,h) {
  if(x && y && w && h) {
    canvas = OpenForum.clipCanvas(canvas,x,y,w,h);
  }

  var mimeType = "image/png";
  if( fileName.indexOf("jpg")!=-1 || fileName.indexOf("jpeg")!=-1 ) {
    mimeType = "image/jpeg";
  }

  var hiddenElement = document.createElement('a');
  hiddenElement.href = canvas.toDataURL(mimeType);
  hiddenElement.download = fileName;
  hiddenElement.style.display = "none";
  document.body.appendChild(hiddenElement);
  hiddenElement.click();
};
