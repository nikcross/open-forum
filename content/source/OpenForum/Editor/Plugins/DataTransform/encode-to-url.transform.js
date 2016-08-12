url = "http://192.168.0.169/OpenForum/Actions/Save?returnType=json&pageName=/OpenForum/AddOn/RemoteLogger/LogSystemStatus&fileName=trigger.sjs&data=";
while(input.indexOf("  ")!=-1) {
input = input.replace("  "," ");
}
input = encodeURI(input);
input = input.replace(/\+/g,"%2B");
input = input.replace(/&/g,"%26");

output = url + input;