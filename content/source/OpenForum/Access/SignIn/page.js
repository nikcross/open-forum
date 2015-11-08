OpenForum.loadScript("/OpenForum/Javascript/md5.js");
var result = " ";

function signIn() { 
  
  var hash = hex_md5(""+Math.random());
  var hashedPassword = hex_md5(passwordField+hash);
      
  parameters = "userId="+userNameField+"&password="+hashedPassword+"&hash="+hash+"&flavour=json";
  
  JSON.post("/OpenForum/Access/SignIn/Process","signIn",parameters)
    .onSuccess(signedIn)
    .onError(showError)
    .go();
}

function signedIn(response) {
  if(response.result==="ok") {
    currentUser = userNameField;
    var nextPage = OpenForum.getParameter("forwardTo");
    if(nextPage.length>0) {
      result = "<div data-alert class=\"alert-box success round\">Signed in as "+userNameField+". Forwarding to "+nextPage+" soon...</div>";
    } else {
      result = "<div data-alert class=\"alert-box success round\">Signed in as "+userNameField+".</div>";
    }
    
    setTimeout("window.location='"+nextPage+"'",3000);
  } else {
    result = "<div data-alert class=\"alert-box alert round\">"+response.errors+"</div>";
  }
}

function showError(response) {
    result = "<div data-alert class=\"alert-box alert round\">We have experieced a problem processing your sign in. "+response+"</div>";
}