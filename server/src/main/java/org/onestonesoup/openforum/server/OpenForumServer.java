package org.onestonesoup.openforum.server;

import java.io.*;
import java.net.InetSocketAddress;
import java.lang.*;
import com.sun.net.httpserver.HttpsServer;
import java.security.KeyStore;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.TrustManagerFactory;
import com.sun.net.httpserver.*;
import javax.net.ssl.SSLEngine;
import javax.net.ssl.SSLParameters;


import javax.net.ssl.SSLContext;
import java.util.*;

import com.sun.net.httpserver.HttpServer;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.NativeObject;
import org.onestonesoup.core.FileHelper;
import org.onestonesoup.javascript.engine.JSON;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.controller.OpenForumController;

//See: https://stackoverflow.com/questions/2308479/simple-java-https-server

//keytool -genkeypair -keyalg RSA -alias selfsigned -keystore testkey.jks -storepass password -validity 360 -keysize 2048

public class OpenForumServer {

    private static OpenForumServer server;
    private static String VERSION = "5.0.6";


    private Integer maxThreads = 1000;
    private Integer maxThreadTime = 60000;

    private HttpServer httpServer;
    private HttpsServer httpsServer;
    private boolean isSecure = false;

    public static void main(String[] args) throws Throwable {

        System.out.println("Root path: " + new File("").getAbsolutePath());

        if(args.length==1) {
            server = new OpenForumServer(args[0]);
        }
    }

    private Map<String,OpenForumController> controllers = new HashMap<String,OpenForumController>();
    private Map<String,OpenForumRedirector> redirectors = new HashMap<>();
    private JavascriptEngine js;

    private OpenForumServer(String configurationFile ) throws Throwable {
        System.out.println("Running Open Forum Server v:" +  VERSION );
        System.out.println("  Config File: " + configurationFile);

        js = new JavascriptEngine();
        String configData = FileHelper.loadFileAsString( configurationFile );

        System.out.println("  Config Data: " + configData);

        Object config = new JSON( js ).parse( configData );

        NativeArray domains = (NativeArray) ((NativeObject) config).get("domains");
        NativeObject ports = (NativeObject) ((NativeObject) config).get("ports");

        int httpPort = Integer.parseInt( ports.get("http").toString() );

        initControllers( domains );

        if( ((NativeObject) config).get("noMatchDomain") != null ) {
            String noMatchDomain = ((NativeObject) config).get("noMatchDomain").toString();
            redirectors.put("default", new OpenForumRedirector(noMatchDomain));
        }

        if( ((NativeObject) config).get("maxThreads") != null ) {
            maxThreads = Integer.valueOf(
                    ((NativeObject) config).get("maxThreads").toString(),
                    10 );
        }

        if( ((NativeObject) config).get("maxThreadTime") != null ) {
            maxThreadTime = Integer.valueOf(
                    ((NativeObject) config).get("maxThreadTime").toString(),
                    10 );
        }

        if( ports.get("https") != null ) {
            int httpsPort = Integer.parseInt(ports.get("https").toString());
            String keyFile = ((NativeObject) config).get("keyStore").toString();
            String password = ((NativeObject) config).get("keyStorePassword").toString();
            isSecure = true;
            initHttpsServer( keyFile, password, httpsPort );
        }
        initHttpServer( httpPort );
    }

