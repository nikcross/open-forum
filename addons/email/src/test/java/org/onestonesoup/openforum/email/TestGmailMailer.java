package org.onestonesoup.openforum.email;

public class TestGmailMailer {

    public static void main(String[] args) throws Exception {
        GmailMailer mailer = new GmailMailer();
        mailer.initialise("/open-forum/resources");

        mailer.sendEmail( "test@wet-wired.com",
                new String[]{"test@wet-wired.com"},
                "Test","<h1>A test email</h1>", true );
    }
}
