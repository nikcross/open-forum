function Cog(x,y) {
	this.x=x;
	this.y=y;
	
	X=0;
	Y=1;
	origin = [300,200];
	
	filledPoly = new Polygon(origin[X],origin[Y]);
	filledPoly.fillColor = "white";
	filledPoly.color = "white";
	this.add(filledPoly);
	
	poly = new Polygon(origin[X],origin[Y]);
	poly.color = "black";
	
	outsideProfile = [60,60,40,40];
	outsideRepeats = 12;
	insideProfile = [10,10,10,10,10,10,10,10,10,10,10,10,8];
	insideRepeats = 1;
	
	steps=outsideRepeats*outsideProfile.length;
	dRad = (Math.PI*2)/steps;
	
	for(i=0;i<=steps;i++) {
	  radius = outsideProfile[i%outsideProfile.length];
	
	  x = Math.sin(dRad*i)*radius;
	  y = Math.cos(dRad*i)*radius;
	  poly.addPoint( x,y );
	  filledPoly.addPoint( x,y );
	}
	this.add(poly);
	
	steps=insideRepeats*insideProfile.length;
	dRad = (Math.PI*2)/steps;
	
	poly  = new Polygon(origin[X],origin[Y]);
	for(i=steps;i>=0;i--) {
	  radius = insideProfile[i%insideProfile.length];
	
	  x = Math.sin(dRad*i)*radius;
	  y = Math.cos(dRad*i)*radius;
	  poly.addPoint( x,y );
	  filledPoly.addPoint( x,y );
	}
	this.add(poly);
}
Cog.prototype = new Composite();