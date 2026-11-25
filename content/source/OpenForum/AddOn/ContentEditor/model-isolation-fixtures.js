/*
* ContentEditorIsolationFixtures
* Hostile content fixtures for CON-T-010 (section 17.5's "malicious HTML,
* CSS, URLs" fixture requirement). Each fixture is untrusted markup that, if
* the canvas CSP ever regressed, would execute and report itself with a
* distinct hostileType marker. The self-test harness in page.js renders
* each one and asserts that marker never arrives.
*
* Since CON-T-041 the canvas is same-origin (it has to be, to join the
* IntraQ bus), so code that ran inside it could reach the shell in two
* ways. Each fixture tries both: it pushes its marker straight onto the
* shell window (parent.ContentEditorIsolationBreaches) and it posts a
* forged message onto the editor session's IntraQ queue. The per-render
* CSP nonce is what has to stop both.
*
* Only auto-triggering vectors are included here (script tag, onerror,
* onload) since they fire without needing a simulated click. The
* click-triggered case (an onclick attribute) is covered by the live
* verification in CON-T-008/009's own notes instead - script-src-attr
* 'none' blocks inline handler attributes from ever being registered at
* all, the same mechanism that blocks these.
*/
var ContentEditorIsolationFixtures = (function() {

  // context: { queueName, renderId } of the canvas the fixture is rendered
  // into, so the forged IntraQ message targets the real session queue.
  // Uses only single quotes, so it can sit inside a double-quoted attribute.
  function breachScript(hostileType, context) {
    var queueName = (context && context.queueName) || "";
    var renderId = (context && context.renderId) || null;
    return "try{parent.ContentEditorIsolationBreaches.push('" + hostileType + "');}catch(e){}" +
      "try{new BroadcastChannel('" + queueName + "').postMessage({id:'hostile',ts:Date.now(),types:[]," +
      "data:{protocolVersion:2,type:'" + hostileType + "',correlationId:null," +
      "renderId:" + (renderId ? "'" + renderId + "'" : "null") + ",payload:{forged:true},ts:Date.now()}});}catch(e){}";
  }

  var fixtures = [
    {
      name: "raw script tag",
      hostileType: "hostile:script-tag",
      html: function(hostileType, context) {
        return "<div>Hostile fixture: raw script tag</div>" +
          "<script>" + breachScript(hostileType, context) + "<\/script>";
      }
    },
    {
      name: "img onerror attribute",
      hostileType: "hostile:img-onerror",
      html: function(hostileType, context) {
        return "<img src=\"data:,x\" onerror=\"" + breachScript(hostileType, context) + "\">";
      }
    },
    {
      name: "svg onload attribute",
      hostileType: "hostile:svg-onload",
      html: function(hostileType, context) {
        return "<svg onload=\"" + breachScript(hostileType, context) + "\"></svg>";
      }
    }
  ];

  var api = { fixtures: fixtures, breachScript: breachScript };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ContentEditorIsolationFixtures = api;
  return api;
})();
