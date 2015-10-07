includeInitFunction("mouse.initMouse()");

mouse = new function()
{
  this.selected = null;
  this.x = 0;
  this.y = 0;

  this.setSelected = function setSelected(obj)
  {
    if(obj==null || mouse.selected==obj)
    {
      mouse.selected=null;
      return;
    }

    mouse.selected = obj;
    mouse.selected.pickUp();
//webChatSender.sendMessage( "JSDebug","picked up "+obj.objName)
  }

	this.initMouse = function initMouse()
	{
		if (document.layers)
		{
			document.captureEvents(Event.MOUSEDOWN);
		}

	  	document.onmousemove = mouse.moved;
		document.onmousedown= mouse.down;
		document.onmouseup = mouse.up;
	  	document.onmouseout = mouse.out;

	}

	this.moved = function moved(e)
	{
		if (!e)
		{
			var e = window.event;
		}
		if (e.pageX || e.pageY)
		{
			mouse.x = e.pageX;
			mouse.y = e.pageY;
		}
		else if (e.clientX || e.clientY)
		{
			mouse.x = e.clientX + document.body.scrollLeft;
			mouse.y = e.clientY + document.body.scrollTop;
		}

		if(mouse.selected!=null)
		{
			mouse.selected.drag(mouse.x,mouse.y);
			return false;
		}

		return true;
	}
	this.up = function up()
	{
		if(mouse.selected!=null)
		{
			/*if(mouse.selected.isSticky()==false)
			{
//webChatSender.sendMessage( "JSDebug","Up - Dropped Not Sticky "+mouse.selected.objName);
				mouse.selected.drop();
				mouse.selected=null;
			}*/
                }
		return true;
	}
	this.down = function down(e)
	{
//webChatSender.sendMessage( "JSDebug","down");
		var rightclick;
		if (!e)
		{
			var e = window.event;
		}
		if(e.which)
		{
			rightclick = (e.which == 3);
		}
		else if(e.button)
		{
			rightclick = (e.button == 2);
		}

		if(rightclick)
		{
			if(mouse.selected!=null)
			{
				mouse.selected.rightClick();
                	}
			return true;
		}
		else
		{
			if(mouse.selected!=null)
			{
//				if(mouse.selected.isSticky()==true)
//				{
//webChatSender.sendMessage( "JSDebug","Dropped Sticky "+mouse.selected.objName);
					mouse.selected.drop();
					mouse.selected=null;
//				}
                	}
                	return true;
		}
	}
	this.out = function out()
	{
		return true;
	}
}
