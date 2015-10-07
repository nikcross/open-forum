var serverConsole = {
  queueName: "serverConsole.log",
  text: "",
  open: false,
  clear: function() {this.text = "";},
  log: function(message) {this.text += message + "<br/>";},
  cliText: "",
  runCli: function() {
    this.addToHistory(this.cliText);
    this.log("sjs> "+this.cliText);
    try{
      
      var script = this.cliText;
      if(script.substring(0,4)==="run:") {
        this.log("Running script from tab "+script.substring(4));
        script = findEditor(script.substring(4)).editor.getValue();
      }
      
  var post = new Post();
  post.addItem("code",script);
  post.addItem("queueName",serverConsole.queueName);
  try{
        request = new AjaxRequest(
"post","/OpenForum/Actions/RJSC","",post.getData(),"webChatView.processData(\"&response;\");",true);

    result = Ajax.sendRequest(request);
  }
  catch(e)
  {
    this.log("sjs> Error: "+e);
  }
  this.log("sjs> Finished");
      
      if(typeof(result)==="undefined") {
      } else if(typeof(result)==="object"){
        this.log("sjs> "+JSON.stringify(result));
      } else {
        this.log("sjs> "+result);
      }
    } catch (e) {
      this.log("sjs> "+e);
    }
  },
  cliHistory: [],
  cliHistoryCursor: 0,
  addToHistory: function() {
    this.cliHistory[this.cliHistory.length] = this.cliText;
    this.cliHistoryCursor = this.cliHistory.length;
  },
  historyCli: function(change) {
    this.cliHistoryCursor += change;
    if(this.cliHistoryCursor>=this.cliHistory.length-1) {
      this.cliHistoryCursor = this.cliHistory.length-1;
    } else if(this.cliHistoryCursor<0) {
      this.cliHistoryCursor=0;
    }
    this.cliText = this.cliHistory[this.cliHistoryCursor];
  }
};

addPlugin( {
  name: "Server Console",
  init: function() {
      if(serverConsole.open===true) {
        return;
      }
      serverConsole.open=true;
      editorIndex++;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);
    
      OpenForum.crawl(document.getElementById("editor"+editorIndex));

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/ServerConsole/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);    
    
          OpenForum.crawl(document.getElementById("editor"+editorIndex));
    webChatView.init("serverConsole.log");
    
      OpenForum.addTab("editor"+editorIndex);
      editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "ServerConsole", changed: ""};
      showTab(editorIndex);
      serverConsole.log("serverConsole Ready");
      return editorList[editorIndex];
    }
});


function WebChatView()
{
  var self = this;
  self.timeStamp = 0;
  self.queueName = null;
  self.layerName = null;

  this.init = function init(queueName)
  {
    self.queueName = queueName;
    self.layerName = queueName;
	checkRefreshTimer = setTimeout("webChatView.pickUp();",2000);
  };

  this.pickUp = function pickUp()
  {
    request = new AjaxRequest(
		"get",
      "/OpenForum/WebChat",
      "requestType=pickUp&chatQueue="+self.queueName+"&timeStamp="+self.timeStamp,
      "",
      webChatView.processData,
      "",
      true
    );

    Ajax.sendRequest(request);
  };

  this.processData = function processData(data)
  {
    data = unescape(data);
    try{
      var result = eval(data);
    } catch (e) {
      checkRefreshTimer = setTimeout("webChatView.pickUp();",2000);
      return;
    }

    self.timeStamp = result;
    for(loop=0;loop<messages.length;loop++)
    {
      if(messages[loop].indexOf("*eval")==0)
      {
         eval( messages[loop].substring(6) );
         continue;
      }

      serverConsole.text+=messages[loop]+"<BR/>";
    }
    checkRefreshTimer = setTimeout("webChatView.pickUp();",2000);
   };
}

webChatView = new WebChatView();
