function WebChatView()
{
  this.timeStamp = 0;
  this.queueName = null;
  this.layerName = null;

  this.init = function init(queueName)
  {
    this.queueName = queueName;
    this.layerName = queueName;
	checkRefreshTimer = setTimeout("webChatView.pickUp();",2000);
//alert("pickup called")
  }

  this.pickUp = function pickUp()
  {
    request = new AjaxRequest(
"get","/OpenForum/WebChat","requestType=pickUp&chatQueue="+this.queueName+"&timeStamp="+this.timeStamp,"","webChatView.processData(\"&response;\");",true);

    ajax.postRequest(request);
//alert("request posted:"+"/OpenForum/WebChat?requestType=pickUp&chatQueue="+this.queueName+"&timeStamp="+this.timeStamp);
  }

  this.processData = function processData(data)
  {
    data = unescape(data);
//alert(data);
    eval(data);

    this.timeStamp = timeStamp;
    for(loop=0;loop<messages.length;loop++)
    {
      if(messages[loop].indexOf("*eval")==0)
      {
//alert("EVAL:"+messages[loop].substring(6));
         eval( messages[loop].substring(6) );
         continue;
      }

      document.title = messages[loop];
      document.getElementById(this.layerName).innerHTML = document.getElementById(this.layerName).innerHTML+messages[loop]+"<BR/>";
    }
    checkRefreshTimer = setTimeout("webChatView.pickUp();",2000);
   }
}

webChatView = new WebChatView();