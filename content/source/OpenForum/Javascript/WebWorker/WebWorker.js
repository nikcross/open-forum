/*
* Author: 
* Description: 
*/
if(!OpenForum) {
  OpenForum = {};
}

OpenForum.WebWorker = function() {
  
  var OFWorker = function() {
    var jobIndex = 0;
    var jobs = [];
    var worker = new Worker("/OpenForum/Javascript/WebWorker/web-worker-internal.js");
    var self = this;

    var processWorkerMessage = function(data) {
      if(data.jobId && jobs[data.jobId] && jobs[data.jobId].callBack) {
        jobs[data.jobId].callBack( data.result,data.jobId );
      } else if(data.getId) {
        var result = eval(data.key);
        worker.postMessage({getId: data.getId, result: result});
      } else if(data.setId) {
        var result = eval(data.key+"="+data.value);
      } else {
        console.log(data);
      }
    };

    worker.onmessage = function(event) {
      processWorkerMessage(event.data);
    };

    self.includeScript = function(scriptFile) {
      var script = OpenForum.loadFile(scriptFile);
      worker.postMessage({include: script});
    };

    self.run = function(script,callBack) {
      var jobId = "job."+jobIndex++;
      jobs[jobId] = {job: script, jobId: jobId, callBack: callBack};

      worker.postMessage({job: script, jobId: jobId});

      return jobs[jobId];
    };
  };
  
  var self = this;
  var defaultWorker = new OFWorker();
  
  self.includeScript = function(scriptFile) {
    defaultWorker.includeScript(scriptFile);
  };
  
  self.run = function(script,callBack) {
    defaultWorker.run(script,callBack);
  };
  
  self.newWorker = function() {
    return new OFWorker();
  };
  
};
OpenForum.WebWorker = new OpenForum.WebWorker();