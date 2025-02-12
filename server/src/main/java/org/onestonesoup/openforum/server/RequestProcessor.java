    package org.onestonesoup.openforum.server;

    import com.sun.net.httpserver.HttpExchange;
    import com.sun.net.httpserver.HttpHandler;
    import com.sun.net.httpserver.HttpsExchange;
    import org.onestonesoup.core.data.EntityTree;
    import org.onestonesoup.openforum.controller.OpenForumController;

    import java.io.*;
    import java.net.URLDecoder;
    import java.util.List;

     //: Accept-encoding = [gzip, deflate, br, zstd]
    // : Cookie = [draenog=ubB7vzGDrk29nKBEGsdtdDTrsXThdu3P0nrv2_hywX24; m=; JSESSIONID=cn0TKq_rM8H_GS_0jXgMy6Q7hkESlR7g3RsmW35W; visited=yes; openForumSession=34008dccd2d2968066220dc76a9656e4]
    // : Sec-ch-ua = ["Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"]
    // : Accept = [text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7]
    //        : Sec-fetch-dest = [document]
    //        : Sec-fetch-user = [?1]
    //        : Connection = [keep-alive]
    //        : Host = [localhost:8000]
    //        : Sec-fetch-site = [none]
    //        : Sec-ch-ua-platform = ["Linux"]
    //        : Sec-fetch-mode = [navigate]
    //        : User-agent = [Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36]
    //        : Accept-language = [en-GB,en-US;q=0.9,en;q=0.8]
    //        : Upgrade-insecure-requests = [1]
    //        : Sec-ch-ua-mobile = [?0]
    //        : Cache-control = [max-age=0]

    public class RequestProcessor implements HttpHandler {
        public void handle(HttpExchange httpExchange) throws IOException {

            try {
                String host = httpExchange.getRequestHeaders().getFirst("Host");
                if (host != null && host.indexOf(":") != -1) {
                    host = host.substring(0, host.indexOf(":"));
                }

                String requestURI = httpExchange.getRequestURI().getPath();
                //requestURI = requestURI.substring(request.getContextPath().length());
                requestURI = URLDecoder.decode(requestURI);

                HttpHeader httpHeader = new HttpHeader();
                httpHeader.addChild("method").setValue(httpExchange.getRequestMethod().toLowerCase());
                httpHeader.addChild("request").setValue(requestURI);
                httpHeader.addChild("host").setValue(httpExchange.getRequestURI().getHost());

                if (httpExchange instanceof HttpsExchange) {
                    httpHeader.addChild("secure").setValue("true");
                } else {
                    httpHeader.addChild("secure").setValue("false");
                }
                httpHeader.addChild("content-type").setValue(httpExchange.getRequestHeaders().getFirst("Content-type"));
                httpHeader.addChild("content-length").setValue(httpExchange.getRequestHeaders().getFirst("Content-length"));
            /*if(request.getHeaders("authorization").hasMoreElements()) {
                httpHeader.addChild("authorization").setValue(""+request.getHeaders("authorization").nextElement());
            }*/
                httpHeader.addChild("authorization").setValue(httpExchange.getRequestHeaders().getFirst("Authorization"));

                OpenForumRedirector redirector = OpenForumServer.getRedirector(host);
                if (redirector != null) {
                    ClientConnectionInterface connection = new ClientConnection(
                            httpExchange.getRemoteAddress().toString(),
                            httpExchange.getRequestBody(),
                            httpExchange
                    );

                    redirector.redirect(connection, httpHeader);
                    return;
                }

                OpenForumController controller = OpenForumServer.getController(host);
                if (controller == null) {
                    redirector = OpenForumServer.getRedirector("default");
                    if (redirector != null) {
                        ClientConnectionInterface connection = new ClientConnection(
                                httpExchange.getRemoteAddress().toString(),
                                httpExchange.getRequestBody(),
                                httpExchange
                        );
                        redirector.redirect(connection, httpHeader);
                        return;
                    }
                    throw new OpenForumRequestException("No controller found for host " + host);
                }

                EntityTree.TreeEntity params = httpHeader.addChild("parameters");
                String query = httpExchange.getRequestURI().getQuery();
                if (query != null) {
                    String[] pairs = query.split("&");
                    for (String pair : pairs) {
                        int idx = pair.indexOf("=");
                        if (idx == -1) {
                            params.addChild(URLDecoder.decode(pair, "UTF-8")).setValue("");
                            continue;
                        }
                        params.addChild(URLDecoder.decode(pair.substring(0, idx), "UTF-8")).
                                setValue(URLDecoder.decode(pair.substring(idx + 1), "UTF-8"));
                    }
                }
                if ((httpExchange.getRequestHeaders().getFirst("Content-Type") == null ||
                        httpExchange.getRequestHeaders().getFirst("Content-Type").contains("application/x-www-form-urlencoded")
                ) &&
                        httpExchange.getRequestMethod().equals("POST")) {
                    String data = new String(httpExchange.getRequestBody().readAllBytes());
                    String[] pairs = data.split("&");
                    for (String pair : pairs) {
                        int idx = pair.indexOf("=");
                        if (idx == -1) {
                            params.addChild(URLDecoder.decode(pair, "UTF-8")).setValue("");
                            continue;
                        }
                        params.addChild(URLDecoder.decode(pair.substring(0, idx).trim(), "UTF-8")).
                                setValue(URLDecoder.decode(pair.substring(idx + 1).trim(), "UTF-8"));
                    }
                }

                EntityTree.TreeEntity cookies = params.addChild("$cookie");
                List<String> cookieList = httpExchange.getRequestHeaders().get("Cookie");
                if (cookieList != null) {
                    for (String cookie : cookieList) {
                        String[] pairs = cookie.split(";");
                        for (String pair : pairs) {
                            int idx = pair.indexOf("=");
                            if (idx == -1) {
                                params.addChild(URLDecoder.decode(pair, "UTF-8")).setValue("");
                                continue;
                            }
                            cookies.addChild(URLDecoder.decode(pair.substring(0, idx).trim(), "UTF-8")).
                                    setValue(URLDecoder.decode(pair.substring(idx + 1).trim(), "UTF-8"));
                        }
                    }
                }

                ClientConnectionInterface connection = new ClientConnection(
                        httpExchange.getRemoteAddress().toString(),
                        httpExchange.getRequestBody(),
                        httpExchange
                );

                boolean close = controller.getRouter().route(connection, httpHeader);
                if (close) {
                    connection.close();
                }
            } catch (Throwable e) {
                e.printStackTrace();
                try {
                    httpExchange.close();
                } catch (Throwable ex) {}
            }
        }
    }
