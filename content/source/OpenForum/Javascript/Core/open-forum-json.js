//---- JSON ----

        if( typeof(JSON)=="undefined" ) {
       		JSON = new function() {};
        }

		JSON.get = function( page,action,parameters ) {
          var request = {method: 'GET',page: page,action: action,parameters: parameters, onSuccess: JSON.onSuccess, onError: JSON.onError, go: JSON.go};
			return request;
		};

       JSON.post = function( page,action,parameters ) {
         var request = {method: 'POST',page: page,action: action,parameters: parameters, onSuccess: JSON.onSuccess, onError: JSON.onError, go: JSON.go};
			return request;
		};
		JSON.onSuccess = function(onSuccess) {
			this.onSuccess = function(data) {
              //var object = JSON.parse(data);
              var object = eval("("+data+")");
				onSuccess(object);
			};
			return this;
		};
		JSON.onError = function(onError) {
			this.onError = function(error) {
				onError(error);
			};
			return this;
		};
		JSON.go = function() {
			var request = null;
          if(this.action && this.action != null && this.action != "") request = "action="+this.action;
          
          if(this.method=="GET") {
			if(this.parameters && this.parameters.length>0) {
				request+="&"+this.parameters;
            }
            Ajax.sendRequest( new AjaxRequest(this.method,this.page,request,"",this.onSuccess,this.onError,true) );
          } else {
			Ajax.sendRequest( new AjaxRequest(this.method,this.page,request,this.parameters,this.onSuccess,this.onError,true) );
          }
		};