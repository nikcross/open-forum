var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");
if(Alert!=null) Alert.beatAlert("Manage Queues");
try{
	openForum.cleanUpQueues();
} catch(e) {
  if(Alert!=null) Alert.triggerAlert("Error in /OpenForum/Triggers/TimerTrigger/ManageQueues",e);
}