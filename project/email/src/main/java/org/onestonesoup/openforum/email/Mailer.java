package org.onestonesoup.openforum.email;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Properties;

import javax.activation.CommandMap;
import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.MailcapCommandMap;
import javax.mail.Address;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.event.TransportEvent;
import javax.mail.event.TransportListener;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMessage.RecipientType;
import javax.mail.internet.MimeMultipart;
import javax.mail.util.ByteArrayDataSource;

import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.plugin.SystemAPI;

public class Mailer extends SystemAPI implements TransportListener{

    public static final String VERSION="OpenForum Mailer 3.0.3";

	private static final String MAILER_SERVICE_PAGE="/OpenForum/AddOn/Mailer";
	private static final String MESSAGE_DELIVERED_SCRIPT="message-delivered.sjs"; 
	private static final String MESSAGE_ERROR_SCRIPT="message-error.sjs"; 
	private static final String MESSAGE_UNDELIVERED_SCRIPT="message-undelivered.sjs";
	private static final String MESSAGE_PARTIALLY_DELIVERED_SCRIPT="message-partially-delivered.sjs";
    
	public static void main(String[] args) throws Exception {
		Mailer mailer = new Mailer();
		mailer.setUserNameAndPassword(args[0], args[1]);
		mailer.sendMail(args[2], args[3], args[4], args[5]);
	}
	public static String getVersion() {
		return VERSION;
	}
	
    private String smtpHost = "smtp.gmail.com";
	private String smtpPort = "465";
    private String sslFactoryClassName = "javax.net.ssl.SSLSocketFactory"; 
    
    private String password;
    private String userName;
	
    public class MailerThread implements Runnable
    { 	
        private String mailFrom;
        private String mailTo;
        private String subject;
        private String textMessage;
        private String htmlMessage;
        private String attachmentFileName;
        private String attachmentMimeType;
        private String attachmentURL;
       
        private MailerThread(String mailFrom,String mailTo,String subject,String htmlMessage,String textMessage,String attachmentFileName,String attachmentMimeType,String attachmentURL)
        {
            this.mailFrom=mailFrom;
            this.mailTo=mailTo;
            this.subject=subject;
            this.htmlMessage=htmlMessage;
            this.textMessage=textMessage;
            this.attachmentMimeType=attachmentMimeType;
            this.attachmentFileName=attachmentFileName;
            this.attachmentURL=attachmentURL;
           
            Thread thread = new Thread(this,"Sending Mail: "+subject);
            thread.setPriority(Thread.MIN_PRIORITY);
            thread.start();
        }
        public void run()
        {
            int retry = 0;
            while(retry<5)
            {
                try{
                	processSendMail(mailFrom,mailTo,subject,htmlMessage,textMessage,attachmentFileName,attachmentMimeType,attachmentURL);
                    break;
                }
                catch(Throwable th)
                {
                    th.printStackTrace();
                    try{ Thread.sleep(5000); }catch(Exception e){}
                    retry++;
                }
            }
            try{ Thread.sleep(1000); }catch(Exception e){}
        }       
    }
    
    public Mailer() {
    	MailcapCommandMap mc = (MailcapCommandMap) CommandMap.getDefaultCommandMap();
        mc.addMailcap("text/html;; x-java-content-handler=com.sun.mail.handlers.text_html");
        mc.addMailcap("text/xml;; x-java-content-handler=com.sun.mail.handlers.text_xml");
        mc.addMailcap("text/plain;; x-java-content-handler=com.sun.mail.handlers.text_plain");
        mc.addMailcap("multipart/*;; x-java-content-handler=com.sun.mail.handlers.multipart_mixed");
        mc.addMailcap("message/rfc822;; x-java-content-handler=com.sun.mail.handlers.message_rfc822");
        CommandMap.setDefaultCommandMap(mc);
    }
    
    public void setUserNameAndPassword (String userName, String password) {
    	this.userName = userName;
    	this.password = password;
    }
   
    public void setBuilder(OpenForumController controller)
    {
        super.setController(controller);
    }

