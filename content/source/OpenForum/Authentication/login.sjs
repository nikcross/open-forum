var result = false;
var name = login.getUser().getName();
var password = login.getPassword();
var testPassword = ""+file.getAttachment("/OpenForum/Users/"+name,"password.txt");
var siteHashA = ""+file.getAttachment("/OpenForum/Authentication","authentication.hash.a");
var siteHashB = ""+file.getAttachment("/OpenForum/Authentication","authentication.hash.b");
var hashedPasswordA = ""+js.generateMD5( testPassword + siteHashA );
var hashedPasswordB = ""+js.generateMD5( testPassword + siteHashB );

	if(
      hashedPasswordA.toUpperCase()==password.toUpperCase() ||
      hashedPasswordB.toUpperCase()==password.toUpperCase()
    ) {
		result = true;
      if(typeof(sessionStore) != "undefined") {
		var sessionId = sessionStore.createSession(name);
        login.setSessionId( sessionId );
      }
	}
	login.clearPassword();

result=result;
