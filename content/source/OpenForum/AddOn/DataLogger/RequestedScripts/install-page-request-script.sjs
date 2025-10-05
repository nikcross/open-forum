/*
* Author: 
* Description: 
*/

var packageURL = "https://open-forum.onestonesoup.org/TheLab/Experiments/TestRelease/TestRelease.wiki.zip";
var fileName = "TestRelease.wiki.zip";

external.getURLAsFile( packageURL , pageName , fileName );
file.unZipAttachment( pageName , fileName );
