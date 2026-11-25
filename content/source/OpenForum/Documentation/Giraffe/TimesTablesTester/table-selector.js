function createTableSelector(x,y) {
	tableSelector = new Composite(x,y);
	tableSelector.selectOption = function(i,j) {
		option = tableSelector.options[i][j];
		if(option.selected==true) {
			option.setFillColor(null);
			option.selected=false;
		} else {
			option.setFillColor("green");
			option.selected=true;
		}
	}
	
	tableSelector.selectTable = function(i) {
		if(tableSelector.tables[i].selected==false) {
			tableSelector.tables[i].selected=true;
			newState = true;
			newColor = "green";
		} else {
			tableSelector.tables[i].selected=false;
			newState = false;
			newColor = null;
		}
	
		for(j=0;j<13;j++) {
			option = tableSelector.options[i][j];
			option.setFillColor(newColor);
			option.selected=newState;
			option = tableSelector.options[j][i];
			option.setFillColor(newColor);
			option.selected=newState;
		}
	}
	
	tableSelector.add( new RoundedRectangle(0,0,500,550,10).setFillColor("rgba(0,0,0,0.7)") );
	space = 33;
	
	for(i=0;i<15;i++) {
			tableSelector.add( new Line(16,20+(i*space),space*14,0) );
			tableSelector.add( new Line(16+(i*space),20,0,space*14) );
	}
		
	tableSelector.tables = [];
	for(i=0;i<13;i++) {
			option = new Rectangle(16,20+space+(i*space),space,space);
			tableSelector.add(option);
			option.i = i;
			option.selected = false;
			option.onMouseOver = function() { 
				this.setFillColor("black");
			};
			option.onMouseOut = function() { 
				this.setFillColor(null);
			};
			option.onMousePressed = function() { 
				this.target = tableSelector;
				this.target.selectTable(this.i) 
			};
			tableSelector.tables[i]=option;
			
			text = new Text(20,40+space+(i*space),""+i,20,"Arial").setFillColor("yellow");
			tableSelector.add(text);
	}
	
	for(i=0;i<13;i++) {			
			option = new Rectangle(16+space+(i*space),20,space,space);
			tableSelector.add(option);
			option.i = i;
			option.onMouseOver = function() { 
				this.setFillColor("black");
			};
			option.onMouseOut = function() { 
				this.setFillColor(null);
			};
			option.onMousePressed = function() { 
				this.target = tableSelector;
				this.target.selectTable(this.i) 
			};
			
			text = new Text(20+space+(i*space),40,""+i,20,"Arial").setFillColor("yellow");
			tableSelector.add(text);
	}
	
	tableSelector.options = [];
	for(i=0;i<13;i++) {
		tableSelector.options[i] = [];
		for(j=0;j<13;j++) {
			option = new Rectangle(16+space+(i*space),20+space+(j*space),space,space);
			option.i=i;
			option.j=j;
			option.selected=false;
			tableSelector.add(option);
			option.onMousePressed = function() { 
				this.target = tableSelector;
				this.target.selectOption(this.i,this.j) 
			};
			tableSelector.options[i][j]=option;
		}
	}
	for(i=0;i<13;i++) {
		for(j=0;j<13;j++) {			
			text = new Text(20+space+(j*space),40+space+(i*space),""+(i*j),17,"Arial").setFillColor("cyan");
			tableSelector.add(text);
		}
	}
	
	option = new Text(200,520,"Start Test",25,"Arial").setFillColor("yellow");
	option.onMousePressed = function() { tableSelector.hide.start(); };
	tableSelector.add(option);
	
/*	for(i=0;i<13;i++) {
		option = new Text(20,40+(i*30),""+i+" Times Table",25,"Arial").setFillColor("yellow");
		option.onMousePressed = 
			eval("f=function() { tableSelector.selected="+i+"; tableSelector.hide.start(); };f;");
	
		tableSelector.add(option);
	}
	
	canvas.add(tableSelector);
*/	
	tableSelector.visible=false
	canvas.add(tableSelector);
	tableSelector.hide = new Giraffe.FlipOutX(tableSelector,20);
	tableSelector.show = new Giraffe.FlipInX(tableSelector,20);
	tableSelector.hide.doNext = function() {
		tableSelector.visible=false;
  		displayStart(tableSelector.selected);
	}
	
	return tableSelector;
}