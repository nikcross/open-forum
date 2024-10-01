package org.onestonesoup.openforum.certificatecheck;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.IOException;
import java.io.OutputStream;
import java.net.Socket;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.Principal;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;

public class CertificateCheck {
    public static final int EXIT_OK = 0;
    public static final int EXIT_CONNECT_FAILURE = 1;
    public static final int EXIT_SSL_ERROR = 2;
    public static final int EXIT_CERT_MISMATCH = 3;
    public static final int EXIT_ARG_ERROR = 4;
    public static final int EXIT_NO_ROOT_CERT_FOUND = 5;
    public static final int EXIT_VERIFY_CERT_NO_EXIST = 6;
    public static final int EXIT_VERIFY_CERT_LOAD_ERROR = 7;
    public static final int EXIT_WRITE_ROOT_CERT_ERROR = 8;
    public static final int EXIT_SERVER_CHAIN_ERROR = 9;

    public static void main(String[] args) throws NoSuchAlgorithmException, KeyManagementException, IOException {
        new CertificateCheck().checkCertificate("open-forum.onestonesoup.org");
    }

    public List<X509Certificate>  checkCertificate(String site) throws NoSuchAlgorithmException, KeyManagementException, IOException {

        SSLContext ctx = SSLContext.getInstance("TLS");
        CustomTrustManager trustManager = new CustomTrustManager();
        List<X509Certificate> chain = new ArrayList<>();
        trustManager.setChain( chain );
        ctx.init(null, new TrustManager[]{trustManager}, null);


        Socket s = ctx.getSocketFactory().createSocket(site, 443);
        printMessage("Connected? " + s.isConnected());
        OutputStream os = s.getOutputStream();
        os.write("GET / HTTP/1.1\n\n".getBytes());
        os.close();
        s.close();

        return chain;
    }

    private void printMessage(String text) {
        System.out.println( text );
    }

    class CustomTrustManager implements X509TrustManager {

        List<X509Certificate> chain;

        public void setChain( List<X509Certificate> chain ) {
            this.chain = chain;
        }

        @Override
        public void checkClientTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {
        }

        @Override
        public void checkServerTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {

            for(X509Certificate cert : x509Certificates) {
                chain.add(cert);
            }
        }

        @Override
        public X509Certificate[] getAcceptedIssuers() {
            return new X509Certificate[0];
        }
    }
}
