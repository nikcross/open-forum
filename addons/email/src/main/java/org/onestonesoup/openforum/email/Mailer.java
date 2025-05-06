package org.onestonesoup.openforum.email;

import java.io.IOException;

public interface Mailer {
    String getVersion();

    void sendEmail(String fromEmail, String[] toEmails, String subject, String message) throws Exception;

    void sendEmail(String fromEmail, String[] toEmails, String subject, String message, boolean htmlContent) throws Exception;
}
