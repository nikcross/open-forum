/**
 * Some helper methods used by Giraffe
 * @class
 */
Giraffe = {
		/**
		 * @private
		 */
		canvases : [],
		/**
		 * @private
		 */
		nextCanvasId : 0,		
		/**
		 * @private
		 */
		getCssValue : function(selector,attribute) {
			selector = selector.toLowerCase();
		   for(var sheet=0;sheet<document.styleSheets.length;sheet++) {
			   var stylesheet = document.styleSheets[sheet];
			   var n = stylesheet.cssRules.length;
			   for(var i=0; i<n; i++)
			   {
			      var selectors = stylesheet.cssRules[i].selectorText.toLowerCase().split(",");
			      var m = selectors.length;
			      for(var j=0; j<m; j++)
			      {
			         if(selectors[j].trim() == selector)
			         {
			            var value = stylesheet.cssRules[i].style.getPropertyValue(attribute);
			            if(value!="")
			            {
			               return value;
			            }
			         }
			      }
			   }
		   }
		   return null;
		}
};

Giraffe.X=0;
Giraffe.Y=1;
Giraffe.DEG_TO_RAD = Math.PI/180;