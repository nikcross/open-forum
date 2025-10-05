/*
* Author: 
* Description: 
*/
var deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  console.log('beforeinstallprompt Event fired');
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  return false;
});      

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/TheLab/Experiments/ProgresiveWebApp/service-worker.js', { scope: '/TheLab/Experiments/ProgresiveWebApp/' }).then(function(registration) {
      //navigator.serviceWorker.register('/TheLab/Experiments/ProgresiveWebApp/service-worker.js', { scope: '/TheLab/Experiments/ProgresiveWebApp' }).then(function(registration) {
      //navigator.serviceWorker.register('/TheLab/Experiments/ProgresiveWebApp/service-worker.js', { scope: '/TheLab/Experiments/' }).then(function(registration) {
      // Registration was successful
      console.log('Registered!');
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    }).catch(function(err) {
      console.log(err);
    });
  });
  /*
        window.addEventListener('beforeinstallprompt', e => {
          console.log('beforeinstallprompt Event fired');
          e.preventDefault();
          // Stash the event so it can be triggered later.
          deferredPrompt = e;
          return false;
        });
*/
} else {
  console.log('service worker is not supported');
}

function triggerPrompt() {
  if(deferredPrompt==null) {
    console.log("No deferredPrompt");
    return;
  }
  // When you want to trigger prompt:
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(choice => {
    console.log(choice);
  });
  deferredPrompt = null;
}