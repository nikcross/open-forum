example = { run: function() {
  //START
  canvas.add(
    new Picture(50,50,"/OpenForumJavascript/Giraffe/KitchenSink/examples/picture.png").setColor("red")
  );

  canvas.add(
    new Picture(80,80,"/OpenForumJavascript/Giraffe/KitchenSink/examples/picture.png").setColor("green")
  );

  canvas.add(
    new Picture(150,150,"/OpenForumJavascript/Giraffe/KitchenSink/examples/picture.png").setFillColor("blue")
  );
  //END
}
          };

exampleLoaded();
