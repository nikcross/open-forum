/*				js.mount(event.getMessage().getSubject(),"messageSubject");
				js.mount("message",event.getMessage());
				js.mount("validSentAddresses",event.getValidSentAddresses());
				js.mount("invalidAddresses",event.getInvalidAddresses());
				js.mount("validUnsentAddresses",event.getValidUnsentAddresses());
				js.mount("reason","Message Partially Delivered");*/

log.error("Error sending email "+messageSubject+" to "+validSentAddresses+" invalid addresses "+invalidAddresses+" "+reason);