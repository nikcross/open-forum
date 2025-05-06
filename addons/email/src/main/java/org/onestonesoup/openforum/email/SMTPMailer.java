package org.onestonesoup.openforum.email;

import java.io.IOException;
import java.util.Properties;

import jakarta.activation.DataHandler;
import jakarta.activation.DataSource;
import jakarta.mail.*;
import jakarta.mail.internet.*;
import jakarta.mail.util.ByteArrayDataSource;

//import org.onestonesoup.openforum.plugin.SystemAPI;

public class SMTPMailer implements Mailer /*extends SystemAPI*/ {

    public String version="OpenForum Mailer v?";
    
	private static final String INSECURE_SMTP_PORT = "25";
	private static final String SECURE_SMTP_PORT = "465";
	private static final String SSL_FACTORY = "javax.net.ssl.SSLSocketFactory";

	private boolean secure = true;
	private String smtpHostName = "smtp.gmail.com";
	private String userName;
	private String password;
	
	public SMTPMailer() {}
	
	public SMTPMailer(String userName, String password) {
		this.userName = userName;
		this.password = password;
	}

	@Override
	public String getVersion() {
		if (version != null) {
			return version;
		}
		try {
			Properties props = new Properties();
			props.load(this.getClass().getResourceAsStream("/META-INF/maven/org.onestonesoup/email/pom.properties"));
			version = props.getProperty("version");

		} catch (Exception exception) {
			version = "Unknown";
		}
		return version;
	}

	public void setSecure(boolean state) {
		secure = state;
	}

	public void setUserNameAndPassword(String userName, String password) {
		this.userName = userName;
		this.password = password;
	}
	
	public void setSmtpHost(String smtpHostName) {
		this.smtpHostName = smtpHostName;
	}

	@Override
	public void sendEmail(String fromEmail, String[] toEmails, String subject, String message) throws Exception {
		sendEmail(fromEmail,toEmails,subject,message,false);
	}

	@Override
	public void sendEmail(String fromEmail, String[] toEmails, String subject, String message, boolean htmlContent) throws Exception {
		try{
			Properties props = new Properties();
			props.put("mail.smtp.host", smtpHostName);
			props.put("mail.smtp.auth", "true");
			props.put("mail.debug", "false");
			if(secure)
			{
				props.put( "mail.smtp.port", SECURE_SMTP_PORT );
				props.put("mail.smtp.starttls.enable", "true");
				props.put( "mail.smtp.socketFactory.port", SECURE_SMTP_PORT );
				props.put("mail.smtp.socketFactory.class", SSL_FACTORY);
				props.put("mail.smtp.socketFactory.fallback", "false");
			} else {
				props.put( "mail.smtp.port", INSECURE_SMTP_PORT );
			}

			Session session = Session.getInstance(props,
			new jakarta.mail.Authenticator() {
					protected PasswordAuthentication getPasswordAuthentication() {
						return new PasswordAuthentication(userName,password);
					}
				}
			);
			
			session.setDebug(false);

			MimeMessage msg = new MimeMessage(session);

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
				DataSource dataSource = new ByteArrayDataSource(message, "text/html");
				msg.setDataHandler(new DataHandler(dataSource));
				//msg.setContent(message, "text/html; charset=utf-8");
			} else {
				DataSource dataSource = new ByteArrayDataSource(message, "text/plain");
				msg.setDataHandler(new DataHandler(dataSource));
				//msg.setContent(message, "text/plain");
			}
			Transport.send(msg);
		}
		catch(Exception e)
		{
			throw new IOException(e);
		}
	}
}
