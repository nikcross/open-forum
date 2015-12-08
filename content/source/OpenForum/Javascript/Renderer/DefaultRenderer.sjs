/**

**/
function DefaultRenderer() {
  var self = this;
  var EOL = "\n";

  var aliases = [];

  /*===================================*/
  var MarkUp = function(config) {
    var self = this;
    var type = config.type;
    var level = 0;
    var match = config.match;
    var start = config.start;
    var end = config.end;
    var open = config.open;
    var close = config.close;
    var stackable = true;
    if(typeof(config.stackable)!="undefined") {
      stackable = config.stackable;
    }

    self.getType = function() { 
      return type;
    };

    self.getStart = function() { 
      return match.start; 
    };

    self.getEnd = function() {
      return match.end;
    };

    self.render = function(pageName,content) { 

      if(config.render) {
        //console.log("calling with "+content);
        content = config.render(pageName,content);
      }

      var data = start+content+end; 
      if(level===0) {
        data = self.renderOpen()+data;
      }
      return data;
    };

    self.renderOpen = function() {
      if(!open) return "";
      level=1;
      return open;
    };

    self.renderClose = function() {
      if(!close) return "";
      if(level===0) return "";
      level=0;
      return close;
    };
    
    self.canBeStacked = function() {
      return stackable;
    };
  };

  /*===================================*/
  var renderLink = function (pageName,content) {
    var output = "";

    //split into text and link
    var parts = content.split("|");
    var link = "";
    var title = "";
    var target = "";
    if(parts.length===1) {
      link = parts[0];
      title = parts[0];
    } else {
      link = parts[1];
      title = parts[0];
    }
    //check if external
    //console.log("rendering link "+link);
    if(link.indexOf(":")!=-1) {

      //check if alias
      var alias = link.substring(0,link.indexOf(":"));
      var prefix = getPrefix(alias);
      if(prefix!==null) {
        link = prefix+link.substring(link.indexOf(":")+1);
      }
      target = " target=\"external_page\"";
    } else if(link.charAt(0)!=="/") {
      link = pageName+"/"+link;
    }

    //check if image
    if(link.indexOf(".png")!=-1) {
      var alt = "";
      if(title!==link) {
        alt = " alt=\""+title+"\"";
      }
      output = "<img src=\""+link+"\""+alt+"/>";
    } else {
      //create link
      output = "<a href=\""+link+"\""+target+">"+title+"</a>";
    }

    return output;
  };

  /*===================================*/
  var renderExtension = function(pageName,content) {
    var extensionName = content;
    var attributes = [];
    if(content.indexOf(" ")!=-1) {
      extensionName=content.substring(0,content.indexOf(" "));
      attributes=parseAttributes(content.substring(content.indexOf(" ")));
    }

    //load extension render.sjs
    var renderScript = file.getAttachment("/OpenForum/Extensions/"+extensionName,"renderer.sjs");

    var renderFunction = eval("function(extension) {"+renderScript+"};");
    //console.log("renderScript: "+renderScript);

    var extension = new function() {
      var attributes = [];
      this.getAttribute = function(field) {
        return attributes[field];
      };
      this.setAttribute = function(field,value) {
        attributes[field] = value;
      };
    };
    extension.setAttribute( "pageName",pageName );
    for(var i=0;i<attributes.length;i++) {
      extension.setAttribute(attributes[i].key,attributes[i].value);
    }

    //run for content
    return renderFunction(extension);
  };

  /*===================================*/
  var renderTableRow = function(pageName,content) {
    //split columns
    var output = "";
    var cells = content.split("|");
    //render columns
    //console.log("parseing "+content+" i:"+cells.length);  
    for(var i=0;i<cells.length;i++) {
      output += "<td>"+cells[i]+"</td>";
    }

    //console.log("parsed as "+output);  
    return output;
  };

  /*===================================*/
  var getPrefix = function(alias) {
    //console.log("getting prefix for "+alias+" in "+aliases.length+" aliases");
    for(var i=0;i<aliases.length;i++) {
      if(aliases[i].alias===alias) {
        return aliases[i].prefix;
      }
      //console.log("("+aliases[i].alias+")!=("+alias+")");
    }
    //console.log("No match for "+alias);
    return null;
  };

  /*===================================*/
  var findFirstMatch = function(source,matchers) {
    var lowestIndex = source.length;
    var rendererMatch = null;
    for(var i=0; i<matchers.length; i++) {
      var renderer = matchers[i];
      var point  = source.indexOf(renderer.getStart());
      if (point >= 0 && point < lowestIndex) {
        lowestIndex = source.indexOf(renderer.getStart());
        rendererMatch = renderer;
      }
    }
    return rendererMatch;
  };

  /*===================================*/
  var parseAttributes = function(data) {
    var attributes = [];
    while(data.length>0 && data.indexOf("=")!=-1) {
      while(data.length>0 && data.charAt(0)===" ") {
        data=data.substring(1);
      }

      var key = data.substring(0,data.indexOf("="));
      data = data.substring(data.indexOf("=")+1);
      var value = "";

//console.log("data ("+data+")");
      if(data.length===0 || (data.charAt(0)!=="\"" && data.charAt(0)!=="'")) {
        value = "true";
        attributes.push( {key: key, value: value} );
//console.log("added: key:"+key+" value:"+value);
        break;
      }
      data = data.substring(1);
      var escaped = false;
      for(var i=0;i<data.length;i++) {
        if(data.charAt(i)==="\\" && data.charAt(i+1)==="\"") {
          value+="\\\"";
          i++;
          continue;
        }
        if(data.charAt(i)==="\\" && data.charAt(i+1)==="'") {
          value+="\\\"";
          i++;
          continue;
        }
        if(data.charAt(i)==="\"" || data.charAt(i)==="'") {
          attributes.push( {key: key, value: value} );
          data = data.substring(i+1);
//console.log("added: key:"+key+" value:"+value);
          break;
        }
        value += data.charAt(i);
      }
    }

    return attributes;
  };

  /*===================================*/
  var markUp = [
    new MarkUp( { type: "list", match: {start: EOL+"*",end: EOL}, start: "<li>", end: "</li>", open: "<ul>", close: "</ul>" } ),
    new MarkUp( { type: "numbered list", match: {start: EOL+"#",end: EOL}, start: "<li>", end: "</li>", open: "<ol>", close: "</ol>" } ),
    new MarkUp( { type: "bold", match: {start: "__",end: "__"}, start: "<b>", end: "</b>" } ),
    new MarkUp( { type: "italic", match: {start: "''",end: "''"}, start: "<i>", end: "</i>" } ),
    new MarkUp( { type: "code", match: {start: "{{{",end: "}}}"}, start: "<xmp>", end: "</xmp>", stackable: false } ),
    new MarkUp( { type: "paragraph", match: {start: "((",end: "))"}, start: "<b>", end: "</b>" } ),
    new MarkUp( { type: "h1", match: {start: "!!!!",end: EOL}, start: "<h1>", end: "</h1>" } ),
    new MarkUp( { type: "h2", match: {start: "!!!",end: EOL}, start: "<h2>", end: "</h2>" } ),
    new MarkUp( { type: "h3", match: {start: "!!",end: EOL}, start: "<h3>", end: "</h3>" } ),
    new MarkUp( { type: "rule", match: {start: "----",end: ""}, start: "<hr/>", end: "" } ),
    new MarkUp( { type: "extension", match: {start: "[{",end: "}]"}, start: "", end: "", render: renderExtension } ),
    new MarkUp( { type: "link", match: {start: "[",end: "]"}, start: "", end: "", render: renderLink } ),
    new MarkUp( { type: "table", match: {start: EOL+"|",end: EOL}, start: "<tr>", end: "</tr>", open: "<table>", close: "</table>", render: renderTableRow } )
  ];

  /*===================================*/
  self.render = function(pageName,input) {
    input = EOL+input+EOL;
    var rendererStack = [];
    var output = "";
    while(input.length>0) {
      var renderer = findFirstMatch( input,markUp );
      if(renderer===null) {
        output+=input;
        break;
      } else {
        var startPoint = input.indexOf(renderer.getStart());
        var startCutPoint = startPoint;
        if(input.substring(startCutPoint,1)===EOL) {
          startCutPoint++;
        }
        var before = input.substring(0,startCutPoint);

        var after = input.substring(startPoint+renderer.getStart().length);
        var endPoint = after.indexOf(renderer.getEnd());
        var content = after.substring( 0,endPoint );

        if(renderer.getEnd()!==EOL) {
          endPoint += renderer.getEnd().length;
        }

        //Fix to render links in lists
        if(renderer.canBeStacked()===true) {
        	content = self.render(pageName,content);
        }

        after = after.substring( endPoint );
        output += before + renderer.render(pageName,content);
        input = after;

        rendererStack.push(renderer);
      }
    }
    output = output.substring(1,output.length-1);

    while(rendererStack.length>0) {
      var renderer = rendererStack.pop();
      output = output + renderer.renderClose();
    }

    return output;
  };

};