/*
* ContentEditorCanvasRuntime
* Runs inside the editor canvas iframe (CON-T-039). Loaded with the
* per-render CSP nonce after open-forum-intraq.js and
* model-canvas-protocol.js, and configured by window.ContentEditorCanvasConfig
* = { renderId, queueName, selectedId, preview, openComponentId }. In preview it only
* reports the page height and stops links navigating. Every exchange with the editor shell is a
* ContentEditorProtocol message on the session's IntraQ queue (CON-T-041).
*
* It only reports what the person does - selecting, typing, formatting -
* and never changes the page model itself: the shell turns each finished
* edit into an undoable command and re-renders the canvas from the model.
*
* Canvas -> shell: canvas:ready, canvas:pong, canvas:size, canvas:select,
*   canvas:deselect, canvas:frame-click, canvas:edit-start, canvas:edit-end,
*   canvas:field-changed, canvas:undo-redo, canvas:position, canvas:link-made.
* Shell -> canvas: shell:ping, shell:begin-edit, shell:format, shell:link,
*   shell:commit, shell:highlight.
*/
(function() {
  var config = window.ContentEditorCanvasConfig || {};
  var RENDER_ID = config.renderId;
  var queue = new OpenForum.IntraQ( config.queueName );

  function send( type, payload, correlationId ) {
    queue.send( ContentEditorProtocol.createMessage( type, payload, correlationId, RENDER_ID ) );
  }

  var selected = null;
  var editing = null; // { el, elementId, fieldId, rich, original }

  function elementInfo( el ) {
    return {
      elementId: el.getAttribute( "data-element-id" ),
      elementType: el.getAttribute( "data-element-type" ),
      fieldId: el.getAttribute( "data-field-id" )
    };
  }

  // A placed component is one locked block: its parts are changed in the
  // site library (CON-T-045). Only the component being edited, if any, is
  // open. Returns the outermost locked component holding el, or null.
  function lockedComponent( el ) {
    var found = null;
    for( var node = el; node && node.getAttribute; node = node.parentElement ) {
      if( node.getAttribute( "data-element-type" ) === "component" && node.getAttribute( "data-element-id" ) !== config.openComponentId ) found = node;
    }
    return found;
  }

  function isEditable( el ) {
    var type = el.getAttribute( "data-element-type" );
    return !!el.getAttribute( "data-field-id" ) && ( type === "heading" || type === "rich-text" || type === "html" ) && !lockedComponent( el );
  }

  function markSelected( el, slot ) {
    if( selected ) selected.classList.remove( "ce-selected" );
    var target = document.querySelector( ".ce-target-slot" );
    if( target ) target.classList.remove( "ce-target-slot" );
    selected = el;
    if( selected ) selected.classList.add( "ce-selected" );
    var column = slot ? columnOf( el, slot ) : null;
    if( column ) column.classList.add( "ce-target-slot" );
  }

  // CON-T-054: the column (data-slot) of container el, or null.
  function columnOf( el, slot ) {
    if( !el ) return null;
    var columns = el.querySelectorAll( ".ce-column[data-slot]" );
    for( var i = 0; i < columns.length; i++ ) {
      if( columns[ i ].getAttribute( "data-slot" ) === slot && columns[ i ].closest( "[data-element-id]" ) === el ) return columns[ i ];
    }
    return null;
  }

  function findById( id ) {
    return id ? document.querySelector( "[data-element-id='" + String( id ).replace( /'/g, "" ) + "']" ) : null;
  }

  function placeCaret( el, event ) {
    var range = event && document.caretRangeFromPoint ? document.caretRangeFromPoint( event.clientX, event.clientY ) : null;
    if( !range || !el.contains( range.startContainer ) ) {
      range = document.createRange();
      range.selectNodeContents( el );
      range.collapse( false );
    }
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange( range );
  }

  function beginEditing( el, event ) {
    var info = elementInfo( el );
    var rich = info.elementType === "rich-text" || info.elementType === "html"; // html: existing markup (PHW-T-002)
    editing = { el: el, elementId: info.elementId, fieldId: info.fieldId, rich: rich, original: rich ? el.innerHTML : el.textContent };
    el.contentEditable = "true";
    el.focus();
    placeCaret( el, event );
    el.addEventListener( "blur", function() { setTimeout( function() { commitEditing( null ); }, 0 ); }, { once: true } );
    send( "canvas:edit-start", { elementId: info.elementId, rich: rich } );
  }

  // Finishes the current edit. Reports the new value only if it changed,
  // with next naming what the person moved on to, so the shell can carry
  // on there after it re-renders. Returns true if a change was reported.
  function commitEditing( next ) {
    if( !editing ) return false;
    var e = editing;
    editing = null;
    var value = e.rich ? e.el.innerHTML : e.el.textContent;
    var changed = value !== e.original;
    e.el.contentEditable = "false";
    // field-changed first, so by the time the shell sees edit-end the edit
    // is in the model (a save waits for that).
    if( changed ) send( "canvas:field-changed", { elementId: e.elementId, fieldId: e.fieldId, rich: e.rich, value: value, next: next || null } );
    send( "canvas:edit-end", { elementId: e.elementId, changed: changed } );
    return changed;
  }

  // slot: the column clicked inside a two-column element (CON-T-054), so
  // the shell can add the next element there.
  function selectElement( el, event, slot ) {
    var editable = isEditable( el );
    var info = elementInfo( el );
    if( slot ) info.slot = slot;
    if( commitEditing( { elementId: info.elementId, edit: editable } ) ) return; // the shell re-renders and continues there
    markSelected( el, slot );
    send( "canvas:select", info );
    if( editable ) beginEditing( el, event );
  }

  document.addEventListener( "click", function( event ) {
    event.preventDefault(); // links and buttons never navigate while editing
    if( config.preview ) return;
    var target = event.target;
    if( editing && editing.el.contains( target ) ) return; // keep typing where clicked
    var part = target.closest( ".ce-kicker" ) ? "kicker" : target.closest( ".ce-byline" ) ? "byline" : target.closest( ".ce-tags" ) ? "tags" : null;
    if( part ) {
      commitEditing( null );
      markSelected( null );
      send( "canvas:frame-click", { part: part } );
      return;
    }
    var el = target.closest( "[data-element-id]" );
    if( el ) el = lockedComponent( el ) || el;
    if( !el || el.getAttribute( "data-element-type" ) === "page-root" ) {
      if( commitEditing( { elementId: null, edit: false } ) ) return;
      markSelected( null );
      send( "canvas:deselect" );
      return;
    }
    var column = target.closest( ".ce-column[data-slot]" );
    selectElement( el, event, column && column.closest( "[data-element-id]" ) === el ? column.getAttribute( "data-slot" ) || null : null );
  }, true );

  document.addEventListener( "keydown", function( event ) {
    if( config.preview ) return;
    var meta = event.ctrlKey || event.metaKey;
    var key = event.key.toLowerCase();
    if( meta && ( key === "z" || key === "y" ) ) {
      // The shell owns the command stack; finish the edit first so the
      // keystroke that triggered this isn't lost.
      event.preventDefault();
      commitEditing( null );
      send( "canvas:undo-redo", { redo: key === "y" || event.shiftKey } );
      return;
    }
    if( editing ) {
      if( event.key === "Escape" || ( event.key === "Enter" && !editing.rich ) ) {
        event.preventDefault();
        editing.el.blur();
      }
      return;
    }
    if( event.key !== "Enter" && event.key !== " " ) return;
    var el = event.target.closest ? event.target.closest( "[data-element-id]" ) : null;
    if( !el ) return;
    event.preventDefault();
    selectElement( el, null );
  } );

  // Paste (CON-T-053): rich text keeps its allowed formatting, cleaned with
  // the import allowlist (ContentEditorPageImport.cleanPaste); other fields
  // take plain text. The shell cleans rich text again when the edit commits.
  document.addEventListener( "paste", function( event ) {
    if( !editing ) return;
    event.preventDefault();
    var data = event.clipboardData || window.clipboardData;
    var html = editing.rich ? data.getData( "text/html" ) : "";
    if( html && window.ContentEditorPageImport ) {
      var cleaned = ContentEditorPageImport.cleanPaste( html ).html;
      if( cleaned ) { document.execCommand( "insertHTML", false, cleaned ); return; }
    }
    document.execCommand( "insertText", false, data.getData( "text/plain" ) );
  } );

  var lastHeight = 0;
  function reportSize() {
    var height = Math.ceil( document.documentElement.scrollHeight );
    if( height === lastHeight ) return;
    lastHeight = height;
    send( "canvas:size", { height: height } );
  }
  document.addEventListener( "input", reportSize );
  if( window.ResizeObserver ) new ResizeObserver( reportSize ).observe( document.body );
  Array.prototype.forEach.call( document.images, function( img ) { img.addEventListener( "load", reportSize ); } );

  queue.addListener( function( message ) {
    if( !ContentEditorProtocol.isValidMessage( message ) || message.renderId !== RENDER_ID ) return;
    var payload = message.payload || {};
    if( message.type === "shell:ping" ) {
      send( "canvas:pong", null, message.correlationId );
    } else if( message.type === "shell:begin-edit" ) {
      var target = findById( payload.elementId );
      if( !target ) return;
      markSelected( target );
      if( isEditable( target ) ) beginEditing( target, null );
    } else if( message.type === "shell:format" && editing ) {
      editing.el.focus();
      document.execCommand( payload.command, false, payload.value || null );
    } else if( message.type === "shell:link" && editing ) {
      editing.el.focus();
      var made = !window.getSelection().isCollapsed;
      if( made ) document.execCommand( "createLink", false, payload.url );
      send( "canvas:link-made", { made: made } );
    } else if( message.type === "shell:commit" ) {
      commitEditing( null );
    } else if( message.type === "shell:highlight" ) {
      var el = findById( payload.elementId );
      markSelected( el );
      if( el ) send( "canvas:position", { elementId: payload.elementId, top: Math.round( el.getBoundingClientRect().top + window.scrollY ) } );
    }
  } );

  var selectable = config.preview ? [] : document.querySelectorAll( "[data-element-id]" );
  for( var i = 0; i < selectable.length; i++ ) {
    var lock = lockedComponent( selectable[ i ] );
    if( selectable[ i ].getAttribute( "data-element-type" ) !== "page-root" && ( !lock || lock === selectable[ i ] ) ) selectable[ i ].tabIndex = 0;
  }
  if( config.selectedId ) markSelected( findById( config.selectedId ), config.selectedSlot );
  // CON-T-026: mark the parts that changed (editor-only chrome).
  ( config.changedIds || [] ).forEach( function( id ) {
    var changed = findById( id );
    if( changed ) changed.classList.add( "ce-changed" );
  } );

  send( "canvas:ready" );
  reportSize();
})();
