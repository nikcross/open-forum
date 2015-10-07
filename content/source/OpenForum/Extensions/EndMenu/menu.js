currentMenuLayer = null;

function toggleMenuLayer(layerId)
{
	layer = document.getElementById(layerId);

   if(layer.style.display=="block")
   {
	layer.style.display="none";
	currentMenuLayer = null;
   }
   else
   {
	layer.style.display="block";

	if(currentMenuLayer!=null)
	{
		currentMenuLayer.style.display="none";
	}
	currentMenuLayer = layer;
   }
}