    public void sendMail(String mailFrom,String mailTo,String subject,String textMessage) throws Exception
    {
        new MailerThread(mailFrom,mailTo,subject,null,textMessage,null,null,null);   	
    }
    
    public void sendMail(String mailFrom,String mailTo,String subject,String htmlMessage,String textMessage,String attachmentFileName,String attachmentMimeType,String attachmentURL) throws Exception //IOException,AuthenticationException
    {
        new MailerThread(mailFrom,mailTo,subject,htmlMessage,textMessage,attachmentFileName,attachmentMimeType,attachmentURL);
    }
   
    private void processSendMail(String mailFrom,String mailToList,String subject,String htmlMessage,String textMessage,String attachmentFileName,String attachmentMimeType,String attachmentURL) throws Exception //IOException,AuthenticationException
    {                  
           String[] mailTo = mailToList.split(",");
           
           try{
               sendSSLMessage(mailTo,subject,htmlMessage,textMessage,attachmentFileName,attachmentMimeType,attachmentURL,mailFrom);
           }
           catch(MessagingException e)
           {
               e.printStackTrace();
           }
    }  
   
    private void sendSSLMessage(String recipients[], String subject,String htmlMessage,String textMessage,String attachmentFileName,String attachmentMimeType,String attachmentURL, String from) throws MessagingException,MalformedURLException,IOException {
        boolean debug = true;
       
        Properties props = new Properties();
        props.put("mail.smtp.host", smtpHost);
        props.put("mail.smtp.auth", "true");
        props.put("mail.debug", "false");
        props.put("mail.smtp.port", smtpPort);
        props.put("mail.smtp.socketFactory.port", smtpPort);
        props.put("mail.smtp.socketFactory.class", sslFactoryClassName);
        props.put("mail.smtp.socketFactory.fallback", "false");
       
        Session session = Session.getDefaultInstance(props,
        new javax.mail.Authenticator() {
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(userName,password);
                }
            }
        );
       
        session.setDebug(debug);
       
        Message msg = new MimeMessage(session);
        InternetAddress addressFrom = new InternetAddress(from);
        msg.setFrom(addressFrom);
        msg.setReplyTo(new Address[]{addressFrom});
       
        InternetAddress[] addressTo = new InternetAddress[recipients.length];
        for (int i = 0; i < recipients.length; i++) {
            addressTo[i] = new InternetAddress(recipients[i]);
        }
        //msg.setRecipients(Message.RecipientType.BCC, addressTo);
   
        MimeMultipart multipart = new MimeMultipart("alternative");
        
        if(attachmentURL!=null) {
	        MimeBodyPart filePart = new MimeBodyPart();
	        filePart.setFileName( attachmentFileName );
	        
			URL url = new URL(attachmentURL);
			URLConnection connection = url.openConnection();
			connection.setRequestProperty( "User-Agent","OpenForum Wiki");
	        
	        DataSource ds = new ByteArrayDataSource(connection.getInputStream(), attachmentMimeType);
	        filePart.setDataHandler(new DataHandler(ds));
	        multipart.addBodyPart(filePart);
        }
        
        MimeBodyPart textPart = new MimeBodyPart();
        textPart.setContent(textMessage, "text/plain");
        multipart.addBodyPart(textPart);
        
        if(htmlMessage!=null) {
	        MimeBodyPart htmlPart = new MimeBodyPart();
	        String htmlData = htmlMessage;
	        htmlPart.setContent(htmlData, "text/html");
	        multipart.addBodyPart(htmlPart);
        }
        
        // Setting the Subject and Content Type
        msg.setSubject(subject);
        msg.setContent(multipart);
        
