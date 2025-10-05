var gameConsole = {
  open: false,
  runGame: function(pageName) {
      var game = new Game();

      var initialiseCode = OpenForum.loadFile( pageName + "/initialise.js");
      var startGameCode = OpenForum.loadFile( pageName + "/start.js");
      var processFrameCode = OpenForum.loadFile( pageName + "/process.js");
      var endGameCode = OpenForum.loadFile( pageName + "/end.js");
    
        game.initialise = new Function( initialiseCode );
		game.startGame = new Function( startGameCode );
        game.processFrame = new Function( processFrameCode );
        game.endGame = new Function( endGameCode );

      GameConsole.setGame(game);
      GameConsole.run();
  },
  close: function() {
    gameConsole.open = false;
  }
};

addPlugin( {
  name: "Game Console",
  init: function() {
      if(gameConsole.open===true) {
        return;
      }
      OpenForum.loadCSS("/OpenForum/Editor/Plugins/GameConsole/game.css");
	  OpenForum.loadScript("/OpenForum/Editor/Plugins/GameConsole/game-console.js");    
    
      gameConsole.open=true;
      editorIndex++;
      this.editorIndex = editorIndex;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/GameConsole/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);

      OpenForum.crawl(document.getElementById("editor"+editorIndex));
    
      OpenForum.addTab("editor"+editorIndex);
      editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "Game Console", changed: "", plugin: gameConsole};
      showTab(editorIndex);
      console.log("Game Console Ready");
      return editorList[editorIndex];
    }
});
