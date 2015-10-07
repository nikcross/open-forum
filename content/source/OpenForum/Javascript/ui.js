	var currentTabId = null;

function AnimationLayer(layer,startX,startY,endX,endY,endAction)
{
	this.layer = layer;
	this.startX = startX;
	this.startY = startY;
	this.endX = endX;
	this.endY = endY;

	this.frame = 0;
	this.frames = 20;

	this.endAction = endAction;

	this.animate = function animate()
	{
		dFrame = (this.frames - this.frame)/8;
		if( dFrame<0.1 )
		{
			dFrame = 0.1;
			this.frame += dFrame;
		}
		else
		{
			this.frame += dFrame;
			aniX = this.startX + (((this.endX-this.startX)/this.frames)*this.frame);
			aniY = this.startY + (((this.endY-this.startY)/this.frames)*this.frame);
		}

		//alert( "d:"+dFrame+" f:"+this.frame );

		this.layer.style.left = aniX;
		this.layer.style.top = aniY;

		if(this.frame<this.frames)
		{
			t = setTimeout("ui.currentAni.animate();",20);
		}
		else
		{
			eval(this.endAction);
		}
	}
}

ui = new function()
{

	this.findLayerPosition = function findLayerPosition(obj) {
		this.curleft = this.curtop = 0;
		if (obj.offsetParent) {
			this.curleft = obj.offsetLeft
			this.curtop = obj.offsetTop
			while (obj = obj.offsetParent) {
				this.curleft += obj.offsetLeft
				this.curtop += obj.offsetTop
			}
		}
		return [this.curleft,this.curtop];
	}

	this.findScrollPosition = function findScrollPosition()
	{
		if(document.all)
		{
			this.scrollLeft = document.body.scrollLeft;
			this.scrollTop = document.body.scrollTop;
		}
		else
		{
			this.scrollLeft = window.pageXOffset;
			this.scrollTop = window.pageYOffset;
		}
		return [this.scrollLeft,this.scrollTop];
	}

	this.selectTab = function selectTab(layerId)
	{
		this.layer = document.getElementById(layerId);

	   	this.layer.style.display="block";


	   	this.layer = document.getElementById(layerId+"Tab");
		this.layer.style.background="#E0E0E0";

	   if(this.currentTabId!=null)
	   {
	   	this.layer = document.getElementById(currentTabId);
		this.layer.style.display="none";
	   	this.layer = document.getElementById(currentTabId+"Tab");
		this.layer.style.background="#FFFFFF";
	   }
	   this.currentTabId = layerId;
	}

	this.showMessage = function showMessage(title,text)
	{
		this.htmlData="<center class='prompt'><h1>"+title+"</h1>";
		this.htmlData+="<b>"+text+"</b></br>";
		this.htmlData+="</center>";

		this.showModal( this.htmlData );
	}

	this.showAlert = function showAlert(title,text)
	{
		this.htmlData="<center class='prompt'><h1>"+title+"</h1>";
		this.htmlData+="<b>"+text+"</b></br>";
		this.htmlData+="<input type='button' value='OK' onclick='ui.rollOut(ui.layer,\"ui.hideModal();\");return false;'>";
		this.htmlData+="</center>";

		this.showModal( this.htmlData );
	}

	this.showConfirm = function showConfirm(title,text,action)
	{
		this.htmlData="<center class='prompt'><h1>"+title+"</h1>";
		this.htmlData+="<b>"+text+"</b></br>";
		this.htmlData+="<input type='button' value='OK' onclick='ui.rollOut(ui.layer,\""+action+"ui.hideModal();\");return false;'>";
		this.htmlData+="<input type='button' value='Cancel' onclick='ui.rollOut(ui.layer,\"ui.hideModal();\");return false;'>";
		this.htmlData+="</center>";

		this.showModal( this.htmlData );
	}

	this.showModal = function showModal( htmlData )
	{
		this.layer = document.getElementById("screenedImg");
		this.layer.width=document.body.clientWidth;
	   	this.layer.height=document.body.clientHeight;
		
	   	this.layer = document.getElementById("screened");
		this.layer.style.display="block";

		this.scrollPos = this.findScrollPosition();
		this.layer.style.left=this.scrollPos[0];
		this.layer.style.top=this.scrollPos[1];

	   	this.layer = document.getElementById("modal");
		this.layer.innerHTML = this.htmlData;
		this.layer.style.display="block";
		this.rollIn( this.layer );
	}

	this.rollOut = function rollOut(layer,action)
	{
		layer.style.display="block";
	   	this.width = layer.style.width="auto";
	   	this.height = layer.style.height="auto";
	   	this.width = layer.offsetWidth;
	   	this.height = layer.offsetHeight;

		this.x=(document.body.clientWidth/2)-(this.width/2);
		this.y=(document.body.clientHeight/2)-(this.height/2)
		this.x+=this.scrollPos[0];
		this.y+=this.scrollPos[1];

		this.currentAni = new AnimationLayer(layer,this.x,this.y,document.body.clientWidth+this.width,this.y,action);
		this.currentAni.animate();
	}

	this.rollIn = function rollIn(layer,action)
	{
		layer.style.display="block";
	   	this.width = layer.style.width="auto";
	   	this.height = layer.style.height="auto";
	   	this.width = layer.offsetWidth;
	   	this.height = layer.offsetHeight;

		this.x=(document.body.clientWidth/2)-(this.width/2);
		this.y=(document.body.clientHeight/2)-(this.height/2)
		this.scrollPos = this.findScrollPosition();
		this.x+=this.scrollPos[0];
		this.y+=this.scrollPos[1];

		this.currentAni = new AnimationLayer(layer,-this.width,this.y,this.x,this.y,action);
		this.currentAni.animate();

//alert("roll in");
	}

	this.hideModal = function hideModal()
	{
	   	this.layer = document.getElementById("screened");
		this.layer.style.display="none";

	   	this.layer = document.getElementById("modal");
		this.layer.style.display="none";
//alert("hide modal");
	}

	this.toggleLayer = function toggleLayer(layerId)
	{
	   this.layer = document.getElementById(layerId);
           this.layerImage = document.getElementById(layerId+"Twisty");

	   if(this.layer.style.display=="block")
	   {
                if( typeof(this.layerImage)!="undefined" )
                {
                   this.layerImage.src = "/OpenForum/Images/icons/gif/bullet_arrow_down.gif";
                }

		this.layer.style.display="none";
	   }
	   else
	   {
                if( typeof(this.layerImage)!="undefined" )
                {
                   this.layerImage.src = "/OpenForum/Images/icons/gif/bullet_arrow_up.gif";
                }

		this.layer.style.display="block";
	   }
	}

 	this.writeToLayer = function writeToLayer( layer,htmlData )
        {
	   	layer = document.getElementById(layer);
		layer.innerHTML = htmlData;
        }
}
