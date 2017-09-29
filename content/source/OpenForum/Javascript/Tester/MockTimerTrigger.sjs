/*
* Author: Nik Cross
* Description: 
*
* MockTimerTrigger = js.getObject("/OpenForum/Javascript/Tester","MockTimerTrigger.sjs");
* mockTrigger.isTenMinutePeriod(true);
*
*/
var MockTimerTrigger = function() {
  var self = this;
  self.getMock = function() {
    return new function() {
      var self = this;
      
      var minutePeriod = false;
      self.isMinutePeriod = function(state) {
        if(state) {
          minutePeriod = state;
        } else {
          return minutePeriod;
        }
      }

      var tenMinutePeriod = false;
      self.isTenMinutePeriod = function(state) {
        if(state) {
          tenMinutePeriod = state;
        } else {
          return tenMinutePeriod;
        }
      }

      var hourPeriod = false;
      self.isHourPeriod = function(state) {
        if(state) {
          hourPeriod = state;
        } else {
          return hourPeriod;
        }
      }
      
      self.resetMock = function() {
        minutePeriod = false;
        tenMinutePeriod = false;
        hourPeriod = false;
      }
    };
  }
}
