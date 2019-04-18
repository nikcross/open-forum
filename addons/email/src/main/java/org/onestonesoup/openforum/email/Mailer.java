package org.onestonesoup.openforum.email;

import java.io.IOException;
import java.util.Properties;
import javax.mail.Message;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.onestonesoup.openforum.plugin.SystemAPI;

public class Mailer extends SystemAPI {

    public static final String VERSION="OpenForum Mailer 4.0.3";
    
	private static final String SMTP_PORT = "465";
	private static final String SSL_FACTORY = "javax.net.ssl.SSLSocketFactory";
    
	private String smtpHostName = "smtp.gmail.com";
	private String userName;
	private String password;
	
	public Mailer() {}
	
	public Mailer(String userName, String password) {
		this.userName = userName;
		this.password = password;
	}

	public String getVersion() {
		return VERSION;
	}

	public void setUserNameAndPassword(String userName, String password) {
		this.userName = userName;
		this.password = password;
	}
	
	public void setSmtpHost(String smtpHostName) {
		this.smtpHostName = smtpHostName;
	}

	public void sendEmail(String fromEmail,String[] toEmails,String subject,String message) throws IOException {
		sendEmail(fromEmail,toEmails,subject,message,false);
	}

	public void sendEmail(String fromEmail,String[] toEmails,String subject,String message, boolean htmlContent) throws IOException {
		try{
			Properties props = new Properties();
			props.put("mail.smtp.host", smtpHostName);
			props.put("mail.smtp.auth", "true");
			props.put("mail.debug", "false");
			props.put("mail.smtp.port", SMTP_PORT);
			props.put("mail.smtp.socketFactory.port", SMTP_PORT);
			props.put("mail.smtp.socketFactory.class", SSL_FACTORY);
			props.put("mail.smtp.socketFactory.fallback", "false");
			
			Session session = Session.getDefaultInstance(props,
			new javax.mail.Authenticator() {
					protected PasswordAuthentication getPasswordAuthentication() {
						return new PasswordAuthentication(userName,password);
					}
				}
			);
			
			session.setDebug(false);
			
			Message msg = new MimeMessage(session);

			InternetAddress addressFrom = new InternetAddress(fromEmail);
			msg.setFrom(addressFrom);
			
			InternetAddress[] addressTo = new InternetAddress[toEmails.length];
			for (int i = 0; i < toEmails.length; i++) {
				addressTo[i] = new InternetAddress(toEmails[i]);
			}
			msg.setRecipients(Message.RecipientType.TO, addressTo);
		
			// Setting the Subject and Content Type
			msg.setSubject(subject);
			if(htmlContent) {
				msg.setContent(message, "text/html; charset=utf-8");
			} else {
				msg.setContent(message, "text/plain");
			}
			Transport.send(msg);		
		}
		catch(Exception e)
		{
			throw new IOException(e);
		}
	}
}
