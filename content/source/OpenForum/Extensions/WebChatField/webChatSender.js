webChatSender = new function()
{
  this.sendMessage = function( queueName,message )
  { 
    if(typeof(message)=="undefined")
    {
      message=document.getElementById("message").value;
      document.getElementById("message").value="";
    }
    ajax.doGet("/OpenForum/WebChat","requestType=send&chatQueue="+queueName+"&message="+message);
  }
}