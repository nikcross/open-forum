/*
* Author: 
* Description: 
*/
Giraffe.LineStyle = function() {
	this.thickness=1.5;
	this.endCap = 'round';
    this.type = "LineStyle";
	this.setThickness = function(thickness) {
		this.thickness = thickness;
		return this;
	};
	this.setEndCap = function(endCap) {
		this.endCap = endCap;
		return this;
	};
  
  this.toJson = function() {
    return {thickness: this.thickness, endCap: this.endCap, type: this.type};
  };
  
  this.fromJson = function( json ) {
    this.thickness = json.thickness;
    this.endCap = json.endCap;
    this.type = json.type;
  };
};

//Deprecated
LineStyle = Giraffe.LineStyle;