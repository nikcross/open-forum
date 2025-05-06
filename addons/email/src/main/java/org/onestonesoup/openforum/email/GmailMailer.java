package org.onestonesoup.openforum.email;

import java.io.*;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import jakarta.activation.DataHandler;
import jakarta.activation.DataSource;
import org.apache.commons.codec.binary.Base64;

import jakarta.mail.*;
import jakarta.mail.internet.*;
import jakarta.mail.util.ByteArrayDataSource;

import java.io.IOException;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.Properties;
import java.util.Set;

import static com.google.api.services.gmail.GmailScopes.GMAIL_SEND;
import static jakarta.mail.Message.RecipientType.TO;

public class GmailMailer implements Mailer {
    private static final String VERSION = "5.0.1";

    private static String storePath = "";
    private Gmail service;

    public GmailMailer(){}

    public void initialise(String newStorePath) throws Exception {
        storePath = newStorePath;
        NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        GsonFactory jsonFactory = GsonFactory.getDefaultInstance();
        service = new Gmail.Builder(httpTransport, jsonFactory, getCredentials(httpTransport, jsonFactory))
                .setApplicationName("Test Mailer")
                .build();
    }

    private static Credential getCredentials(final NetHttpTransport httpTransport, GsonFactory jsonFactory)
            throws IOException {
        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(jsonFactory, new InputStreamReader(
            new FileInputStream(storePath+"/gmail.json")
        ));

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                httpTransport, jsonFactory, clientSecrets, Set.of(GMAIL_SEND))
                .setDataStoreFactory(new FileDataStoreFactory(new File(storePath)))
                .setAccessType("offline")
                .build();

        LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(8887).build();
        return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
    }

    @Override
    public String getVersion() {
        return VERSION;
    }

    @Override
    public void sendEmail(String fromEmail, String[] toEmails, String subject, String message) throws Exception {
        sendEmail(fromEmail, toEmails, subject, message, false);
    }

    @Override
    public void sendEmail(String fromEmail, String[] toEmails, String subject, String message, boolean htmlContent) throws Exception {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress(fromEmail));

        InternetAddress[] addressTo = new InternetAddress[toEmails.length];
        for (int i = 0; i < toEmails.length; i++) {
            addressTo[i] = new InternetAddress(toEmails[i]);
        }
        email.setRecipients(jakarta.mail.Message.RecipientType.TO, addressTo);

        email.setSubject(subject);
        email.setText(message);

        if(htmlContent) {
            DataSource dataSource = new ByteArrayDataSource(message, "text/html");
            email.setDataHandler(new DataHandler(dataSource));
        } else {
            DataSource dataSource = new ByteArrayDataSource(message, "text/plain");
            email.setDataHandler(new DataHandler(dataSource));
        }

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        email.writeTo(buffer);
        byte[] rawMessageBytes = buffer.toByteArray();
        String encodedEmail = Base64.encodeBase64URLSafeString(rawMessageBytes);
        Message msg = new Message();
        msg.setRaw(encodedEmail);

        try {
            msg = service.users().messages().send("me", msg).execute();
            System.out.println("Message id: " + msg.getId());
            System.out.println(msg.toPrettyString());
        } catch (GoogleJsonResponseException e) {
            GoogleJsonError error = e.getDetails();
            if (error.getCode() == 403) {
                System.err.println("Unable to send message: " + e.getDetails());
            } else {
                throw e;
            }
        }
    }
}