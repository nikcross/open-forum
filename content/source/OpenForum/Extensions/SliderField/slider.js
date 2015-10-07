includeLibrary("/OpenForum/Javascript/mouse.js");

function SliderField(name,value,maxValue,width)
{
 this.name = name;
 this.value = value;
 this.maxValue = maxValue;
 this.barWidth = width;

 this.listener = null;
 this.setListener = function setListener(obj)
 {
   this.listener = obj;
 }

 this.getValue = function getValue()
 {
   return this.value;
 }

 this.setValue = function setValue(value)
 {
 this.value = new Number(value);
 if(this.value<0)
 {
   this.value=0;
 }
 if(this.value>=this.maxValue)
 {
   this.value = this.maxValue;
 }
 this.barField = document.getElementById(this.name);
 this.barField.value = this.value;

 this.barLayer = document.getElementById(this.name+"Layer");
 this.barLayer.innerHTML = Math.round(this.value*100)/100;

 this.width = Math.round( this.value*this.barWidth / this.maxValue );
 this.bar = document.getElementById(this.name+"Slider");
 this.bar.width = this.width;

  if(this.listener!=null)
  {
    this.listener.setValue(this.value);
  }
 }

 this.drag = function drag(x,y)
 {
    x=x - 10;
    dx = x - this.x;
    this.setValue( (dx*this.maxValue)/this.barWidth );
 }

this.x=0;
this.y=0;
 this.pickUp = function pickUp()
 {
   layer=document.getElementById(name+"ControlLayer");
   pos=ui.findLayerPosition(layer);
   this.x = pos[0];
   this.y = pos[1];
 }

 this.drop = function drop()
 {
 }

 this.isSticky = function isSticky()
 {
   return false;
 }

 this.setValue( value );
}