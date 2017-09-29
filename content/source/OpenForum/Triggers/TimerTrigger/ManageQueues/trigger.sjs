var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");
Alert.beatAlert("Manage Queues");
try{
	openForum.cleanUpQueues();
} catch(e) {
  Alert.triggerAlert("Error in /OpenForum/Triggers/TimerTrigger/ManageQueues",e);
}