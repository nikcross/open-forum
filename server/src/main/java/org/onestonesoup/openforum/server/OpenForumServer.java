package org.onestonesoup.openforum.server;

import java.io.*;
import java.net.InetSocketAddress;
import java.lang.*;
import java.net.URL;
import com.sun.net.httpserver.HttpsServer;
import java.security.KeyStore;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.TrustManagerFactory;
import com.sun.net.httpserver.*;
import javax.net.ssl.SSLEngine;
import javax.net.ssl.SSLParameters;

import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URLConnection;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;

import java.net.InetAddress;
import java.util.*;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpsExchange;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.XmlHelper;
import org.onestonesoup.javascript.engine.JSON;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.security.AuthenticationException;

//See: https://stackoverflow.com/questions/2308479/simple-java-https-server

//keytool -genkeypair -keyalg RSA -alias selfsigned -keystore testkey.jks -storepass password -validity 360 -keysize 2048

public class OpenForumServer {

    private static OpenForumServer server;

    public static void main(String[] args) throws Exception {

        System.out.println("Root path: " + new File("").getAbsolutePath());

        server = new OpenForumServer( args[0], args [1] );
    }

    private OpenForumServer(String domainListFile, String keyFile ) {
        initControllers( domainListFile );
        initHttpsServer( keyFile,8000 );
        initHttpServer( keyFile, 8001 );
    }
    private Map<String,OpenForumController> controllers = new HashMap<String,OpenForumController>();

    public static OpenForumController getController(String domain) {
        if(domain!=null) {
            for (String key : server.controllers.keySet()) {
                //System.out.println(domain+" matches "+key+" ?");
                if (domain.matches(key)) {
                    //System.out.println("MATCH");
                    return server.controllers.get(key);
                }
            }
        }
        //No match found
        return server.controllers.get("default");
    }

    private void initControllers( String domainListFile ) {
        File domainXml = new File(new File( domainListFile ).getAbsolutePath());
        try {
            System.out.println("Configuring Wiki Controller");
            EntityTree domainList = XmlHelper.loadXml(domainXml);
            List<EntityTree.TreeEntity> domains = domainList.getChildren("domain");
            for(EntityTree.TreeEntity domain: domains) {
                String root = domain.getChild("root").getValue();
                String domainName = domain.getChild("host").getValue();

                System.out.println("  Adding Wiki Controller for "+domainName+" root:"+root);
                OpenForumController controller = new OpenForumController(root, domainName);
                controller.initialise();
                controllers.put(domainName,controller);
                System.out.println("  Wiki Controller added for "+domainName);
            }
            if(domains.size()==0) {
                System.out.println("  No Wiki Controllers Listed");
            }
        } catch (XmlHelper.XmlParseException e2) {
            // TODO Auto-generated catch block
            e2.printStackTrace();
        } catch (IOException e2) {
            // TODO Auto-generated catch block
            e2.printStackTrace();
        } catch (AuthenticationException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    private void initHttpsServer( String keyFile, int port ) {
        try {

            // setup the socket address
            InetSocketAddress address = new InetSocketAddress(port);

            // initialise the HTTPS server
            HttpsServer httpsServer = HttpsServer.create(address, 0);
            SSLContext sslContext = SSLContext.getInstance("TLS");

            // initialise the keystore
            char[] password = "password".toCharArray();
            KeyStore ks = KeyStore.getInstance("JKS");
            //FileInputStream fis = new FileInputStream("server/testkey.jks");
            FileInputStream fis = new FileInputStream( keyFile );
            ks.load(fis, password);

            // setup the key manager factory
            KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
            kmf.init(ks, password);

            // setup the trust manager factory
            TrustManagerFactory tmf = TrustManagerFactory.getInstance("SunX509");
            tmf.init(ks);

            // setup the HTTPS context and parameters
            sslContext.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);
            httpsServer.setHttpsConfigurator(new HttpsConfigurator(sslContext) {
                public void configure(HttpsParameters params) {
                    try {
                        // initialise the SSL context
                        SSLContext context = getSSLContext();
                        SSLEngine engine = context.createSSLEngine();
                        params.setNeedClientAuth(false);
                        params.setCipherSuites(engine.getEnabledCipherSuites());
                        params.setProtocols(engine.getEnabledProtocols());

                        // Set the SSL parameters
                        SSLParameters sslParameters = context.getSupportedSSLParameters();
                        params.setSSLParameters(sslParameters);

                    } catch (Exception ex) {
                        System.out.println("Failed to create HTTPS port");
                    }
                }
            });
            httpsServer.createContext("/", new RequestProcessor());
            httpsServer.setExecutor(new ThreadPoolExecutor(4, 8, 30, TimeUnit.SECONDS, new ArrayBlockingQueue<Runnable>(100))); // creates a default executor
            httpsServer.start();

        } catch (Exception exception) {
            System.out.println("Failed to create HTTPS server on port " + port + " of localhost");
            exception.printStackTrace();

        }
    }

    private void initHttpServer( String keyFile, int port ) {
        try {

            // setup the socket address
            InetSocketAddress address = new InetSocketAddress(port);

            // initialise the HTTPS server
            HttpServer httpServer = HttpServer.create(address, 0);

            httpServer.createContext("/", new RequestProcessor());
            httpServer.setExecutor(new ThreadPoolExecutor(4, 8, 30, TimeUnit.SECONDS, new ArrayBlockingQueue<Runnable>(100))); // creates a default executor
            httpServer.start();

        } catch (Exception exception) {
            System.out.println("Failed to create HTTP server on port " + port + " of localhost");
            exception.printStackTrace();

        }
    }
}
