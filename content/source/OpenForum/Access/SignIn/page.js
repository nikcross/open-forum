OpenForum.loadScript("/OpenForum/Javascript/md5.js");
var result = " ";

function signIn() { 
  
  var hash = hex_md5(""+Math.random());
  var hashedPassword = hex_md5(password+hash);
      
  parameters = "userId="+userName+"&password="+hashedPassword+"&hash="+hash+"&flavour=json";
  
  JSON.post("/OpenForum/Access/SignIn/Process","signIn",parameters)
    .onSuccess(signedIn)
    .onError(showError)
    .go();
}

function signedIn(response) {
  if(response.result==="ok") {
    currentUser = userName;
    result = "<div data-alert class=\"alert-box success round\">Signed in as "+userName+"</div>";
  } else {
    result = "<div data-alert class=\"alert-box alert round\">"+response.errors+"</div>";
  }
}

function showError(response) {
  
}