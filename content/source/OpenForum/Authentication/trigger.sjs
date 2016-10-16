/*
* Author: Nik Cross
* Description: Create a new siteHash every minute
*/
	var siteHash = ""+file.getAttachment("/OpenForum/Authentication","authentication.hash.b");
	file.saveAttachment("/OpenForum/Authentication","authentication.hash.a",siteHash);

	var ts = Math.floor(new Date().getTime()/60000);
    siteHash = js.generateMD5("SiteHash:"+siteHash+":"+ts);
	file.saveAttachment("/OpenForum/Authentication","authentication.hash.b",siteHash);

