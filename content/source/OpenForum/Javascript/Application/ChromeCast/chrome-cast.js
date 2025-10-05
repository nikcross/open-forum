initializeCastApi = function() {

  // https://developers.google.com/cast/docs/registration
  // Register a Custom Receiver
  //var chromecastReceiverApplicationId = "DE2915C8";
  try{
    sendContext = cast.framework.CastContext.getInstance();
    sendContext.setOptions({
      receiverApplicationId: chromecastReceiverApplicationId,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });
    sendContext.endCurrentSession(false);
    message += "Send";
  } catch(e) {
    console.log(e);
  }
};

window['__onGCastApiAvailable'] = function(isAvailable) {
  if (isAvailable) {
    initializeCastApi();
  }
};