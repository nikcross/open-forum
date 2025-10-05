/*
* Author: 
* Description: 
*/
var Panels = new function() {
  var self =this;

  var pauseEvent = function(e){
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
  };
  
  self.makeResizeable = function(rightPanel,leftPanel) {
    OpenForum.loadCSS("/OpenForum/Javascript/Application/panels.css");

    rightPanel.classList.add("resizableRight");
    if(leftPanel) leftPanel.classList.add("resizableLeft");

    let m_pos;
    function resize(e){
      const dx = m_pos - e.x;
      m_pos = e.x;
      rightPanel.style.width = (parseInt(getComputedStyle(rightPanel, '').width) + dx) + "px";
      if(leftPanel) leftPanel.style.width = (parseInt(getComputedStyle(leftPanel, '').width) - dx) + "px";
    }

    rightPanel.addEventListener("mousedown", function(e){
      e=e || window.event;
      if (e.offsetX < 4) {
	    pauseEvent(e);
        m_pos = e.x;
        document.addEventListener("mousemove", resize, false);
      }
    }, false);

    document.addEventListener("mouseup", function(){
      document.removeEventListener("mousemove", resize, false);
    }, false);
  };
};