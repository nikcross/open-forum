package org.onestonesoup.openforum.email;

public class TestSMTPMailer
{
    public static void main(String[] args) throws Exception
    {
        SMTPMailer mailer = new SMTPMailer("test@wet-wired.com","password");
        mailer.setSmtpHost("smtp-relay.gmail.com");
        //mailer.setSecure( false );
        mailer.sendEmail( "test@wet-wired.com",new String[]{"test@wet-wired.com"},"Test","A test email" );
    }
}
