try{
var config = JSON.parse(file.getAttachment("/OpenForum/Users/Admin","mailer.config"));
var mailer = js.getApi("/OpenForum/AddOn/Mailer");

mailer.setUserNameAndPassword(config.userName,config.password);
mailer.setSmtpHost("smtp-relay.gmail.com");

mailer.sendMail( config.adminEmail,config.adminEmail,"Mailer Version "+mailer.getVersion()+" Started","Mailer Started @ " + new Date() );
} catch(e) {
  log.error("Failed to init Mailer. Error:"+e);
}
  log.info("Init Mailer "+mailer.getVersion());