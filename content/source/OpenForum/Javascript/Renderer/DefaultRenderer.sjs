/**

**/
function DefaultRenderer() {
  var self = this;
  var EOL = "\n";

  var aliases = [];
  
  self.setAliases = function(newAliases) {
    aliases = newAliases;
  };
  
  self.getVersion = function() {
    return "DefaultRenderer v1.03 Clean and smooth";
  };

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
    } else {
      if(link.charAt(0)!=="/") {
        link = pageName+"/"+link;
      }
      var targetPageName = link;
      var targetFileName = "page.content";

      if(targetPageName.indexOf(".")!==-1) {
        targetFileName = targetPageName.substring(targetPageName.lastIndexOf("/")+1);
        targetPageName = targetPageName.substring(0,targetPageName.lastIndexOf("/"));
      }

      if(targetPageName.indexOf("?")!=-1) {
        targetPageName = targetPageName.substring(0,targetPageName.indexOf("?"));
//log.debug("TargetPageName now "+targetPageName);        
      }

      if(targetPageName.indexOf("#")!=-1) {
        targetPageName = targetPageName.substring(0,targetPageName.indexOf("#"));
      }

      if (file.attachmentExists(targetPageName,targetFileName)===false) {
        link = "/OpenForum/Editor?pageName="+link;
        target = "target=\"editor\" style=\"color: red\" title=\"The page "+link+" does not exist. Click to create it.\"";
      }
    }

    //check if image
    if(link.indexOf(".png")!=-1) {
      var alt = "";
      if(title!==link) {
        alt = " alt=\""+title+"\" title=\""+title+"\"";
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
    new MarkUp( { type: "strike", match: {start: "~~",end: "~~"}, start: "<strike>", end: "</strike>" } ),
    new MarkUp( { type: "super script", match: {start: "^^",end: "^^"}, start: "<sup>", end: "</sup>" } ),
    new MarkUp( { type: "comment", match: {start: "/*",end: "*/"}, start: "<!--", end: "-->" } ),
    new MarkUp( { type: "italic", match: {start: "''",end: "''"}, start: "<i>", end: "</i>" } ),
    new MarkUp( { type: "line break", match: {start: "\\",end: EOL}, start: "<br/>", end: "" } ),
    new MarkUp( { type: "code", match: {start: "{{{",end: "}}}"}, start: "<xmp class=\"panel\">", end: "</xmp>", stackable: false } ),
    new MarkUp( { type: "paragraph", match: {start: "((",end: "))"}, start: "<p>", end: "</p>" } ),
    new MarkUp( { type: "box", match: {start: "[[",end: "]]"}, start: "<div class=\"panel callout radius\">", end: "</div>" } ),
    new MarkUp( { type: "h1", match: {start: "!!!!",end: EOL}, start: "<h1>", end: "</h1>" } ),
    new MarkUp( { type: "h2", match: {start: "!!!",end: EOL}, start: "<h2>", end: "</h2>" } ),
    new MarkUp( { type: "h3", match: {start: "!!",end: EOL}, start: "<h3>", end: "</h3>" } ),
    new MarkUp( { type: "center", match: {start: "=-=",end: "=-="}, start: "<center>", end: "</center>" } ),
    new MarkUp( { type: "section", match: {start: EOL+"--8<!--",end: EOL+"-->8--"}, start: "<hr/>", end: "" } ),
    new MarkUp( { type: "rule", match: {start: "----",end: EOL}, start: "<hr/>", end: "" } ),
    new MarkUp( { type: "extension", match: {start: "[{",end: "}]"}, start: "", end: "", render: renderExtension, stackable: false } ),
    new MarkUp( { type: "link", match: {start: "[",end: "]"}, start: "", end: "", render: renderLink } ),
    new MarkUp( { type: "table", match: {start: EOL+"|",end: EOL}, start: "<tr>", end: "</tr>", open: "<table>", close: "</table>", render: renderTableRow } )
  ];

  /*===================================*/
  /*  Converts OpenForum Markup to HTML
   * 
   *  pageName - Name of page to render for
   *  input - raw text to render to html 
   * 
   */
  self.render = function(pageName,text) {
    try{
    var input = EOL+text+EOL;
    var rendererStack = [];
    var output = "";
      
    //While there is input text left to render
    while(input.length>0) {
      //Find the next instance of marked up text
      //and return the required renderer
      var renderer = findFirstMatch( input,markUp );
      
      //If no renderer found in remaining text, add text to output and end
      if(renderer===null) {
        output+=input;
        break;
      } else {
        //Record the start and cut start as the start of the markup
        var startPoint = input.indexOf(renderer.getStart());
        var startCutPoint = startPoint;
        //If the first character of the cut is new line and markup is not a title, move cut point past it
        if(input.substring(startCutPoint,1)===EOL && renderer.getStart().charAt(0)!=="!") {
          startCutPoint++;
        }
        
        //Record the string before the markup start
        var before = input.substring(0,startCutPoint);
        
        //Record the string after the markup start
        var after = input.substring(startPoint+renderer.getStart().length);
        //Record the index of the start of the end markup
        var endPoint = after.indexOf(renderer.getEnd());
        //Record the string within the markup
        var content = after.substring( 0,endPoint );

        //If the markup does not end at the line end
        if(renderer.getEnd()!==EOL) {
          //Record the end of the markup as after the end markup
          endPoint += renderer.getEnd().length;
        }

        //Fix to render links in lists
        if(renderer.canBeStacked()===true) {
          content = self.render(pageName,content);
        }

        //Record the string after the markup end
        after = after.substring( endPoint );
        //Add the string before the markup to the output
        output += before;
        //Add the rendered markup to the output
        output += renderer.render(pageName,content);
        //Set the input as the string after the markup
        input = after;
        
        if(input.substring(0,2)==="\n\n") {
          output += "\n"+renderer.renderClose();
          input = input.substring(1);
        } else {        
          rendererStack.push(renderer);
        }
      }
    }
    output = output.substring(1,output.length-1);

    while(rendererStack.length>0) {
      var poppedRenderer = rendererStack.pop();
      output = output + poppedRenderer.renderClose();
    }

    return output;
    } catch(e){
      if(log) {
        log.error("Error in /OpenForum/Javascript/Renderer/DefaultRenderer. Excpetion "+e+" on line "+e.lineNumber);
      }
    }
  };
}