        Transport transport = session.getTransport(addressTo[0]);
        transport.addTransportListener(this);
        transport.connect();
        // Sending Message
        for(Address to: addressTo) {
        	try{
        	//msg.setRecipients(RecipientType.TO,new Address[]{to});
        	//Transport.send(msg);
        		msg.setRecipients(RecipientType.TO,new Address[]{to});
        		transport.sendMessage(msg,new Address[]{to});
        	} catch (Exception e) {
        		messageSendFailed(e,msg);
        		transport.close();
                transport.connect();
        	}
        }
        transport.close();
    }

    public void messageSendFailed(Exception exception,Message message) {
		try{
			if(getController().getFileManager().attachmentExists(MAILER_SERVICE_PAGE, MESSAGE_ERROR_SCRIPT, getController().getSystemLogin()))
			{
				JavascriptEngine js = getJavascriptEngine();
				js.mount("messageSubject",message.getSubject());
				js.mount("message",message);
				js.mount("exception",exception);
				js.mount("reason","Message Send Failed");
				runJavascript(MAILER_SERVICE_PAGE, MESSAGE_ERROR_SCRIPT,js);
			}
		} catch(Throwable t) {
			t.printStackTrace();
		}    	
    }
    
	public void messageDelivered(TransportEvent event) {
		try{
			if(getController().getFileManager().attachmentExists(MAILER_SERVICE_PAGE, MESSAGE_DELIVERED_SCRIPT, getController().getSystemLogin()))
			{
				JavascriptEngine js = getJavascriptEngine();
				js.mount("messageSubject",event.getMessage().getSubject());
				js.mount("message",event.getMessage());
				js.mount("validSentAddresses",event.getValidSentAddresses());
				js.mount("invalidAddresses",event.getInvalidAddresses());
				js.mount("validUnsentAddresses",event.getValidUnsentAddresses());
				js.mount("reason","Message Delivered");
				runJavascript(MAILER_SERVICE_PAGE, MESSAGE_DELIVERED_SCRIPT,js);
			}
		} catch(Throwable t) {
			t.printStackTrace();
		}
	}

	public void messageNotDelivered(TransportEvent event) {
		try{
			if(getController().getFileManager().attachmentExists(MAILER_SERVICE_PAGE, MESSAGE_UNDELIVERED_SCRIPT, getController().getSystemLogin()))
			{
				JavascriptEngine js = getJavascriptEngine();
				js.mount("messageSubject",event.getMessage().getSubject());
				js.mount("message",event.getMessage());
				js.mount("validSentAddresses",event.getValidSentAddresses());
				js.mount("invalidAddresses",event.getInvalidAddresses());
				js.mount("validUnsentAddresses",event.getValidUnsentAddresses());
				js.mount("reason","Message Not Delivered");
				runJavascript(MAILER_SERVICE_PAGE, MESSAGE_UNDELIVERED_SCRIPT,js);
			}
		} catch(Throwable t) {
			t.printStackTrace();
		}
	}

	public void messagePartiallyDelivered(TransportEvent event) {
		try{
			if(getController().getFileManager().attachmentExists(MAILER_SERVICE_PAGE, MESSAGE_PARTIALLY_DELIVERED_SCRIPT, getController().getSystemLogin()))
			{
				JavascriptEngine js = getJavascriptEngine();
				js.mount(event.getMessage().getSubject(),"messageSubject");
				js.mount("message",event.getMessage());
				js.mount("validSentAddresses",event.getValidSentAddresses());
				js.mount("invalidAddresses",event.getInvalidAddresses());
				js.mount("validUnsentAddresses",event.getValidUnsentAddresses());
				js.mount("reason","Message Partially Delivered");
				runJavascript(MAILER_SERVICE_PAGE, MESSAGE_PARTIALLY_DELIVERED_SCRIPT,js);
			}
		} catch(Throwable t) {
			t.printStackTrace();
		}
	}
    public String getSmtpHost() {
		return smtpHost;
	}

	public void setSmtpHost(String smtpHost) {
		this.smtpHost = smtpHost;
	}

	public String getSmtpPort() {
		return smtpPort;
	}

	public void setSmtpPort(String smtpPort) {
		this.smtpPort = smtpPort;
	}

	public String getSslFactoryClassName() {
		return sslFactoryClassName;
	}

	public void setSslFactoryClassName(String sslFactoryClassName) {
		this.sslFactoryClassName = sslFactoryClassName;
	}
}
