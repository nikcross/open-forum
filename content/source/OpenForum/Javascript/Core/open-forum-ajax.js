//---- Ajax ----

Ajax = new function() {

  this.sendRequest = function sendRequest(request) {

    request.transaction = false;

    if(window.XMLHttpRequest)
    {
      try {
        request.transaction = new XMLHttpRequest();
      }
      catch(e)
      {
        alert(e);
        request.transaction = false;
      }
    }
    else if(window.ActiveXObject)
    {
      try {
        request.transaction = new ActiveXObject("Msxml2.XMLHTTP");
      }
      catch(e)
      {
        alert(e);
        try {
          request.transaction = new ActiveXObject("Microsoft.XMLHTTP");
        }
        catch(e)
        {
          alert(e);
          request.transaction = false;
        }
      }
    }
    if(request.transaction)
    {
      if(request.asynchronous === true)
      {
        var fn = eval(request.id+".processTransactionStateChange");
        request.transaction.onreadystatechange= function(ev){ fn(ev); };
        if(request.request!==null && request.request.length>0) {
          request.transaction.open(request.method, request.url+"?"+request.request,true);
          request.transaction.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
          //request.transaction.setRequestHeader("If-Modified-Since", new Date(0));
          request.transaction.send(request.data);
		} else {
          request.transaction.open(request.method, request.url,true);
          request.transaction.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
          //request.transaction.setRequestHeader("If-Modified-Since", new Date(0));
          request.transaction.send(request.data);
        }
      }
      else
      {
        if(request.request!==null && request.request.length>0) {
          request.transaction.open(request.method, request.url+"?"+request.request,false);
          request.transaction.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        } else {
          request.transaction.open(request.method, request.url,false);
          request.transaction.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        }
        //request.transaction.setRequestHeader("If-Modified-Since", new Date(0));
        request.transaction.send(request.data);
        this.currentRequest=null;
        return request.transaction.responseText;
      }
    }
    else
    {
      alert("failed");
    }
  };

};