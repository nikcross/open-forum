//  Server side
//    Include library and set database alias
var DB = js.getObject("/OpenForum/AddOn/SQL","DB.sjs");
DB.setAlias("open-forum");

// Query

// add {{field name}} in query and set the field in data
var sql = {
    query: "insert into page_access (site," +
 "   page_name," +
 "   views_hour," +
 "   views_day," +
 "   views_week," +
 "   views_month," +
 "   views_year)  values ('test'," +
 "  'test/page'," +
 "  {{hourlyViews}}," +
 "  0," +
 "  0," +
 "  0," +
 "  0)  ON CONFLICT (site," +
 "  page_name) DO UPDATE set views_hour = page_access.views_hour+{{hourlyViews}}",
    data: {

    "hourlyViews": ""    }
  };
DB.execute( sql );

// Query

// add {{field name}} in query and set the field in data
var sql = {
    query: "insert into page_access_diary (site," +
 "  page_name," +
 "  date," +
 "  views) values ('test'," +
 "  'test/page'," +
 "  {{date}}," +
 "  {{hourlyViews}})",
    data: {

    "date": "",
    "hourlyViews": ""    }
  };
DB.execute( sql );