function BarField(prefix,value,maxValue,width,suffix)
{
 this.prefix = prefix;
 this.suffix = suffix;
 this.value = value;
 this.maxValue = maxValue;
 this.barWidth = width;

if(this.suffix==null)
{
this.suffix="";
}

 this.getValue = function getValue()
 {
   return this.value;
 }

 this.setValue = function setValue(value)
 {
 this.value = new Number(value);
 if(this.value>=this.maxValue)
 {
   this.value = this.maxValue;
 }
 this.barField = document.getElementById(this.prefix +"Field");
 this.barField.value = this.value;

 this.barLayer = document.getElementById(this.prefix +"Layer");
 this.barLayer.innerHTML = this.value+this.suffix;

 this.width = Math.round( this.value*this.barWidth / this.maxValue );
 this.bar = document.getElementById(this.prefix+"Bar");
 this.bar.width = this.width;
 }

 this.setValue( value );
}