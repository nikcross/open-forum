try{
  var config = JSON.parse(file.getAttachment("/OpenForum/Users/Admin","mailer.config"));
  var mailer = js.getApi("/OpenForum/AddOn/Mailer");

  mailer.initialise(config.tokenPath);

  //mailer.sendEmail( config.adminEmail,[config.adminEmail],"Mailer Started","Mailer Started @ " + new Date() );
  //mailer.sendEmail( config.adminEmail,[config.adminEmail],"Mailer Version "+mailer.getVersion()+" Started","Mailer Started @ " + new Date() );
} catch(e) {
  log.error("Failed to init Mailer. Error:"+e);
}
log.info("Initialised Mailer "+mailer.getVersion());