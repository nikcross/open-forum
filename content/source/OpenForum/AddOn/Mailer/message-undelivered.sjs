/*				js.mount("messageSubject",event.getMessage().getSubject());
				js.mount("message",event.getMessage());
				js.mount("validSentAddresses",event.getValidSentAddresses());
				js.mount("invalidAddresses",event.getInvalidAddresses());
				js.mount("validUnsentAddresses",event.getValidUnsentAddresses());
				js.mount("reason","Message Not Delivered");*/
var invalidAddresses = "";
for(var i=0;i<validSentAddresses.length;i++) {
  invalidAddresses +=" , "+validSentAddresses[i].toString();
}

log.error("Error sending email "+messageSubject+" to "+invalidAddresses+" "+reason);