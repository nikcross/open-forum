function startTimesTablesTester() {
	buildUI();
	buildTables();
	displayIntro();
}

function displayIntro() {
	startMessage.title.text = "Welcome to";
	startMessage.label.text = "Times Tables Tester";
	startMessage.button1.visible=false;
	startMessage.button2.text="Start";
	startMessage.button2.action = function() { displayTableSelector(); };
	startMessage.button2.visible=true;
	startMessage.button3.visible=false;
	startMessage.show.start();
}

function displayPass(message) {
	startMessage.title.text = "Well done";
	startMessage.label.text = message;
	startMessage.button1.text="Try Again";
	startMessage.button1.action = function() { displayStart(currentTable); };
	startMessage.button1.visible=true;
	startMessage.button2.text="Choose Another Table";
	startMessage.button2.action = function() { displayTableSelector(); };
	startMessage.button2.visible=true;
	startMessage.button3.visible=false;
	startMessage.show.start();
}

function displayFail(message) {
	startMessage.title.text = "Ooops !";
	startMessage.label.text = message;
	startMessage.button1.text="Try Again";
	startMessage.button1.action = function() { displayStart(currentTable); };
	startMessage.button1.visible=true;
	startMessage.button2.text="Choose Another Table";
	startMessage.button2.action = function() { displayTableSelector(); };
	startMessage.button2.visible=true;
	startMessage.button3.visible=false;
	startMessage.show.start();
}

function displayStart(table) {
	startMessage.title.text = table+" times table";
	startMessage.label.text = "Press Start when you are ready.";
	startMessage.button1.text="Cancel";
	startMessage.button1.visible=true;
	startMessage.button2.visible=false;
	startMessage.button3.text="Start";
	startMessage.button3.action = function() { startMessage.hide.start();startTest(table); };
	startMessage.button3.visible=true;
	startMessage.show.start();
}

function displayTableSelector() {
	startMessage.hide.start();
	tableSelector.show.start();
	tableSelector.visible=true;
	testRunning = false;
}

function Question(i,j) {
	this.table=i;
	this.entry=j;
	this.answer=""+(i*j);
	this.time=0;
	this.right=0;
	this.wrong=0;
}

var questions;
function buildTables() {
	questions = [];
	for(i=0;i<13;i++) {
		questions[i] = [];
		for(j=0;j<13;j++) {
			questions[i][j] = new Question(i,j);
		}
	}
}

var questionIndex = 0;
var currentQuestion;
var cuttentTable;
var testRunning = false;
function startTest(table) {
	if(testRunning) {
		return;
	}
	testRunning = true;
	tableSelector.visible=false;

	currentTable=table;
	testList = createTestList();
	questionIndex = 0;
	setQuestion( currentTable,testList[questionIndex] );
}

function setQuestion(table,entry) {
	currentQuestion = questions[table][entry];
	question.text = table+" x "+entry+" =";
	startQuestionTimer();
}

var time=0;
var allowedTime = 50;
var timer;
function startQuestionTimer() {
	time = 0;
	timer = setInterval(timerTick,100);
}

function stopQuestionTimer() {
	window.clearInterval(timer);
}

function timerTick() {
	time++;
	stopWatch.display.sweepAngle = (360*time)/allowedTime;
	
	if(time>=allowedTime) {
		outOfTime();
	}
}

function outOfTime() {
	stopQuestionTimer();
	displayFail("Out of time");
	testRunning = false;
}

function createTestList() {
	list = [0,1,2,3,4,5,6,7,8,9,10,11,12];
	testList = [];
	for(i=0;i<13;i++) {
		j=Math.round(Math.random()*13)
		testList[testList.length] = list[j%list.length];
		list.splice(j%list.length,1);
	}
	return testList;
}

function buildUI() {
	canvas.stretchToFitWindow();
	canvas.add( new Text(20,60,"Times Tables Tester",60,"Arial").setFillColor("blue") );
		
	stopWatch = createStopWatch(300,400);
	canvas.add(stopWatch);
	
	question = new Text(60,210,"",80,"Arial").setFillColor("blue")
	canvas.add( question );
	
	input = new Text(420,210,"",80,"Arial").setFillColor("blue")
	canvas.add( input );
	
	numberPad = createNumberPad(620,100,
		keyPressed,{text: "Del",fn: deleteKey},{text: "Go",fn: goKey})
	canvas.add( numberPad );
	
	tableSelector = createTableSelector(40,40);
	startMessage = createStartMessage(50,100);
}

function keyPressed(keyValue) {
	if(input.text.length>=3) {
		return;
	}
	input.text+=keyValue;
}

function deleteKey() {
	newText = input.text;
	if(newText.length==0) {
		return;
	}
	newText = newText.substring(0,newText.length-1);
	input.text = newText;
}


function goKey() {
	stopQuestionTimer();
	if(input.text===currentQuestion.answer) {
		correct();
	} else {
		wrong();
	}
}

function correct() {
	input.text="";
	
	questionIndex++;
	if(questionIndex>=testList.length) {
		displayPass("All correct");
	} else {
		setQuestion( currentTable,testList[questionIndex] );
	}
}
function wrong() {
	displayFail("Wrong "+question.text+" "+currentQuestion.answer);
	input.text="";
}

/**
 * Defines a graphics Rectangle primative
 * @class
 * @augments GraphicsObject
 * @param x {number} the position that the ... is to be drawn on the x axis
 * @param y {number} the position that the ... is to be drawn on the y axis
 * @param width (number) the width of the rectangle
 * @param height (number) the height of the rectangle
 */
function RoundedRectangle(x,y,width,height,radius)
{
	  /**#@+
	   * @memberOf Rectangle
	   */
  this.x=x;
  this.y=y;
  this.width=width;
  this.height=height;
  this.radius=radius;

  /**
   * Checks to see if a given point lies inside the rectangle.
   * @param posX {number} the x axis of the point to check
   * @param posY {number} the y axis of the point to check
   * @returns true if the point lies within the Rectangle
   */
  this.isInside = function(posX,posY) {
	if(
		posX-this.x>0 &&
		posX-this.x<this.width &&
		posY-this.y>0 &&
		posY-this.y<this.height
		){ return true; } else { return false; }
  }
  
  /**
   * @private
   */
  this.draw = function()
  {
    if(this.fillColor!=null)
    {
      this.canvas.fillStyle = this.fillColor;
    }
    this.canvas.strokeStyle = this.color;
    if(this.fillColor!=null)
    {
      this.canvas.fillStyle = this.fillColor;
    }
    this.canvas.beginPath();
    this.canvas.moveTo(this.x,this.y+this.radius);
    this.canvas.lineTo(this.x,this.y+this.height-this.radius);
    this.canvas.quadraticCurveTo(this.x,this.y+this.height,this.x+this.radius,this.y+this.height);
    this.canvas.lineTo(this.x+this.width-this.radius,this.y+this.height);
    this.canvas.quadraticCurveTo(this.x+this.width,this.y+this.height,this.x+this.width,this.y+this.height-this.radius);
    this.canvas.lineTo(this.x+this.width,this.y+this.radius);
    this.canvas.quadraticCurveTo(this.x+this.width,this.y,this.x+this.width-this.radius,this.y);
    this.canvas.lineTo(this.x+this.radius,this.y);
    this.canvas.quadraticCurveTo(this.x,this.y,this.x,this.y+this.radius);
    if(this.fillColor!=null)
    {
      this.canvas.fill();
    }
    this.canvas.stroke(); 
  }
}
RoundedRectangle.prototype = new GraphicsObject();