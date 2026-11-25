/*
* Author: 
* Description: 
*/

var PageAccessMonitor = function() {
  var self = this;
  var VERSION = "1.0.1";
  var INSTANCE = Math.floor( Math.random()*1000000 );
  var DB = js.getObject("/OpenForum/AddOn/SQL","DB.sjs");
  var config = openForum.retrieveObject("config");
  DB.setAlias( config.getValue("database") );
  var lastTime = new Date();
  var HOUR = 60000 * 60;

  var getSitePages = function() {
    var sql = {
      query: "select site, page_name, views_hour as views from page_access"
    };

    return DB.run(sql);
  };

  var processUserJourneys = function() {
    
  };
  
  var lookupUserAgent = function() {
    //https://www.useragentstring.com/pages/useragentstring.php
  };
                                    
  var lookupIpAddress = function() {
    //"https://api.iplocation.net/?ip=";
  };
  
  var incrementHourlyViews = function(site,page,hourlyViews) {
    var sql = {
      query: "insert into page_access (site," +
      "   page_name," +
      "   views_hour," +
      "   views_day," +
      "   views_week," +
      "   views_month," +
      "  views_year," +
      "  last_hour,"+
      "  last_day,"+
      "  last_week,"+
      "  last_month,"+
      "  last_year" +
      ")  values ('{{site}}'," +
      "  '{{page}}'," +
      "  {{hourlyViews}}," +
      "  0,0,0,0," +
      "  0,0,0,0,0" +
      "  )  ON CONFLICT (site," +
      "  page_name) DO UPDATE set views_hour = page_access.views_hour+{{hourlyViews}}",
      data: {
        "site": site,
        "page": page,
        "hourlyViews": hourlyViews
      }
    };
    DB.execute( sql );
  };

  var recordPageAccessDiary = function(site,pageName,date,views) {
    if(views==0) return;

    /*var sql = {
      query: "insert into page_access_diary (site," +
      "  page_name," +
      "  date," +
      "  views) values ('{{site}}'," +
      "  '{{pageName}}'," +
      "  {{date}}," +
      "  {{views}})",
      data: {
        "site": site,
        "pageName": pageName,
        "date": date,
        "views": views
      }
    };*/
    	var sql = {
		action: "upsert",
		table: "page_access_diary",
  		data: {
			site: site,
			page_name: pageName,
			date: date,
			views: views
		},
		uniqueColumns: [
			"site",
			"page_name",
			"date"
		]
	};
    
    DB.execute( sql );
  };

  var updatePageAccess = function(site,pageName) {
    var now = new Date();

    var sql = {
      query: "update page_access set views_day = " +
      "( select views_day + views_hour from page_access where site='{{site}}' and page_name='{{pageName}}' ) " +
      "where site='{{site}}' and page_name='{{pageName}}'",
      data: {
        "site": site,
        "pageName": pageName
      }
    };
    DB.execute(sql);

    var sql = {
      query: "update page_access set views_week = " +
      "( select views_week + views_hour from page_access where site='{{site}}' and page_name='{{pageName}}' ) " +
      "where site='{{site}}' and page_name='{{pageName}}'",
      data: {
        "site": site,
        "pageName": pageName
      }
    };
    DB.execute(sql);

    var sql = {
      query: "update page_access set views_month = " +
      "( select views_month + views_hour from page_access where site='{{site}}' and page_name='{{pageName}}' ) " +
      "where site='{{site}}' and page_name='{{pageName}}'",
      data: {
        "site": site,
        "pageName": pageName
      }
    };
    DB.execute(sql);

    var sql = {
      query: "update page_access set views_year = " +
      "( select views_year + views_hour from page_access where site='{{site}}' and page_name='{{pageName}}' ) " +
      "where site='{{site}}' and page_name='{{pageName}}'",
      data: {
        "site": site,
        "pageName": pageName
      }
    };
    DB.execute(sql);

    //Reset Hour
    sql = {
      query: "update page_access "+
      "set last_hour = views_hour " +
      "where site='{{site}}' and page_name='{{pageName}}'",
      data: {
        "site": site,
        "pageName": pageName
      }
    };
    DB.execute(sql);
    sql = {
      query: "update page_access "+
      "set views_hour = 0 " +
      "where site='{{site}}' and page_name='{{pageName}}'",
      data: {
        "site": site,
        "pageName": pageName
      }
    };
    DB.execute(sql);

    //If new day, reset day
    if( now.getDate() != lastTime.getDate() ) {
      sql = {
        query: "update page_access "+
        "set last_day = views_day " +
        "where site='{{site}}' and page_name='{{pageName}}'",
        data: {
          "site": site,
          "pageName": pageName
        }
      };
      DB.execute(sql);
      sql = {
        query: "update page_access "+
        "set views_day = 0 " +
        "where site='{{site}}' and page_name='{{pageName}}'",
        data: {
          "site": site,
          "pageName": pageName
        }
      };
      DB.execute(sql);

      //If new week, reset week
      if( now.getDay() == 1 ) { //Monday
        sql = {
          query: "update page_access "+
          "set last_week = views_week " +
          "where site='{{site}}' and page_name='{{pageName}}'",
          data: {
            "site": site,
            "pageName": pageName
          }
        };
        DB.execute(sql);
        sql = {
          query: "update page_access "+
          "set views_week = 0 " +
          "where site='{{site}}' and page_name='{{pageName}}'",
          data: {
            "site": site,
            "pageName": pageName
          }
        };
        DB.execute(sql);
      }
      //If new month, reset month
      if(now.getMonth() != lastTime.getMonth()) {
        sql = {
          query: "update page_access "+
          "set last_month = views_month " +
          "where site='{{site}}' and page_name='{{pageName}}'",
          data: {
            "site": site,
            "pageName": pageName
          }
        };
        DB.execute(sql);
        sql = {
          query: "update page_access "+
          "set views_month = 0 " +
          "where site='{{site}}' and page_name='{{pageName}}'",
          data: {
            "site": site,
            "pageName": pageName
          }
        };
        DB.execute(sql);
      }
      //If new year, reset year
      if(now.getFullYear() != lastTime.getFullYear()) {
        sql = {
          query: "update page_access "+
          "set last_year = views_year " +
          "where site='{{site}}' and page_name='{{pageName}}'",
          data: {
            "site": site,
            "pageName": pageName
          }
        };
        DB.execute(sql);
        sql = {
          query: "update page_access "+
          "set views_year = 0 " +
          "where site='{{site}}' and page_name='{{pageName}}'",
          data: {
            "site": site,
            "pageName": pageName
          }
        };
        DB.execute(sql);
      }
    }
  };

  self.processViews = function(force) {
    var now = new Date();
    if(lastTime.getHours()!=now.getHours() || force==true) {

      var logFileName = "log-hr-"+now.getHours()+".txt";
      file.saveAttachmentNoBackup( "/OpenForum/AddOn/DataLogger/PageAccessMonitor",logFileName,"Running processViews v " + VERSION + " i " + INSTANCE + " at " + new Date() + " \n" );
      
      //Hourly logging
      var pages = getSitePages();
      var date = Math.floor(now.getTime()/HOUR)*HOUR;
      
      var exceptions = [];
      //For each site and page
      for(var p in pages) {
        try{
          var page = pages[p];

          file.appendStringToFileNoBackup( "/OpenForum/AddOn/DataLogger/PageAccessMonitor",logFileName,"Processing page " + page.page_name + "\n" );
          
          //Log for hour
          recordPageAccessDiary(page.site,page.page_name,date,page.views);
          file.appendStringToFileNoBackup( "/OpenForum/AddOn/DataLogger/PageAccessMonitor",logFileName,"  Processed Diary\n" );

          //Update buckets
          updatePageAccess(page.site,page.page_name);
          file.appendStringToFileNoBackup( "/OpenForum/AddOn/DataLogger/PageAccessMonitor",logFileName,"  Processed Page Access\n" );
        } catch(e) {
          file.appendStringToFileNoBackup( "/OpenForum/AddOn/DataLogger/PageAccessMonitor",logFileName,"  Exception " + e + "\n" );
          exceptions.push(e);
        }
      }

      lastTime = now;

      if(exceptions.length>0) {
        var message = "Exceptions: \n";
        for(var e in exceptions) {
          message += e+ ". " + exceptions[e] + "\n";
        }
        throw message;
      }
      
      file.appendStringToFileNoBackup( "/OpenForum/AddOn/DataLogger/PageAccessMonitor",logFileName,"  Completed at " + new Date() + "\n" );
    }
  };

  /* Used in service /OpenForum/AddOn/DataLogger/PageAccessMonitor logPageAccess */
  self.logPageAccess = function(site,pages) {
    //file.saveAttachmentNoBackup("/OpenForum/AddOn/DataLogger/PageAccessMonitor","page-data.json",JSON.stringify(pages)+" Site:"+ site +" "+new Date());

    for(var i in pages) {
      try{
        var page = pages[i];
        incrementHourlyViews( site,page.pageName,page.count );
      } catch(e) {
        file.saveAttachmentNoBackup("/OpenForum/AddOn/DataLogger/PageAccessMonitor","page-data-error.txt",e);
      }
    }

    var result = "done";
    return result;
  };

  /* Used in service /OpenForum/AddOn/DataLogger/PageAccessMonitor getPageAccessData */
  self.getPageAccessData = function(site,pageName) {
    var sql = {
      query: "select * from page_access order by site, views_day desc"
    };

    if(site && site!="") {
      if(pageName && pageName!="") {
        sql = {
          query: "select * from page_access where site='{{site}}' and page_name='{{pageName}}' order by site, views_day desc, page_name",
          data: {
            site: site,
            pageName: pageName
          }
        };
      } else {
        sql = {
          query: "select * from page_access where site='{{site}}' order by site, views_day desc, page_name",
          data: {
            site: site
          }
        };
      }
    }

    return DB.run(sql);
  };

  /* Used in service /OpenForum/AddOn/DataLogger/PageAccessMonitor getSiteAccesData */
  self.getSiteAccesData = function() {

    var sql = {
      query: "select site, sum(views_hour) as views_hour, sum(views_day) as views_day from page_access group by site"
    };
    return DB.run(sql);
  };

  /* ===== User journeys (Marketing App MA-T-004 / MA-T-005 / MA-T-006 / MA-T-012) =====
   * Every server, open-forum included, only buffers page views and events in memory
   * (RemoteLogger/LogUserJourney/UserJourneyLogger.sjs), which sends them to open-forum every ten seconds.
   * Only open-forum stores them: logUserJourneys receives the batches, checks the shared key, hashes the
   * IP addresses and inserts into user_journey and marketing_event (see create-tables.sql).
   * The raw IP address is never stored: visitor_id is a salted SHA-256 of IP address plus user agent and
   * ip_hash a salted SHA-256 of the IP address alone. The salt lives only in user_journey_settings.
   *
   * Release: change LOGGER_PATH, LOGGER_KEY and KEY_PAGE (to /OpenForum/Users/Admin) to the live locations.
   */
  var LOGGER_PATH = "/OpenForum/AddOn/RemoteLogger/LogUserJourney";
  var LOGGER_KEY = "/OpenForum/AddOn/RemoteLogger/LogUserJourney/UserJourneyLogger";
  var KEY_PAGE = "/OpenForum/AddOn/RemoteLogger/LogUserJourney/Private";
  var KEY_FILE = "journey-log-key.txt";
  var JOURNEY_FILE_PAGE = "/OpenForum/AddOn/DataLogger/PageAccessMonitor";
  var JOURNEY_FILE_NAME = "user-journey.tsv";
  var SESSION_GAP = 30 * 60000;
  var MAX_IMPORT_LINES = 5000;
  var IMPORT_BATCH = 250;
  var MAX_BATCH_ITEMS = 1000;
  var SITE_NAME = /^[A-Za-z0-9 .,&'()_-]{1,100}$/;
  var NAME = /^[a-zA-Z0-9._-]{1,50}$/;
  var ITEM = /^[A-Za-z0-9 ._:\/-]{0,100}$/;   //optional event detail, e.g. a product id
  var ORDER_REF = /^[A-Za-z0-9_-]{0,40}$/;     //optional order or basket number
  var PAID_STATUSES = {"paid": true, "recieved": true, "received": true};
  var MAX_SHOP_ORDERS = 500;
  var MAX_SHOP_PRODUCTS = 2000;

  var esc = function(value) {
    if(value===null || typeof value=="undefined") return "";
    return (""+value).replace(/'/g,"''");
  };

  //This SQL layer returns NULL columns as an empty object, so guard every text column read
  var sqlText = function(value) {
    if(value===null || typeof value=="undefined") return "";
    if(typeof value=="object") return "";
    return ""+value;
  };

  var sqlNumber = function(value) {
    var n = parseInt(sqlText(value),10);
    return isNaN(n) ? 0 : n;
  };

  var toTime = function(value,name) {
    var text = ""+value;
    if(!/^[0-9]{1,15}$/.test(text)) throw name + " must be a time in milliseconds";
    return parseInt(text,10);
  };

  var cleanText = function(value) {
    if(value===null || typeof value=="undefined") return "";
    var text = ""+value;
    if(text=="null" || text=="undefined") return "";
    return text;
  };

  //Page names always start with one "/" (some templates send "QuickStart" or "//OpenForum/...")
  var cleanPageName = function(pageName) {
    var text = cleanText(pageName).replace(/^\/+/,"/");
    if(text!="" && text.charAt(0)!="/") text = "/" + text;
    return text;
  };

  //The server-wide buffer every page view and event goes into (same key as collect-user-journey-data.sjs)
  var getLogger = function() {
    var logger = null;
    try {
      logger = openForum.retrieveObject(LOGGER_KEY);
    } catch(e) {
      //First time
    }
    if(logger==null) {
      logger = js.getObject(LOGGER_PATH,"UserJourneyLogger.sjs");
      openForum.storeObject(LOGGER_KEY, logger);
    }
    return logger;
  };

  var readKey = function() {
    try {
      if(!file.attachmentExists(KEY_PAGE, KEY_FILE)) return "";
      return (""+file.getAttachment(KEY_PAGE, KEY_FILE)).replace(/^\s+|\s+$/g,"");
    } catch(e) {
      return "";
    }
  };

  var getJourneySetting = function(key) {
    var rows = DB.run({query: "select setting_value from user_journey_settings where setting_key='{{key}}'", data: {key: key}});
    if(rows.length==0) return null;
    return sqlText(rows[0].setting_value);
  };

  var putJourneySetting = function(key,value) {
    DB.execute({action: "upsert", table: "user_journey_settings",
      data: {setting_key: key, setting_value: value}, uniqueColumns: ["setting_key"]});
  };

  var sha256 = function(text) {
    var md = java.security.MessageDigest.getInstance("SHA-256");
    var bytes = md.digest(new java.lang.String(text).getBytes("UTF-8"));
    var hex = "";
    for(var i=0; i<bytes.length; i++) {
      var b = (bytes[i] & 0xff).toString(16);
      if(b.length<2) b = "0"+b;
      hex += b;
    }
    return hex;
  };

  var getVisitorSalt = function() {
    var salt = null;
    try {
      salt = openForum.retrieveObject("userJourneyVisitorSalt");
    } catch(e) {
      //Not cached yet
    }
    if(salt!=null && (""+salt).length>0) return ""+salt;

    salt = getJourneySetting("visitor_salt");
    if(salt==null || salt=="") {
      var random = new java.security.SecureRandom();
      var bytes = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 32);
      random.nextBytes(bytes);
      var hex = "";
      for(var i=0; i<bytes.length; i++) {
        var b = (bytes[i] & 0xff).toString(16);
        if(b.length<2) b = "0"+b;
        hex += b;
      }
      //Insert only if still missing, then read back so concurrent first requests agree
      DB.execute("insert into user_journey_settings (setting_key, setting_value) values ('visitor_salt','"+hex+"') on conflict (setting_key) do nothing");
      salt = getJourneySetting("visitor_salt");
    }
    openForum.storeObject("userJourneyVisitorSalt", new java.lang.String(salt));
    return salt;
  };

  //Old file lines hold "host.name/1.2.3.4:5678", "/1.2.3.4:5678" or "1.2.3.4"; the port changes per connection
  var cleanIpAddress = function(address) {
    var text = ""+address;
    var slash = text.lastIndexOf("/");
    if(slash!=-1) text = text.substring(slash+1);
    var ipv4WithPort = /^([0-9]{1,3}(\.[0-9]{1,3}){3}):[0-9]+$/.exec(text);
    if(ipv4WithPort) return ipv4WithPort[1];
    var bracketedWithPort = /^\[(.*)\]:[0-9]+$/.exec(text);
    if(bracketedWithPort) return bracketedWithPort[1];
    return text;
  };

  //Both hashes use the same salt; the Marketing App hashes an IP entered in Settings the same way
  var visitorHash = function(salt, ip, agent) {
    return sha256(salt + "|" + ip + "|" + agent).substring(0,32);
  };

  var ipHash = function(salt, ip) {
    return sha256(salt + "|ip|" + ip).substring(0,32);
  };

  //Reads src, campaign and placement (or utm_source, utm_campaign, utm_content) from a query string
  var readCampaignTags = function(queryString) {
    var tags = {src: "", campaign: "", placement: ""};
    if(!queryString) return tags;
    var parts = (""+queryString).replace(/^\?/,"").split("&");
    for(var i=0; i<parts.length; i++) {
      var pair = parts[i].split("=");
      var name = pair[0].toLowerCase();
      var value = "";
      try { value = decodeURIComponent((pair[1] || "").replace(/\+/g," ")); } catch(e) { value = pair[1] || ""; }
      value = value.substring(0,100);
      if(name=="src" || (name=="utm_source" && tags.src=="")) tags.src = value;
      else if(name=="campaign" || (name=="utm_campaign" && tags.campaign=="")) tags.campaign = value;
      else if(name=="placement" || (name=="utm_content" && tags.placement=="")) tags.placement = value;
    }
    return tags;
  };

  //Builds a user_journey row from a page name that may carry a query string with campaign tags
  var journeyRow = function(site, page, referrer, time, ip, agent, userName, source, salt) {
    page = cleanText(page);
    var query = "";
    var q = page.indexOf("?");
    if(q!=-1) {
      query = page.substring(q+1);
      page = page.substring(0,q);
    }
    var tags = readCampaignTags(query);
    agent = cleanText(agent).substring(0,500);
    return {
      site: site, pageName: cleanPageName(page).substring(0,500), referrer: cleanText(referrer).substring(0,1000),
      src: tags.src, campaign: tags.campaign, placement: tags.placement, time: time,
      visitorId: visitorHash(salt, ip, agent), ipHash: ipHash(salt, ip),
      userAgent: agent, userName: cleanText(userName).substring(0,100), source: source
    };
  };

  var journeyValues = function(row) {
    return "('" + esc(row.site) + "','" + esc(row.pageName) + "','" + esc(row.referrer) + "','" +
      esc(row.src) + "','" + esc(row.campaign) + "','" + esc(row.placement) + "'," +
      row.time + ",'" + esc(row.visitorId) + "','" + esc(row.userAgent) + "','" +
      esc(row.userName) + "','" + esc(row.source) + "','" + esc(row.ipHash) + "')";
  };

  var JOURNEY_INSERT = "insert into user_journey (site, page_name, referrer, src, campaign, placement,"+
    " time_stamp, visitor_id, user_agent, user_name, source, ip_hash) values ";

  var EVENT_INSERT = "insert into marketing_event (site, app, step, time_stamp, visitor_id, ip_hash, page_name, user_name, item, order_ref) values ";

/* Used in service /OpenForum/AddOn/DataLogger/PageAccessMonitor logUserJourney */
   //Example use: PageAccessMonitor.logUserJourney(currentPage,referrer,userAgent,transaction)
   //Adds the page view to this server's buffer; it reaches open-forum's database within about ten seconds
   self.logUserJourney = function(currentPage,referrer,userAgent,transaction) {
     if(currentPage==null) return "";
     return getLogger().addJourney(currentPage, referrer, userAgent,
       transaction.getConnection().getInetAddress(), cleanText(transaction.getUser()));
    };

  /* Used in service logEvent (public) - records a conversion event such as sign-up or first use.
     The browser helper track-event.js calls this. Buffered and sent like page views. */
  self.logEvent = function(app,step,pageName,userAgent,item,orderRef,transaction) {
    app = cleanText(app);
    step = cleanText(step);
    item = cleanText(item);
    orderRef = cleanText(orderRef);
    if(!NAME.test(app)) throw "app must be 1 to 50 letters, digits, dots, dashes or underscores";
    if(!NAME.test(step)) throw "step must be 1 to 50 letters, digits, dots, dashes or underscores";
    if(!ITEM.test(item)) throw "item must be up to 100 letters, digits, spaces, dots, colons, slashes, dashes or underscores";
    if(!ORDER_REF.test(orderRef)) throw "order must be up to 40 letters, digits, dashes or underscores";
    return getLogger().addEvent(app.toLowerCase(), step.toLowerCase(), cleanPageName(cleanText(pageName).split("?")[0]),
      userAgent, transaction.getConnection().getInetAddress(), cleanText(transaction.getUser()), item, orderRef);
  };

  /* Used in service logUserJourneys (open-forum only) - receives a batch from a server's UserJourneyLogger.
     batch: {site, webAddress, journeys: [{p, r, a, ip, u, t}], events: [{app, step, p, a, ip, u, t}]} */
  self.logUserJourneys = function(key, batchJson) {
    var expected = readKey();
    if(expected=="") throw "This server has no journey log key, so it cannot accept journeys";
    if(""+key!==expected) throw "Not Authorised";

    var batch = JSON.parse(""+batchJson);
    var site = cleanText(batch.site);
    if(!SITE_NAME.test(site)) throw "site must be the sending server's serverName";
    var webAddress = cleanText(batch.webAddress).substring(0,200);
    if(webAddress!="" && !/^https?:\/\/[A-Za-z0-9.:-]+\/?$/.test(webAddress)) webAddress = "";
    var journeys = batch.journeys || [];
    var events = batch.events || [];
    if(journeys.length>MAX_BATCH_ITEMS || events.length>MAX_BATCH_ITEMS) throw "Batch too large";

    var salt = getVisitorSalt();
    var now = new Date().getTime();
    var validTime = function(t) {
      var n = parseInt(""+t,10);
      //Not before 2020 and not more than an hour ahead of this server's clock
      return (!isNaN(n) && n>1577836800000 && n<now+3600000) ? n : null;
    };

    var values = [], skipped = 0, stored = 0;
    for(var i=0; i<journeys.length; i++) {
      var j = journeys[i] || {};
      var time = validTime(j.t);
      if(time===null || cleanText(j.p)=="") { skipped++; continue; }
      values.push(journeyValues(journeyRow(site, j.p, j.r, time, cleanIpAddress(cleanText(j.ip).substring(0,60)), j.a, j.u, "live", salt)));
      if(values.length>=IMPORT_BATCH) {
        DB.execute(JOURNEY_INSERT + values.join(","));
        stored += values.length;
        values = [];
      }
    }
    if(values.length>0) {
      DB.execute(JOURNEY_INSERT + values.join(","));
      stored += values.length;
    }

    var eventValues = [];
    for(var e=0; e<events.length; e++) {
      var ev = events[e] || {};
      var eventTime = validTime(ev.t);
      var app = cleanText(ev.app).toLowerCase(), step = cleanText(ev.step).toLowerCase();
      var item = cleanText(ev.item), orderRef = cleanText(ev.order);
      if(eventTime===null || !NAME.test(app) || !NAME.test(step) || !ITEM.test(item) || !ORDER_REF.test(orderRef)) { skipped++; continue; }
      var ip = cleanIpAddress(cleanText(ev.ip).substring(0,60));
      var agent = cleanText(ev.a).substring(0,500);
      eventValues.push("('" + esc(site) + "','" + esc(app) + "','" + esc(step) + "'," + eventTime + ",'" +
        esc(visitorHash(salt, ip, agent)) + "','" + esc(ipHash(salt, ip)) + "','" +
        esc(cleanPageName(ev.p).substring(0,500)) + "','" + esc(cleanText(ev.u).substring(0,100)) + "','" +
        esc(item) + "','" + esc(orderRef) + "')");
    }
    if(eventValues.length>0) DB.execute(EVENT_INSERT + eventValues.join(","));

    DB.execute({action: "upsert", table: "user_journey_site",
      data: {site_name: site, web_address: webAddress, last_batch_time: ""+now},
      uniqueColumns: ["site_name"]});

    return {journeys: stored, events: eventValues.length, skipped: skipped};
  };

  var toInt = function(value) {
    var n = parseInt(""+value, 10);
    return isNaN(n) ? 0 : n;
  };

  /* Used in service logShopData (open-forum only) - receives a shop's product list and changed orders from its
     ShopOrderLogger (RemoteLogger/LogShopOrders), checked with the same shared key as journeys.
     batch: {site, webAddress, products: [{id, name, page, price, available}],
             orders: [{id, status, orderTime, items: [{productId, name, quantity, price, total}], itemCount,
                       total, postage, totalIncPostage, coupons: []}]}
     No customer details are sent or stored. An order whose snapshot is unchanged is ignored, so resending after a
     restart is harmless. last_change is when open-forum first saw the current snapshot (the order's own time
     on first sight), and paid_time when it first saw the order paid (its order time for orders already paid). */
  self.logShopData = function(key, batchJson) {
    var expected = readKey();
    if(expected=="") throw "This server has no journey log key, so it cannot accept shop data";
    if(""+key!==expected) throw "Not Authorised";

    var batch = JSON.parse(""+batchJson);
    var site = cleanText(batch.site);
    if(!SITE_NAME.test(site)) throw "site must be the sending server's serverName";
    var products = batch.products || [];
    var orders = batch.orders || [];
    if(products.length>MAX_SHOP_PRODUCTS || orders.length>MAX_SHOP_ORDERS) throw "Batch too large";
    var now = new Date().getTime();

    var productCount = 0;
    for(var p=0; p<products.length; p++) {
      var product = products[p] || {};
      var productId = cleanText(product.id).substring(0,40);
      if(productId=="") continue;
      DB.execute("insert into shop_product (site, product_id, name, page, price, available, updated) values ('" + esc(site) + "','" +
        esc(productId) + "','" + esc(cleanText(product.name).substring(0,200)) + "','" + esc(cleanPageName(product.page).substring(0,500)) + "'," +
        toInt(product.price) + "," + (product.available===false ? "false" : "true") + "," + now + ")" +
        " on conflict (site, product_id) do update set name=excluded.name, page=excluded.page, price=excluded.price," +
        " available=excluded.available, updated=excluded.updated");
      productCount++;
    }

    var stored = 0, unchanged = 0;
    for(var o=0; o<orders.length; o++) {
      var order = orders[o] || {};
      var orderId = cleanText(order.id).substring(0,40);
      if(orderId=="" || !ORDER_REF.test(orderId)) continue;
      var orderStatus = cleanText(order.status).substring(0,40);
      var items = order.items || [];
      var hash = sha256(JSON.stringify({s: orderStatus, i: items, t: order.total, p: order.postage, c: order.coupons})).substring(0,32);

      var existing = DB.run({query: "select snapshot_hash, paid_time from shop_order where site='" + esc(site) + "' and order_id='" + esc(orderId) + "'"});
      if(existing.length>0 && sqlText(existing[0].snapshot_hash)==hash) { unchanged++; continue; }

      var orderTime = toInt(order.orderTime);
      var isPaid = PAID_STATUSES[orderStatus.toLowerCase()]===true;
      var paidTime = existing.length>0 ? sqlNumber(existing[0].paid_time) : 0;
      if(isPaid && paidTime==0) paidTime = existing.length>0 ? now : (orderTime || now);
      if(!isPaid) paidTime = 0;
      var lastChange = existing.length>0 ? now : (orderTime || now);
      var coupons = [];
      for(var c=0; c<(order.coupons || []).length; c++) coupons.push(cleanText(order.coupons[c]).substring(0,40));

      DB.execute("insert into shop_order (site, order_id, status, order_time, item_count, total, postage, total_inc_postage, coupons," +
        " snapshot_hash, first_seen, last_change, paid_time) values ('" + esc(site) + "','" + esc(orderId) + "','" + esc(orderStatus) + "'," +
        orderTime + "," + toInt(order.itemCount) + "," + toInt(order.total) + "," + toInt(order.postage) + "," + toInt(order.totalIncPostage) + ",'" +
        esc(coupons.join(",")) + "','" + hash + "'," + now + "," + lastChange + "," + (paidTime ? paidTime : "null") + ")" +
        " on conflict (site, order_id) do update set status=excluded.status, order_time=excluded.order_time, item_count=excluded.item_count," +
        " total=excluded.total, postage=excluded.postage, total_inc_postage=excluded.total_inc_postage, coupons=excluded.coupons," +
        " snapshot_hash=excluded.snapshot_hash, last_change=excluded.last_change, paid_time=excluded.paid_time");

      DB.execute("delete from shop_order_item where site='" + esc(site) + "' and order_id='" + esc(orderId) + "'");
      var itemValues = [];
      for(var i=0; i<items.length && i<200; i++) {
        var item = items[i] || {};
        var itemProduct = cleanText(item.productId).substring(0,40);
        if(itemProduct=="") continue;
        itemValues.push("('" + esc(site) + "','" + esc(orderId) + "','" + esc(itemProduct) + "','" + esc(cleanText(item.name).substring(0,200)) + "'," +
          toInt(item.quantity) + "," + toInt(item.price) + "," + toInt(item.total) + ")");
      }
      if(itemValues.length>0) {
        DB.execute("insert into shop_order_item (site, order_id, product_id, name, quantity, price, total) values " + itemValues.join(","));
      }
      stored++;
    }

    DB.execute({action: "upsert", table: "user_journey_site",
      data: {site_name: site, web_address: cleanText(batch.webAddress).substring(0,200), last_batch_time: ""+now},
      uniqueColumns: ["site_name"]});
    return {products: productCount, orders: stored, unchanged: unchanged};
  };

  /* Used in service getJourneySites (open-forum) - every site with journey rows, its web address,
     row counts, date span and when it last sent a batch */
  self.getJourneySites = function() {
    var rows = DB.run({query: "select j.site, count(*) as views, min(j.time_stamp) as first_time, max(j.time_stamp) as last_time,"+
      " sum(case when j.source='import' then 1 else 0 end) as imported, max(s.web_address) as web_address,"+
      " max(s.last_batch_time) as last_batch_time from user_journey j left join user_journey_site s on s.site_name=j.site"+
      " group by j.site order by j.site"});
    var sites = [];
    for(var i=0; i<rows.length; i++) {
      sites.push({site: sqlText(rows[i].site), webAddress: sqlText(rows[i].web_address), views: sqlNumber(rows[i].views),
        imported: sqlNumber(rows[i].imported), firstTime: sqlNumber(rows[i].first_time), lastTime: sqlNumber(rows[i].last_time),
        lastBatchTime: sqlNumber(rows[i].last_batch_time)});
    }
    return sites;
  };

  /* Used in service getJourneySettings - this server's name, import position and buffer status.
     Never returns the visitor salt or the key. */
  self.getJourneySettings = function() {
    var next = getJourneySetting("import_next_line");
    return {serverName: ""+openForum.retrieveObject("config").getValue("serverName"),
      importNextLine: next ? parseInt(next,10) : 0, logger: getLogger().getStatus()};
  };

  /* Used in service importUserJourneyFile (open-forum) - imports up to maxLines lines of this server's old
     user-journey.tsv, continuing from where the last call stopped. The file itself is only read. */
  self.importUserJourneyFile = function(maxLines) {
    maxLines = parseInt(""+maxLines,10);
    if(isNaN(maxLines) || maxLines<1) maxLines = 1000;
    if(maxLines>MAX_IMPORT_LINES) maxLines = MAX_IMPORT_LINES;
    var site = ""+openForum.retrieveObject("config").getValue("serverName");

    if(!file.attachmentExists(JOURNEY_FILE_PAGE,JOURNEY_FILE_NAME)) {
      return {totalLines: 0, read: 0, inserted: 0, skipped: 0, skippedLines: [], nextLine: 0, done: true};
    }
    var lines = (""+file.getAttachment(JOURNEY_FILE_PAGE,JOURNEY_FILE_NAME)).split("\n");
    if(lines.length>0 && lines[lines.length-1]=="") lines.pop();

    var start = parseInt(getJourneySetting("import_next_line") || "0",10);
    var end = Math.min(lines.length, start + maxLines);
    var salt = getVisitorSalt();

    var values = [];
    var inserted = 0;
    var skipped = [];
    for(var i=start; i<end; i++) {
      var fields = lines[i].split("\t");
      if(fields.length<5 || !/^[0-9]{10,15}$/.test(fields[2])) {
        skipped.push({line: i+1, reason: fields.length<5 ? "only " + fields.length + " fields" : "bad time value"});
        continue;
      }
      //User agents can contain tabs, so rejoin anything after the fourth field
      values.push(journeyValues(journeyRow(site, fields[0], fields[1], parseInt(fields[2],10),
        cleanIpAddress(fields[3]), fields.slice(4).join("\t"), "", "import", salt)));
      if(values.length>=IMPORT_BATCH) {
        DB.execute(JOURNEY_INSERT + values.join(","));
        inserted += values.length;
        values = [];
      }
    }
    if(values.length>0) {
      DB.execute(JOURNEY_INSERT + values.join(","));
      inserted += values.length;
    }
    putJourneySetting("import_next_line",""+end);

    return {totalLines: lines.length, read: end-start, inserted: inserted, skipped: skipped.length,
      skippedLines: skipped.slice(0,50), nextLine: end, done: end>=lines.length};
  };

  /* Used in service resetUserJourneyImport - removes this server's imported rows only (never live ones)
     and starts the import again from the first line */
  self.resetUserJourneyImport = function() {
    var site = ""+openForum.retrieveObject("config").getValue("serverName");
    var before = sqlNumber(DB.run({query: "select count(*) as n from user_journey where source='import' and site='" + esc(site) + "'"})[0].n);
    DB.execute("delete from user_journey where source='import' and site='" + esc(site) + "'");
    putJourneySetting("import_next_line","0");
    return {deleted: before};
  };

  /* Used in service getJourneySummary - kept for compatibility; the Marketing App uses its own getSummary */
  self.getJourneySummary = function(site,startTime,endTime) {
    startTime = toTime(startTime,"startTime");
    endTime = toTime(endTime,"endTime");
    var where = " where time_stamp>=" + startTime + " and time_stamp<" + endTime;
    if(site && site!="") where += " and site='" + esc(site) + "'";
    var totals = DB.run({query: "select count(*) as views, count(distinct visitor_id) as visitors from user_journey" + where})[0];
    return {site: site || "", startTime: startTime, endTime: endTime, views: sqlNumber(totals.views), visitors: sqlNumber(totals.visitors)};
  };
  /*---8<---Add Funtions Below Here--->8---*/
};

