/*
* Author: 
* Description: 
*/
var EmailService = function() {
  var self = this;
  var alertHost = "https://open-forum.onestonesoup.org";

  var mailerConfig = JSON.parse(file.getAttachment("/OpenForum/Users/Admin","mailer.config"));
  var adminEmail = mailerConfig.adminEmail;

  var serverConfig = openForum.retrieveObject("config");
  var serviceName = serverConfig.getValue("serverName");

  var mailer = js.getApi("/OpenForum/AddOn/Mailer");


  var getFields = function(content) {
    var fields = content.match(/\{\{[a-zA-Z0-9-:\.%]{0,100}\}\}/g);
    fields = fields.map(function(item,index){ return item.replace("{{","").replace("}}",""); });
    return fields;
  };

  var getCss = function(cssPage,cssFile) {
    var css = "" + file.getAttachment(cssPage,cssFile);

    css = css.replace(/ +/g, '_');
    css = css.replace(/:_/g,": \"");
    css = css.replace(/;/g,"\";");
    css = css.replace(/\n\}/g,"\"\n}");

    css = css.replace(/\{_/g,"{ ");
    css = css.replace(/_\}/g," }");
    css = css.replace(/\}_/g,"} ");
    css = css.replace(/\,_/g,", ");

    css = css.replace(/;/g,",");
    css = css.replace(/\{/g,": {");
    css = css.replace(/\./g,"class");
    css = css.replace(/\}\n/g,"},");
    css = css.replace(/-/g,"+");

    css = css.replace(/_:/g," :");
    css = css.replace(/\n_/g,"\n");
    css = css.replace(/_\n/g,"\n");
    css = css.replace(/_/g," ");
    css = css.replace(/\+/g,"_");

    css = "{" + css + "}";

    return JSON.parse(css);
  };

  var toStyleString = function(style) {
    var styleString = "" + JSON.stringify(style);
    styleString = styleString.replace(/\"/g,"").replace(/\,/g,";").replace(/\{/g,"").replace(/\}/g,"").replace(/_/g,"-");
    return styleString;
  };

  var inlineCss = function(css,html) {
    var classes = html.match(/class=\"[a-zA-Z0-9]*\"/g);
    classes = classes.map(function(item,index){ return item.replace("class=\"","").replace("\"",""); });

    for(var i in classes) {
      var className = classes[i];

      var style = css["class"+className];

      if(typeof style !== "undefined") {
        var styleString = toStyleString( style );
        var regExp = new RegExp("class=\"" + className + "\"");
        html = html.replace( regExp,"style=\"" + styleString + "\"" );
      } else {
        html = html + " not found " + className;
      }
    }

    return html;
  };

  self.getDataStubForTemplate = function(templatePage,templateName) {
    var template = file.getAttachment(templatePage,templateName+".email.template");
    var fields = getFields(template);
    var data = {};
    for(var i in fields) {
      var field = fields[i];
      data[field] = "";
    }

    return data;
  };

  self.sendEmail = function(toEmail,data,templatePage,templateName) {
    if(toEmail == "Admin") {
      toEmail = adminEmail;
    }

    var isHtml = false;
    var content = "";
    var css = {};

    var template = file.getAttachment(templatePage,templateName+".email.template");
    var parts = template.split("#\n");
    var subject = ""+parts[1].trim();
    var type = ""+parts[2].trim();
    if(type=="html") {
      var cssFile = ""+parts[3].trim();
      css = getCss("" , cssFile);
      content = ""+parts[4].trim();
    } else {
      content = ""+parts[3].trim();
    }

    if(data.subject) {
      subject = data.subject;
    } else {
      data.subject = subject;
    }

    if(type=="html") {
      content = inlineCss(css,content);
      isHtml = true;
    } else if(type=="wiki") {
      isHtml = true;
      content = openForum.renderWikiData("",content);
    }

    var fields = getFields(content);

    for(var i in fields) {
      var field = fields[i];
      if(typeof data[field] === "undefined") {
        if(field.indexOf("insertFile:")===0) {
          var fileData = file.getAttachment("",field.substring(11));
          content = content.replace("{{" + field + "}}",fileData);
        } else {
          throw "Field " + field + " in template " + templateName + " is missing from supplied data.";
        }
      } else {
        content = content.replace("{{" + field + "}}",data[field]);
      }
    }

    for(var count=0;count<10;count++) {
      try{
        mailer.sendEmail( adminEmail,[toEmail],subject,content,isHtml );
        break;
      } catch(e) {
        external.getURLAsString( encodeURI(alertHost + "/OpenForum/AddOn/Alert?action=triggerAlert&name=" + serviceName + ": EmailService Error&reason="+e) );
        if(count==9) throw e;
        js.sleep( 5000 );
      }
    }

    return content;
  };
};

