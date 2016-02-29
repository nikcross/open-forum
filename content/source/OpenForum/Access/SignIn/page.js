OpenForum.loadScript("/OpenForum/Javascript/md5.js");

if(!OpenForum) {
  OpenForum = {};
}

OpenForum.Access = new function() {
 
  var self = this;
  this.result = " ";
  var isPopup = false;
  
  this.signIn = function() { 
    var hash = hex_md5(""+Math.random());
    var hashedPassword = hex_md5(passwordField+hash);

    parameters = "userId="+userNameField+"&password="+hashedPassword+"&hash="+hash+"&flavour=json";

    JSON.post("/OpenForum/Access/SignIn/Process","signIn",parameters)
    .onSuccess(signedIn)
    .onError(showError)
    .go();
  };

  var signedIn = function(response) {
    if(response.result==="ok") {
      currentUser = userNameField;
      var nextPage = OpenForum.getParameter("forwardTo");
      if(nextPage.length>0) {
        self.result = "<div data-alert class=\"alert-box success round\">Signed in as "+userNameField+". Forwarding to "+nextPage+" soon...</div>";
        setTimeout("window.location='"+nextPage+"'",3000);
      } else {
        self.result = "<div data-alert class=\"alert-box success round\">Signed in as "+userNameField+".</div>";
            if(isPopup) {
              setTimeout( function() {
                $("#AccessSignIn").foundation('reveal','close');
              },5000);
            }
      }
    } else {
      self.result = "<div data-alert class=\"alert-box alert round\">"+response.errors+"</div>";
    }
  };

  var showError = function(response) {
    self.result = "<div data-alert class=\"alert-box alert round\">We have experieced a problem processing your sign in. "+response+"</div>";
  };
  
  this.showPopup = function() {
    var div = document.createElement('div');
    html = "<div id=\"AccessSignIn\" class=\"reveal-modal\" data-reveal aria-labelledby=\"accessSignInModalTitle\" aria-hidden=\"true\" role=\"dialog\">";
    html += OpenForum.loadFile("/OpenForum/Access/SignIn/page.html.fragment");
    html += "</div>";
    div.innerHTML = html;

    document.getElementsByTagName('body')[0].appendChild(div);
    OpenForum.crawl(document);
    self.result = "   ";
    isPopup = true;
    
     $("#AccessSignIn").foundation('reveal','open');
  };
  
  this.showPassword = function(show) {
    if(show) {
      document.getElementById("password").type="text";
    } else {
      document.getElementById("password").type="password";
    }
  };
};