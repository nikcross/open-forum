//---- Post ----

function Post()
{
  this.data = [];

  this.addItem = function(name,value)
  {
    this.item = [];
    this.data[this.data.length] = this.item;
    this.item[0] = name;
    this.item[1] = value;
    
    return this;
  };

  this.addForm = function(formId) {
    form = document.getElementById(formId);
    for(var loop=0;loop<form.elements.length;loop++) {
      name=form.elements[loop].name;
      if(name.length>0) {
        this.addItem(name,form.elements[loop].value);
      }
    }
    
    return this;
  };
  
  this.getData = function() {
    var dataString = "";
    for(var entry in this.data) {
      if(dataString.length>0) {
        dataString +="&";
      }
      dataString += this.data[entry][0]+"="+encodeURIComponent(this.data[entry][1]);
    }
    return dataString;
  };
  //TODO add get parameters method like
  /*
      this.data="";
    for(this.loop=0;this.loop<dataArray.length;this.loop++)
    {
      if(this.loop!=0)
      {
        this.data += "&";
      }
      this.data += dataArray[this.loop][0]+"="+encodeURIComponent(dataArray[this.loop][1]);
    }
    */
}