    public static OpenForumRedirector getRedirector(String domain) {
        if(domain!=null) {
            for (String key : server.redirectors.keySet()) {
                //System.out.println(domain+" matches "+key+" ?");
                if (domain.matches(key)) {
                    //System.out.println("MATCH");
                    return server.redirectors.get(key);
                }
            }
        }
        return null;
    }

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
        return null;
    }

    public HttpServer getHttpServer() {
        return httpServer;
    }

    public HttpsServer getHttpsServer() {
        return httpsServer;
    }

    private void initControllers( NativeArray domains ) throws Exception {

            System.out.println("Configuring OpenForum Domain Controllers");

            for(Object domainObject: domains) {
                NativeObject domain = (NativeObject)domainObject;
                String domainName = domain.get("host").toString();
                if( domain.get("redirect") != null ) {
                    String redirect = domain.get("redirect").toString();
                    redirectors.put( domainName, new OpenForumRedirector(redirect) );
                    continue;
                }
                String root = domain.get("root").toString();


                System.out.println("  Adding OpenForum Controller for "+domainName+" root:"+root);
                OpenForumController controller = new OpenForumController(root, domainName);
                controller.setOpenForumServer( this );
                controller.initialise();
                controllers.put(domainName,controller);
                System.out.println("  OpenForum Controller added for "+domainName);
            }
            if(domains.getLength()==0) {
                System.out.println("  No Wiki Controllers Listed");
            }
    }

    private void initHttpsServer( String keyFile, String password, int port ) {
        try {

            // setup the socket address
            InetSocketAddress address = new InetSocketAddress(port);

            // initialise the HTTPS server
            httpsServer = HttpsServer.create(address, 0);
            SSLContext sslContext = SSLContext.getInstance("TLS");

            // initialise the keystore
            char[] passwordCA = password.toCharArray();
            KeyStore ks = KeyStore.getInstance("JKS");
            FileInputStream fis = new FileInputStream( keyFile );
            ks.load(fis, passwordCA);

            // setup the key manager factory
            KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
            kmf.init(ks, passwordCA);

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

            /*
            // https://docs.oracle.com/javase/8/docs/api/index.html?java/util/concurrent/ThreadPoolExecutor.html
            // https://engineering.zalando.com/posts/2019/04/how-to-set-an-ideal-thread-pool-size.html
            ThreadPoolExecutor httpsThreadPoolExecutor = new ThreadPoolExecutor(CORE_POOL_SIZE, MAX_POOL_SIZE, KEEP_ALIVE_TIME, TimeUnit.SECONDS, new ArrayBlockingQueue<Runnable>(QUEUE_SIZE));
            //https://medium.com/@raksmeykoung_19675/what-does-setqueuecapacity-do-what-happens-if-a-queue-runs-out-of-capacity-81e0c21416e5
            httpsThreadPoolExecutor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardOldestPolicy() );
            httpsServer.setExecutor( httpsThreadPoolExecutor ); // creates a default executor
             */
            ServerRequestExecuter requestExecuter = new ServerRequestExecuter(
                    "https request executer",
                    maxThreadTime,
                    maxThreads
                    );
            httpsServer.setExecutor(requestExecuter);

            httpsServer.start();

        } catch (Exception exception) {
            System.out.println("Failed to create HTTPS server on port " + port + " of localhost");
            exception.printStackTrace();

        }
    }

    private void initHttpServer( int port ) {
        try {

            // setup the socket address
            InetSocketAddress address = new InetSocketAddress(port);

            // initialise the HTTPS server
            httpServer = HttpServer.create(address, 0);

            httpServer.createContext("/", new RequestProcessor());
            /*ThreadPoolExecutor httpThreadPoolExecutor = new ThreadPoolExecutor(CORE_POOL_SIZE, MAX_POOL_SIZE, KEEP_ALIVE_TIME, TimeUnit.SECONDS, new ArrayBlockingQueue<Runnable>(QUEUE_SIZE));
            //https://medium.com/@raksmeykoung_19675/what-does-setqueuecapacity-do-what-happens-if-a-queue-runs-out-of-capacity-81e0c21416e5
            httpThreadPoolExecutor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardOldestPolicy() );
            httpServer.setExecutor(httpThreadPoolExecutor); // creates a default executor
             */

            ServerRequestExecuter requestExecuter = new ServerRequestExecuter(
                    "https request executer",
                    maxThreadTime,
                    maxThreads
            );
            httpServer.setExecutor(requestExecuter);
            httpServer.start();

        } catch (Exception exception) {
            System.out.println("Failed to create HTTP server on port " + port + " of localhost");
            exception.printStackTrace();

        }
    }
}
