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

/* Used in service /OpenForum/AddOn/DataLogger/PageAccessMonitor logUserJourney */
   //Example use: PageAccessMonitor.logUserJourney(currentPage,referrer,userAgent,transaction)
   self.logUserJourney = function(currentPage,referrer,userAgent,transaction) {
    var result = "ok";
     if(currentPage==null) return "";
     file.appendStringToFileNoBackup( "/OpenForum/AddOn/DataLogger/PageAccessMonitor","user-journey.tsv",currentPage+"\t"+referrer+"\t"+new Date().getTime()+"\t"+transaction.getConnection().getInetAddress()+"\t"+userAgent+"\n" );
    return result;
    };
  /*---8<---Add Funtions Below Here--->8---*/
};