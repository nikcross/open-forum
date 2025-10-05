try{
  js.refreshPluginManager();
  
  var config = JSON.parse(file.getAttachment("/OpenForum/Users/Admin","mailer.config"));
  var mailer = js.getApi("/OpenForum/AddOn/Mailer");

  println(mailer.getVersion());
  
  println("Mailer set to userName:" +config.userName +" password:"+ config.password +" smtpHost:"+ config.smtpHost);
  
  mailer.setUserNameAndPassword(config.userName,config.password);
  mailer.setSmtpHost(config.smtpHost);

  println("Admin email: " + config.adminEmail);
  
  mailer.sendEmail( config.adminEmail,[config.adminEmail],"Mailer Started","Mailer Started @ " + new Date() );
  //mailer.sendEmail( config.adminEmail,[config.adminEmail],"Mailer Version "+mailer.getVersion()+" Started","Mailer Started @ " + new Date() );
} catch(e) {
  println("Failed to init Mailer. Error:"+e);
  
}
println("Initialised Mailer "+mailer.VERSION);