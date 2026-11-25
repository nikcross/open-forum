var FluentTemplateProcessor = function() {
  var self = this;

  //Supply a template with {{ and }} to mark fields to replace
  self.withTemplate = function(template) {
    return new function() {
      var self = this;

      //Return a list of fields in the content
      var getFields = function(content) {
        var fields = content.match(/\{\{[a-zA-Z0-9-:\.%]{0,100}\}\}/g);
        if(fields == null) return {};

        fields = fields.map(function(item,index){ return item.replace("{{","").replace("}}",""); });
        var structure = {};
        for( var field in fields ) {
          structure[fields[field]] = "";
        }
        return structure;
      };

      
      var replaceFields = function(content,data,exceptionOnMissing) {
        var fields = getFields(content);

        //For each field in the content
        for(var field in fields) {
          // If the required field is not in the supplied data
          if(typeof data[field] === "undefined") {
            //If the field is a request to insert a file
            if(field.indexOf("insertFile:")===0) {
              //Replace the field with the files content
              var fileData = file.getAttachment("",field.substring(11));
              content = content.replaceAll("{{" + field + "}}",fileData);
            } else if (exceptionOnMissing) {
              throw "Field " + field + " in template is missing from supplied data.";
            }
          } else {
            //If the data includes the field, replace the field with the data value supplied
            content = content.replaceAll("{{" + field + "}}",data[field]);
          }
        }
        return content;
      };

      //Get the sections in some content
      var getSections = function(content) {
        var allSections = content.split("--8<--");
        var sections = {};
        for(var s in allSections) {
          var section = allSections[s].substring(0,allSections[s].indexOf("-->8--"));
          if( section.trim().length == 0) continue;
          var name = s;
          if( section.startsWith("--") ) {
          	name = section.after("--").before("--");
            section = section = section.after( "--"+name+"--" );
          }
          sections[name]=( section );
        }
        return sections;
      };

      if(template) {
        //Prepopulate the sections, fields and output if a template has been supplied
        var sections = getSections( template );
        var fields = getFields( template );
        var currentOutput = template;
      }

      self.takeSection = function(sectionId) {
        //Set the current section
        /*sections = getSections( currentOutput );
        currentOutput = ""+sections[sectionId];

        return this;*/
        return FluentTemplateProcessor.withTemplate( sections[sectionId] );
      };

      self.setAllFields = function( data ) {
        //Set all of the fields from the provided data
        //Throw an exception if some are missing
        var exceptionOnMissing = true;
        currentOutput = replaceFields( currentOutput,data, exceptionOnMissing );
        return this;
      };
      
      self.setSomeFields = function( data ) {
        //Set all of the fields from the provided data
        var exceptionOnMissing = false;
        currentOutput = replaceFields( currentOutput,data, exceptionOnMissing );
        return this;
      };

      self.setField = function( name, value ) {
        //Set field name to a value
        currentOutput = currentOutput.replaceAll( "{{"+ name +"}}",value );
        return this;
      };

      self.getAllFields = function() {
        //Get the list of fields
        return fields;
      };

      self.getRequiredFields = function() {
        return getFields( currentOutput );
      };

      self.getSections = function() {
        //Get the list of sections
        return sections;
      };

      self.getResult = function() {
        //Get the resulting output
        return currentOutput;
      };
    };
  };
};
//Cannot create object here as when used server side it does this automatically
//FluentTemplateProcessor = new FluentTemplateProcessor();
