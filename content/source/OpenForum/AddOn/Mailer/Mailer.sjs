/*
* Author: 
* Description: 
*/

Mailer = function() {
  var self = this;
    var adminEmail = JSON.parse(file.getAttachment("/OpenForum/Users/Admin","mailer.config")).adminEmail;
	var mailer = js.getApi("/OpenForum/AddOn/Mailer");
  
  self.sendEmail = function(to,subject,content) {
    if( typeof( to )!="object" ) {
      to = [to];
    }
    mailer.sendEmail( adminEmail, to, subject, content );
  };
};
