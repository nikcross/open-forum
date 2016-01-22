//---- AjaxRequest ----

requestCount = 0;
function AjaxRequest(method,url,request,data,onSuccess,onError,asynchronous)
{
  var self=this;
  self.id = "request_"+requestCount;
  requestCount++;
  eval( self.id+"=this;" );

  self.method = method;
  self.url = url;
  self.request = request;
  self.data = data;
  self.onSuccess = onSuccess;
  self.onError = onError;
  self.asynchronous = asynchronous;
  self.transaction = null;

  this.processTransactionStateChange = function processTransactionStateChange(ev) {
    if (self.transaction.readyState == 4) {
      if (self.transaction.status == 200) {
          onSuccess(self.transaction.responseText);
      } else if (self.transaction.status === 0) {
      } else {
        onError( self.transaction.status,self.transaction.statusText );
      }
      eval( self.id+"=null;" );
    }
  };
}