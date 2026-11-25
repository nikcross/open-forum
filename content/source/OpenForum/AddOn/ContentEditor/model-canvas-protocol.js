/*
* ContentEditorProtocol
* Versioned shell<->canvas message envelope (CON-T-008, section 7.3). The
* shell (page.js, via OpenForum.includeScript) and the canvas (loaded with
* the per-render CSP nonce) share this one copy. Messages travel over the
* OpenForum IntraQ bus (CON-T-041).
*
* Version 2 adds renderId: one IntraQ queue serves the whole editor
* session, and every canvas render has its own id, so a message left over
* from a replaced canvas can be told apart from the current one.
*/
var ContentEditorProtocol = (function() {

  var VERSION = 2;

  function createMessage(type, payload, correlationId, renderId) {
    return {
      protocolVersion: VERSION,
      type: type,
      correlationId: correlationId || null,
      renderId: renderId || null,
      payload: payload === undefined ? null : payload,
      ts: Date.now()
    };
  }

  function isValidMessage(message) {
    if (!message || typeof message !== "object") return false;
    if (message.protocolVersion !== VERSION) return false;
    if (typeof message.type !== "string" || message.type.length === 0) return false;
    if (message.correlationId !== null && typeof message.correlationId !== "string") return false;
    if (message.renderId !== null && typeof message.renderId !== "string") return false;
    return true;
  }

  var api = {
    VERSION: VERSION,
    createMessage: createMessage,
    isValidMessage: isValidMessage
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ContentEditorProtocol = api;
  return api;
})();
