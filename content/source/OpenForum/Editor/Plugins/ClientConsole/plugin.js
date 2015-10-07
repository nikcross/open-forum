var clientConsole = {
  queueName: "clientConsole.log",
  text: "",
  open: false,
  clientAlias: "node",
  clear: function() {this.text = "";},
  log: function(message) {this.text += message + "<br/>";},
  cliText: "",
  runCli: function() {
    this.addToHistory(this.cliText);
    this.log(this.clientAlias + " clijs> "+this.cliText);
    try{
      
      var script = this.cliText;
      if(script.substring(0,13)==="clientConsole") {
        eval(script);
        return;
      }
      if(script.substring(0,4)==="run:") {
        this.log("Running script from tab "+script.substring(4));
        script = findEditor(script.substring(4)).editor.getValue();
      }
      
  try{
        request = new AjaxRequest("get","/TheLab/OpenForumClient","action=call&alias="+this.clientAlias+"&encoding=base64&data="+btoa(script),null,null,true);
    	result = Ajax.sendRequest(request);
    	result = atob( eval("("+result+")").data );
  }
  catch(e)
  {
    this.log(this.clientAlias + " clijs> Error: "+e);
  }
      
      if(typeof(result)==="undefined") {
      } else if(typeof(result)==="object"){
        this.log(this.clientAlias + " clijs> "+JSON.stringify(result));
      } else {
        this.log(this.clientAlias + " clijs> "+result);
      }
    } catch (e) {
      this.log(this.clientAlias + " clijs> "+e);
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
  },
  setClient: function(alias) {
    this.clientAlias = alias;
    this.log("client set to "+alias);
  }
};

addPlugin( {
  name: "Client Console",
  init: function() {
      if(clientConsole.open===true) {
        return;
      }
      clientConsole.open=true;
      editorIndex++;
      var editor = document.createElement("div");
      editor.setAttribute("id","editor"+editorIndex);
      editor.setAttribute("style","display:block;");
      document.getElementById("editors").appendChild(editor);
    
      OpenForum.crawl(document.getElementById("editor"+editorIndex));

      var content = OpenForum.loadFile("/OpenForum/Editor/Plugins/ClientConsole/page.html.fragment");
      OpenForum.setElement("editor"+editorIndex,content);    
    
          OpenForum.crawl(document.getElementById("editor"+editorIndex));
    webChatView.init("clientConsole.log");
    
      OpenForum.addTab("editor"+editorIndex);
      editorList[editorIndex] = {id: editorIndex, tabButtonStyle: "tab", tabId: "editor"+editorIndex, name: "ClientConsole", changed: ""};
      showTab(editorIndex);
      clientConsole.log("clientConsole Ready");
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

      clientConsole.text+=messages[loop]+"<BR/>";
    }
    checkRefreshTimer = setTimeout("webChatView.pickUp();",2000);
   };
}

webChatView = new WebChatView();
