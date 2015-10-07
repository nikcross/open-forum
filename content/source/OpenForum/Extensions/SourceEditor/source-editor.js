   var lineObjOffsetTop = 4; 
    
   function createTextAreaWithLines(id) 
   { 
      var el = document.createElement('DIV'); 
      var ta = document.getElementById(id); 
      ta.parentNode.insertBefore(el,ta); 
      el.appendChild(ta); 
       
      el.className='textAreaWithLines'; 
      el.style.width = (ta.offsetWidth + 50) + 'px'; 
      ta.style.position = 'absolute'; 
      ta.style.left = '50px'; 
      el.style.height = (ta.offsetHeight + 1) + 'px'; 
      el.style.overflow='hidden'; 
      el.style.position = 'relative'; 
      el.style.width = (ta.offsetWidth + 50) + 'px'; 
      var lineObj = document.createElement('DIV'); 
      lineObj.style.position = 'absolute'; 
      lineObj.style.top = lineObjOffsetTop + 'px'; 
      lineObj.style.left = '0px'; 
      lineObj.style.width = '47px'; 
      el.insertBefore(lineObj,ta); 
      lineObj.style.textAlign = 'right'; 
      lineObj.className='lineObj'; 
      var string = ''; 
      for(var no=1;no<7000;no++){ 
         if(string.length>0)string = string + '<br>'; 
         string = string + no; 
      } 
       
      ta.onkeydown = function() { positionLineObj(lineObj,ta); }; 
      ta.onmousedown = function() { positionLineObj(lineObj,ta); }; 
      ta.onscroll = function() { positionLineObj(lineObj,ta); }; 
      ta.onblur = function() { positionLineObj(lineObj,ta); }; 
      ta.onfocus = function() { positionLineObj(lineObj,ta); }; 
      ta.onmouseover = function() { positionLineObj(lineObj,ta); }; 

      lineObj.innerHTML = string; 
       
   } 
    
   function positionLineObj(obj,ta) 
   { 
      obj.style.top = (ta.scrollTop * -1 + lineObjOffsetTop) + 'px';    
    
       
   } 