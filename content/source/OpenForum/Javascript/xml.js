var xmlElements = new Array();

function XmlElementIterator()
{
  this.iterate = function()
  {
    for(loop=0;loop<xmlElements.length;loop++)
    {
      this.processElement( xmlElements[loop] );
    }
  }

  this.processElement = new function( xmlElement ){};
}

function XmlElement(name)
{
        this.ref = xmlElements.length;
        xmlElements[xmlElements.length] = this;
	this.name = name;
        this.value = "";
 	this.attributes = new Array();
	this.children = new Array();

        // runtime defined initialiser
        this.init = function init() {}
        this.init();

	this.addAttribute = function addAttribute(name,value)
	{
		this.attributes[name] = new XmlAttribute(name,value);
		
		return this;
	}

	this.getAttributeValue = function getAttributeValue(name)
	{
		if(this.attributes[name])
		{
			return this.attributes[name].value;
		}
		else
		{
			return null;
		}
	}

	this.setAttributeValue = function setAttributeValue(name,value)
	{
		return this.attributes[name].value=value;
	}

	this.addChild = function addChild(name)
	{
		child = new XmlElement(name);
		this.addElement(child);

		return child;
	}

	this.addElement = function addElement(xmlElement)
	{
		this.children[this.children.length] = xmlElement;
	}

	this.getElementByName = function getElementByName(name)
	{
		for(this.loop=0;this.loop<children.length;this.loop++)
		{
			if(children[this.loop].name = name)
			{
				return children[this.loop];
			}
		}
	}

        this.getValue = function()
        {
           return this.value;
        }

        this.setValue = function(value)
        {
           this.value = value;
        }

        this.toString = function()
        {
          this.data = "<"+this.name;
          for(this.loop in this.attributes)
          {
            this.data+=" "+this.attributes[this.loop].name+"=\""+this.attributes[this.loop].value+"\"";
          }  
          this.data += ">";

          if(this.value!="")
          {
            this.data += "<![CDATA["+this.value+"]]>";
          }

          for(this.loop=0;this.loop<this.children.length;this.loop++)
          {
            this.data += this.children[this.loop].toString();
          }

           this.data +="</"+this.name+">";
          return this.data;
        }
}

function XmlAttribute(name,value)
{
	this.name = name;
	this.value = value;
}