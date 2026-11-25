/*
 * OpenForum.addEndlessScroll( getNewData, elementId, targetElementId )
 *
 * Keeps about one screen of content loaded below what is visible. getNewData(elementId) returns the
 * next HTML to append to elementId, or "" / null when there is nothing more.
 *
 * targetElementId is the element that scrolls (for an app that scrolls inside its own panel). If it is
 * left out, the window scroll is used.
 *
 * Returns a handle: handle.check() loads more if needed (call it after content changes height, for
 * example when an item finishes loading, or when a hidden list is shown), and handle.stop() removes
 * the listeners. Calling
 * addEndlessScroll again for the same elementId stops the earlier one, so a list can be redrawn safely.
 *
 * OFS-B-007: measure the element that actually scrolls (the old code always measured document.body and
 * loaded up to 100 items per scroll event in panel-scrolling apps), and stop earlier listeners.
 */
OpenForum.endlessScrolls = OpenForum.endlessScrolls || {};

OpenForum.addEndlessScroll = function( getNewData, elementId, targetElementId ) {
  var previous = OpenForum.endlessScrolls[elementId];
  if( previous ) {
    previous.stop();
  }

  var loading = false;
  var finished = false;
  var stopped = false;

  var scroller = null;
  if( isUndefined( targetElementId ) == false && targetElementId != null ) {
    scroller = document.getElementById( targetElementId );
    // A target that does not scroll itself can't be measured; use the window instead.
    if( scroller != null && window.getComputedStyle && !/(auto|scroll|overlay)/.test( window.getComputedStyle( scroller ).overflowY ) ) {
      scroller = null;
    }
  }

  // Space below the visible area, and the visible height, of whatever is scrolling.
  var measure = function() {
    if( scroller != null ) {
      return {
        below: scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight,
        visible: scroller.clientHeight
      };
    }
    var root = document.documentElement;
    var visible = window.innerHeight || root.clientHeight;
    var height = Math.max( root.scrollHeight, document.body ? document.body.scrollHeight : 0 );
    var top = window.scrollY || window.pageYOffset || root.scrollTop || 0;
    return { below: height - top - visible, visible: visible };
  };

  // Nothing is loaded into a list that is hidden (for example in a view that is not showing), because
  // hidden content adds no height and would never stop the loop. Call check() when it is shown again.
  var needsMore = function() {
    var element = document.getElementById( elementId );
    if( element == null || element.getClientRects().length == 0 ) return false;
    var size = measure();
    return size.below < size.visible;
  };

  var tryLoadMore = function() {
    if( loading || finished || stopped ) return;
    loading = true;

    try {
      var safety = 0;
      while( safety < 100 && needsMore() ) {
        var newData = getNewData( elementId );
        if( newData == null || newData == "" ) {
          finished = true;
          break;
        }

        OpenForum.appendToElement( elementId, newData );
        safety++;
      }
    } finally {
      loading = false;
    }
  };

  var onScroll = function() {
    tryLoadMore();
  };

  var target = scroller != null ? scroller : window;
  target.addEventListener( "scroll", onScroll, { passive: true } );
  window.addEventListener( "resize", onScroll );

  var handle = {
    check: function() {
      tryLoadMore();
    },
    stop: function() {
      stopped = true;
      target.removeEventListener( "scroll", onScroll, { passive: true } );
      window.removeEventListener( "resize", onScroll );
      if( OpenForum.endlessScrolls[elementId] === handle ) {
        delete OpenForum.endlessScrolls[elementId];
      }
    },
    isFinished: function() {
      return finished;
    }
  };
  OpenForum.endlessScrolls[elementId] = handle;

  tryLoadMore();

  return handle;
};

OpenForum.addEndlessScroll.version = 2;
