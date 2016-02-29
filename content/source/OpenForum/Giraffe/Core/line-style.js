/*
* Author: 
* Description: 
*/
function LineStyle() {
	this.thickness=1.5;
	this.endCap = 'round';
	this.setThickness = function(thickness) {
		this.thickness = thickness;
		return this;
	};
	this.setEndCap = function(endCap) {
		this.endCap = endCap;
		return this;
	};
}