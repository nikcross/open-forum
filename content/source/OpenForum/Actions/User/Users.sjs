/*
* Author: Nik Cross
* Description: 
*/

Users = function() {
  this.getUser = function(userName) {

    return new function() {
      var self = this;
      var name = userName;

      self.getName = function() {
        return userName;
      };

      self.getPageHistory = function() {
        var history = openForum.retrieveObject(userName+".pageHistory");
        if(history) {
          return history;
        } else {
          return [];
        }
      };

      self.getSortedPageHistory = function(maxNumber) {
        var history = self.getPageHistory();
        var now = new Date();
        for(var i in history) {
          var pageEntry = history[i];
          pageEntry.score = 7-(now.getTime()-pageEntry.lastViewed)/86400000; //Days since last viewed
          pageEntry.score += pageEntry.viewCount;
        }

        history.sort(
          function (a,b) {
            return b.score-a.score;
          }
        );

        if(!maxNumber) {
          return history;
        }

        var topHistory = [];
        for(var i=0; i<maxNumber && i<history.length; i++) {
          topHistory.push(history[i]);
        }
        return topHistory;
      };

      self.updatePageHistory = function(pageName) {
        var history = self.getPageHistory();
        var now  = new Date();
        var pageEntry = {pageName: pageName, viewCount: 0};
        for(var i in history) {
          if(history[i].pageName==pageName) {
            pageEntry = history[i];
            break;
          }
        }
        if(pageEntry.viewCount===0) {
          history.push(pageEntry);
        }
        pageEntry.viewCount++;
        pageEntry.lastViewed= now.getTime();
        openForum.storeObject(userName+".pageHistory",history);
      };

    };

  };
};
