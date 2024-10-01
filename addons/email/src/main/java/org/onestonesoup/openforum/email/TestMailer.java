package org.onestonesoup.openforum.email;

import java.io.IOException;

public class TestMailer
{
    public static void main(String[] args) throws IOException
    {
        Mailer mailer = new Mailer("nikcross@wet-wired.com","LlamaMode2016");
        mailer.setSmtpHost("smtp-relay.gmail.com");
        //mailer.setSecure( false );

        mailer.sendEmail( "nikcross@wet-wired.com",new String[]{"nikcross@wet-wired.com"},"Test","A test email" );
    }
}
