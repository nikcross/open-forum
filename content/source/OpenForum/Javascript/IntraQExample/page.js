/*
* Author: 
*/
var messages = "Messages<br/>";
var message = "";
var miQ;
var queueId = "";

var sharedData = "some shared data";

var inqMessages = "Inq Messages<br/>";

OpenForum.init = function() {
  if( typeof OpenForum.inq == "undefined" ) {
    OpenForum.inq = new OpenForum.InQ();
  }
  //window.close();
  queueId = OpenForum.getParameter("qid");
  if(queueId=="") queueId="myQueue";
  
  miQ = new OpenForum.IntraQ( queueId );
  miQ.addListener(
    function(data) {
      if( typeof data == "object" && data.action) data = "Action:" + data.action;
      messages += data + "<br/>\n";
    }
  );
  
  document.getElementById("link").href="/OpenForum/Javascript/IntraQExample?iq=true&qid="+queueId;
  
  /*if(typeof OpenForum.inq == "undefined") {
  	OpenForum.inq = new OpenForum.IntraQ( "iq" );
    OpenForum.inq.addListener( iqListener );
  }*/
  OpenForum.inq.addMessageListener( function(message) {
    inqMessages += JSON.stringify( message ) + "<br/>";
  },"*");
  //closer = setTimeout( function() {window.close();}, 1000 );
  //iQ.send("Running ?");
  
  OpenForum.inq.share( "sharedData" );
};

function iqListener(data) {
  if(data.action && data.action=="joined") {
    messages += "Tab " + data.tabId + " joined iq<br/>\n";
  }
}

function sendMessage() {
  OpenForum.scan();
  miQ.send( message );
}

function setSharedData() { sharedData = "" + new Date(); }
function sendAlert() { OpenForum.inq.run( "alert( 'IntraQ iq says HI' );" ); }
function setField() { OpenForum.inq.run( "message = 'IntraQ iq says HI';" ); }
function reloadPage() { OpenForum.inq.run( "location.reload();" ); }
