/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/Javascript/Application/Tabs.js");

var tabList = [
  {title: "Overview"},
  {title: "Tab1"},
  {title: "Tab2"}
];
var pageTabs;

OpenForum.init = function() {
  pageTabs = new Tabs( "tabViews",tabList,continueInit );
};

function continueInit() {
  OpenForum.hideElement("splash");
  OpenForum.showElement("application");
  setTimeout(function() {pageTabs.showTab("overview");} , 100);
}

