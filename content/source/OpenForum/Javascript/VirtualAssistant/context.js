/*
* Author: 
* Description: 
*/
var Context = new function() {
  var self = this;
  var CONTEXT_TTL = 20000;
  var SUBJECT_TTL = 60000;
  var context = {};
  
  var cleanContext = function() {
    var now = new Date().getTime();
    
    for(var i in context) {
      var node = context[i];
      if(node.ttl) {
        if(now > node.ts+node.ttl) {
          if(node.timeoutAction) {
            timeoutAction();
          }
          delete context[i];
        }
      }
    }
  };
  
  setInterval(cleanContext,500);
  
  self.addValue = function(name,value) {
    if(!context.values) context.values = {};
    context.values[name]=value;
  };
  
  self.getValue = function(name) {
    if(!context.values) return;
    return context.values[name];
  };
  
  self.setSubject = function(data) {
    var now = new Date().getTime();
    context.subject = {data:data, ttl: SUBJECT_TTL, ts: now};
  };
  
  self.getSubject = function() {
    return context.subject.data;
  };
  
  self.addConfirmAction = function(match,replyTemplate,yesAction,noAction,timeoutAction) {
    var now = new Date().getTime();
    if(!noAction) noAction = yesAction;
    context.confirm = {ts: now, ttl: CONTEXT_TTL, yesAction: yesAction, noAction: noAction,timeoutAction: timeoutAction,match: match,replyTemplate: replyTemplate};
  };
  
  self.yes = function(match,replyTemplate) {
    if(context.confirm && context.confirm.yesAction) {
      var result = context.confirm.yesAction(context.confirm.match,context.confirm.replyTemplate,true);
      delete context.confirm;
      return result;
    } else return false;
  };
  
  self.no = function(match,replyTemplate) {
    if(context.confirm && context.confirm.noAction) {
      var template = context.confirm.replyTemplate;
      if(!template) template = replyTemplate;
      var result = context.confirm.noAction(context.confirm.match,template,false);
      delete context.confirm;
      return result;
    } else return false;
  };
};