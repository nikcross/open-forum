package org.onestonesoup.openforum.server;

import org.onestonesoup.openforum.transaction.HttpResponseHeader;

public class OpenForumRedirector {
    private String domain;

    public OpenForumRedirector(String domain) {
        this.domain = domain;
    }

    public boolean redirect(ClientConnectionInterface connection,
                    HttpHeader httpHeader) {

        String request = httpHeader.getChild("request").getValue();
        //String method = httpHeader.getChild("method").getValue();

        HttpResponseHeader responseHeader = new HttpResponseHeader(
                httpHeader, "text/html", ClientConnection.MOVED_PERMANENTLY, connection);
        responseHeader.addParameter("location", domain + request); // Rediect to https page

        connection.sendEmpty();

        return true;
    }
}
