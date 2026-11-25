function Door(x,y) {
	this.x=x;
	this.y=y;
	X=0;
	Y=1;
	thisHeight=3*-60;
	thisWidth=1.5*60;
	poly = new Polygon(0,0).setColor('grey').setFillColor('rgba(200,255,210,1)');
	poly.addPoint(thisWidth/2,0);
	poly.addPoint(thisWidth/2,thisHeight);
	drad = (Math.PI*2)/360;
	for(i=90;i<270;i+=2) {
	poly.addPoint(
	  0+(Math.sin(i*drad)*(thisWidth/2)),
	  thisHeight+(Math.cos(i*drad)*(thisWidth/2))
	);
	}
	poly.addPoint(-thisWidth/2,thisHeight);
	poly.addPoint(-thisWidth/2,0);
	this.add( poly );
	this.add( new Circle((thisWidth/2)-(thisWidth/6),thisHeight/2,2 ).setColor('grey') )
	this.add( new Rectangle(-(thisWidth/2)-1,thisHeight/4,2,8).setColor('grey') );
	this.add( new Rectangle(-(thisWidth/2)-1,thisHeight-thisHeight/8,2,8).setColor('grey') );
}
Door.prototype = new Composite();