/*
* Author: 
* Description: 
*/
Giraffe.Shadow = function() {
    this.color = '#999';
    this.blur = 20;
    this.offsetX = 15;
    this.offsetY = 15;
  
  this.toJson = function() {
    return {color: this.color, blur: this.blur, offsetX: this.offsetX, offsetY: this.offsetY};
  };
  
  this.fromJson = function( json ) {
    this.color = json.color;
    this.blur = json.blur;
    this.offsetX = json.offsetX;
    this.offsetY = json.offsetY;
  };
};

//Deprecated
Shadow = Giraffe.Shadow;