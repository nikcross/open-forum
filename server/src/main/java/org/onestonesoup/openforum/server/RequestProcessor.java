    package org.onestonesoup.openforum.server;

    import com.sun.net.httpserver.HttpExchange;
    import com.sun.net.httpserver.HttpHandler;
    import org.onestonesoup.core.data.EntityTree;
    import org.onestonesoup.openforum.controller.OpenForumController;

    import java.io.*;
    import java.net.URLDecoder;
    import java.util.List;

    /*
       public static class CoreHandler implements HttpHandler {
            @Override
            public void handle(HttpExchange httpsExchange) throws IOException {
                String response = "This is the response";

                response += " URI " + httpsExchange.getRequestURI() + "\n";
                response += " MTHD " + httpsExchange.getRequestMethod() + "\n";
                Iterator<String> i = httpsExchange.getRequestHeaders().keySet().iterator();
                while(i.hasNext()) {
                    String key = i.next();
                    response += " : " + key + " = " + httpsExchange.getRequestHeaders().get( key ) + "\n";
                }

                if( httpsExchange.getRequestMethod().equals("POST") ) {
                    String data = new String( httpsExchange.getRequestBody().readAllBytes() );
                    response += " POSTDATA " + data + "\n";
                }

                httpsExchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");

                if( httpsExchange.getRequestURI().getPath().equals( "/file" ) ) {

                    File file = new File( "/home/nik/Documents/backups/the-green-london-way-20231001T153529Z-001.zip" );
                    httpsExchange.sendResponseHeaders(200, file.length());
                    //OutputStream os = httpsExchange.getResponseBody();
                    //FileInputStream fileInputStream = new FileInputStream(file);
                    //os.write(response.getBytes());
                    //os.close();

    OutputStream os = httpsExchange.getResponseBody();
    BufferedOutputStream bos = new BufferedOutputStream( os );
    FileInputStream fis = new FileInputStream(file);
    BufferedInputStream bis = new BufferedInputStream(fis);
    byte[] buffer = new byte[1024*1024*10];
    int n = -1;
                    while((n = bis.read(buffer))!=-1) {
            bos.write(buffer,0,n);
                    }
                            bos.flush();
                    os.close();

                } else {
                        httpsExchange.sendResponseHeaders(200, response.getBytes().length);
    OutputStream os = httpsExchange.getResponseBody();
                    os.write(response.getBytes());
            os.close();
                }
                        }
                        }
     */


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
        public void handle(HttpExchange httpsExchange) throws IOException {

            String host = httpsExchange.getRequestHeaders().getFirst("Host");
            if(host != null && host.indexOf(":")!=-1) {
                host = host.substring(0, host.indexOf(":"));
            }

            String requestURI = httpsExchange.getRequestURI().getPath();
            //requestURI = requestURI.substring(request.getContextPath().length());
            requestURI = URLDecoder.decode(requestURI);

            HttpHeader httpHeader = new HttpHeader();
            httpHeader.addChild("method").setValue(httpsExchange.getRequestMethod().toLowerCase());
            httpHeader.addChild("request").setValue(requestURI);
            httpHeader.addChild("host").setValue(httpsExchange.getRequestURI().getHost());

            httpHeader.addChild("secure").setValue("true");
            httpHeader.addChild("content-type").setValue(httpsExchange.getRequestHeaders().getFirst("Content-type"));
            httpHeader.addChild("content-length").setValue(httpsExchange.getRequestHeaders().getFirst("Content-length"));
            /*if(request.getHeaders("authorization").hasMoreElements()) {
                httpHeader.addChild("authorization").setValue(""+request.getHeaders("authorization").nextElement());
            }*/
            httpHeader.addChild("authorization").setValue(httpsExchange.getRequestHeaders().getFirst("Authorization"));

            OpenForumRedirector redirector = OpenForumServer.getRedirector(host);
            if(redirector != null) {
                ClientConnectionInterface connection = new ClientConnection(
                        httpsExchange.getRemoteAddress().toString(),
                        httpsExchange.getRequestBody(),
                        httpsExchange
                );

                redirector.redirect( connection , httpHeader );
                return;
            }

            OpenForumController controller = OpenForumServer.getController(host);
            if(controller == null) {
                redirector = OpenForumServer.getRedirector( "default" );
                if( redirector != null ) {
                    ClientConnectionInterface connection = new ClientConnection(
                            httpsExchange.getRemoteAddress().toString(),
                            httpsExchange.getRequestBody(),
                            httpsExchange
                    );
                    redirector.redirect( connection , httpHeader );
                    return;
                }
                throw new OpenForumRequestException("No controller found for host "+host);
            }

            EntityTree.TreeEntity params = httpHeader.addChild("parameters");
            String query = httpsExchange.getRequestURI().getQuery();
            if(query!=null) {
                String[] pairs = query.split("&");
                for (String pair : pairs) {
                    int idx = pair.indexOf("=");
                    if(idx==-1) {
                        params.addChild(URLDecoder.decode(pair, "UTF-8")).setValue("");
                        continue;
                    }
                    params.addChild(URLDecoder.decode(pair.substring(0, idx), "UTF-8")).
                            setValue(URLDecoder.decode(pair.substring(idx + 1), "UTF-8"));
                }
            }
            if( (httpsExchange.getRequestHeaders().getFirst("Content-Type")==null ||
                    httpsExchange.getRequestHeaders().getFirst("Content-Type").contains("multipart/form-data") == false
                ) &&
                    httpsExchange.getRequestMethod().equals("POST") ) {
                String data = new String( httpsExchange.getRequestBody().readAllBytes() );
                String[] pairs = data.split("&");
                for(String pair : pairs) {
                    int idx = pair.indexOf("=");
                    if(idx==-1) {
                        params.addChild(URLDecoder.decode(pair, "UTF-8")).setValue("");
                        continue;
                    }
                    params.addChild(URLDecoder.decode(pair.substring(0, idx).trim(), "UTF-8")).
                            setValue(URLDecoder.decode(pair.substring(idx + 1).trim(), "UTF-8"));
                }
            }

            EntityTree.TreeEntity cookies = params.addChild("$cookie");
            List<String> cookieList = httpsExchange.getRequestHeaders().get("Cookie");
            if(cookieList!=null) {
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
                    httpsExchange.getRemoteAddress().toString(),
                    httpsExchange.getRequestBody(),
                    httpsExchange
            );

            /*
            Enumeration<String> en = request.getAttributeNames();
            while(en.hasMoreElements()) {
                String key = en.nextElement();
                controller.getLogger().info("A:"+key+"="+request.getAttribute(key));
            }*/

            try {
                controller.getRouter().route(connection, httpHeader);
            } catch (Exception e) {
                e.printStackTrace();
            } catch (Throwable e) {
                e.printStackTrace();
            }
        }
    }
