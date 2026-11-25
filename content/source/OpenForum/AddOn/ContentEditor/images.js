/*
* Content Editor - Images view (CON-T-049). The site's image library: the
* image source pages - by default its own uploads on /Images
* (released to /Images) and /Images, plus any pages the site editor adds
* (changed 2026-10-23) - and linked https images. Uploads are checked on the
* server by their first bytes. ContentEditorApp.loadImages is shared with
* the Content view's image picker.
*/
( function() {
  var u = ContentEditorApp.util;
  var images = [];
  var sources = [];
  var busy = false;
  var details = null; // CON-T-023: the open image's details, { data, armed }

  function load() {
    ContentEditorApp.loadImages().then( function( loaded ) { images = loaded.images; sources = loaded.sources; render(); } );
  }

  function groupHint( source ) {
    if( source.pageName === ContentEditorApp.uploadPage() ) return "Uploads go here; released to /Images with the pages that use them.";
    return source.isDefault ? "Always shown." : "Added as an image source.";
  }

  function renderSources() {
    document.getElementById( "ce-images-sources" ).innerHTML = sources.map( function( source ) {
      return "<span><code>" + u.esc( source.pageName ) + "</code> " +
        ( source.isDefault ? "<small>default</small>" : "<button type='button' class='ce-link-btn' data-remove-source='" + u.esc( source.id ) + "'>Remove</button>" ) + "</span>";
    } ).join( "" );
  }

  function render() {
    renderSources();
    var q = document.getElementById( "ce-images-search" ).value.trim().toLowerCase();
    var groups = sources.map( function( source ) {
      return { source: source.pageName, title: ContentEditorApp.imageGroupTitle( source.pageName ), hint: groupHint( source ) };
    } ).concat( [ { source: "linked", title: "Linked images", hint: "Shown from their own sites; check you may use them." } ] );
    document.getElementById( "ce-images-groups" ).innerHTML = groups.map( function( group ) {
      var all = images.filter( function( i ) { return i.source === group.source && !i.archived; } );
      var shown = all.filter( function( i ) { return !q || i.name.toLowerCase().indexOf( q ) !== -1 || i.url.toLowerCase().indexOf( q ) !== -1; } );
      return "<h2 class='ce-view-subhead'>" + u.esc( group.title ) + " <small>(" + shown.length + ( shown.length === all.length ? "" : " of " + all.length ) + ")</small></h2>" +
        "<p class='ce-hint'>" + u.esc( group.hint ) + "</p>" +
        ( shown.length ? "<div class='ce-image-grid'>" + shown.map( function( image ) {
          return "<figure class='ce-image-tile'><img loading='lazy' alt='' src='" + u.esc( image.tile ) + "'/>" +
            "<figcaption title='" + u.esc( image.url ) + "'>" + u.esc( image.name ) + "</figcaption>" +
            "<div class='ce-tile-actions'><button type='button' class='ce-link-btn' data-copy='" + u.esc( image.url ) + "'>Copy address</button>" +
            ( image.source !== "linked" ? " <button type='button' class='ce-link-btn' data-details='" + u.esc( image.url ) + "'>Details</button>" : "" ) +
            ( image.source === "linked" ? " <button type='button' class='ce-link-btn' data-unlink='" + u.esc( image.id ) + "'>Remove</button>" : "" ) + "</div></figure>";
        } ).join( "" ) + "</div>" : "<div class='ce-empty'>" + ( all.length ? "No images match." : "None yet." ) + "</div>" );
    } ).join( "" );
  }

  // --- Image details, replace and remove (CON-T-023) ------------------------
  function kb( bytes ) { return bytes < 1024 ? bytes + " bytes" : ( bytes / 1024 ).toFixed( bytes < 10240 ? 1 : 0 ) + " KB"; }

  function usageList( usage ) {
    var rows = usage.pages.map( function( p ) {
      var where = [ p.draft ? "the draft" : "", p.published ? "the published page (" + p.publishedRevision + ")" : "" ].filter( Boolean ).join( " and " );
      return "<li>Page <strong>" + u.esc( p.title || p.publicPath ) + "</strong> <small>" + u.esc( p.publicPath ) + "</small> - " + u.esc( where ) + ( p.archived ? " <small>(archived)</small>" : "" ) + "</li>";
    } );
    [ [ "components", "component" ], [ "layouts", "layout" ], [ "styles", "site style icon" ] ].forEach( function( kind ) {
      usage[ kind[ 0 ] ].forEach( function( item ) {
        rows.push( "<li>The <strong>" + u.esc( item.name ) + "</strong> " + kind[ 1 ] + " <small>v" + u.esc( item.version ) + ( item.archived ? ", archived" : "" ) + "</small></li>" );
      } );
    } );
    return rows.length ? "<ul class='ce-usage-list'>" + rows.join( "" ) + "</ul>" : "<p class='ce-hint'>Not used by any Content Editor page, component, layout or the site style.</p>";
  }

  function renderDetails() {
    var box = document.getElementById( "ce-image-details" );
    if( !details ) { box.hidden = true; box.innerHTML = ""; return; }
    box.hidden = false;
    if( !details.data ) { box.innerHTML = "<p class='ce-app-loading'>Loading...</p>"; return; }
    var d = details.data, record = d.record;
    var facts = [
      [ "Address", "<code>" + u.esc( d.url ) + "</code>" ],
      [ "Type", u.esc( ( d.type || "not recognised" ).toUpperCase() ) ],
      [ "Size", d.width ? u.esc( d.width + " × " + d.height + " pixels" ) : "Not readable from the file" ],
      [ "File size", u.esc( kb( d.size ) ) ],
      [ "Checksum", "<code title='SHA-256 " + u.esc( d.sha256 ) + "'>SHA-256 " + u.esc( d.sha256.slice( 0, 16 ) ) + "…</code>" ],
      [ "Uploaded", record && record.uploadedBy ? u.esc( record.uploadedBy + ", " + record.uploadedAt.slice( 0, 16 ).replace( "T", " " ) ) : d.canChange ? "Not recorded (uploaded before details were kept)" : "Not recorded (not one of this site's uploads)" ],
      [ "Resized copies", d.variants.length ? u.esc( d.variants.join( ", " ) ) : "None" ]
    ];
    var history = record && record.history && record.history.length ? "<details class='ce-responsive'><summary>History</summary><ul class='ce-usage-list'>" + record.history.map( function( h ) {
      return "<li>" + u.esc( h.action ) + " by " + u.esc( h.by ) + ", " + u.esc( String( h.at ).slice( 0, 16 ).replace( "T", " " ) ) + ( h.keptAs ? " <small>(old file kept as " + u.esc( h.keptAs ) + ")</small>" : "" ) + "</li>";
    } ).join( "" ) + "</ul></details>" : "";
    var actions = "";
    if( d.canChange ) {
      var uses = d.usage.pages.length + d.usage.components.length + d.usage.layouts.length + d.usage.styles.length;
      actions = "<div class='ce-detail-actions'>" +
        "<form id='ce-image-replace' class='ce-name-form'><label class='ce-label' for='ce-image-replace-file'>Replace with</label>" +
        "<input id='ce-image-replace-file' type='file' accept='" + u.esc( { png: "image/png", jpg: "image/jpeg", gif: "image/gif", webp: "image/webp" }[ d.fileName.split( "." ).pop().toLowerCase().replace( "jpeg", "jpg" ) ] || "image/*" ) + "'/>" +
        "<button type='submit' class='ce-btn" + ( details.armed === "replace" ? " danger armed" : "" ) + "'>" + ( details.armed === "replace" ? "Sure? Replace it" : "Replace" ) + "</button>" +
        "<small>Keeps the address, so " + ( uses ? "everything listed above will show the new picture" : "any page that links to it shows the new picture" ) + ". The new file must be a " + u.esc( d.fileName.split( "." ).pop().toUpperCase() ) + "; the old one is kept aside.</small></form>" +
        ( d.blockedBy.length
          ? "<p class='ce-hint'><button type='button' class='ce-btn' disabled>Remove</button> Can't be removed while it is used by " + u.esc( d.blockedBy.join( ", " ) ) + ". Replace it, or take it out of those first.</p>"
          : "<p class='ce-hint'><button type='button' class='ce-btn danger" + ( details.armed === "remove" ? " armed" : "" ) + "' data-remove-image='1'>" + ( details.armed === "remove" ? "Sure? Remove it" : "Remove" ) + "</button> Nothing uses it. It is kept on the page under a new name, so it can be brought back.</p>" ) +
        "</div>";
    }
    box.innerHTML = "<div class='ce-detail-head'><img alt='' src='" + u.esc( d.url ) + "'/><div><h2>" + u.esc( d.fileName ) + "</h2>" +
      "<dl class='ce-facts'>" + facts.map( function( f ) { return "<dt>" + f[ 0 ] + "</dt><dd>" + f[ 1 ] + "</dd>"; } ).join( "" ) + "</dl></div>" +
      "<button type='button' class='ce-btn' data-close-details='1'>Close</button></div>" +
      "<h3 class='ce-view-subhead'>Where it is used</h3>" + usageList( d.usage ) +
      "<p class='ce-hint'>Pages made outside the Content Editor are not checked.</p>" + history + actions;
  }

  function openDetails( url ) {
    var slash = url.lastIndexOf( "/" );
    details = { url: url, data: null, armed: null };
    renderDetails();
    document.getElementById( "ce-image-details" ).scrollIntoView( { block: "start" } );
    u.readService( "imageDetails", { pageName: url.substring( 0, slash ), fileName: url.substring( slash + 1 ) } )
      .then( function( data ) { if( details && details.url === url ) { details.data = data; renderDetails(); } } )
      .catch( function( error ) { details = null; renderDetails(); u.toast( "" + error ); } );
  }

  function changeImage( request ) {
    var url = details.data.url;
    run( request, function() { openDetails( url ); } );
  }

  function run( request, after ) {
    if( busy ) return;
    busy = true;
    request
      .then( function( reply ) {
        if( reply.result !== "ok" ) throw reply.message;
        u.toast( reply.message + "." );
        load();
        if( after ) after( reply );
      } )
      .catch( function( error ) { u.toast( "" + error ); } )
      .then( function() { busy = false; } );
  }

  function upload( event ) {
    event.preventDefault();
    var input = document.getElementById( "ce-images-file" );
    var chosen = input.files && input.files[ 0 ];
    if( !chosen ) { u.toast( "Choose an image file first." ); return; }
    if( chosen.size > ContentEditorSiteLibrary.MAX_IMAGE_BYTES ) { u.toast( "Images can be at most 4MB." ); return; }
    var reader = new FileReader();
    reader.onload = function() {
      run( ContentEditorClient.uploadImage( chosen.name, reader.result ) );
      input.value = "";
    };
    reader.readAsDataURL( chosen );
  }

  function link( event ) {
    event.preventDefault();
    var url = document.getElementById( "ce-images-url" ).value.trim();
    run( ContentEditorClient.addLinkedImage( url, document.getElementById( "ce-images-name" ).value.trim() ) );
    document.getElementById( "ce-images-url" ).value = "";
    document.getElementById( "ce-images-name" ).value = "";
  }

  function addSource( event ) {
    event.preventDefault();
    var input = document.getElementById( "ce-images-source" );
    var page;
    try { page = ContentEditorSiteLibrary.imageSourcePage( input.value ); } catch( e ) { u.toast( "" + e ); return; }
    run( ContentEditorClient.addImageSource( page ) );
    input.value = "";
  }

  ContentEditorApp.registerView( "images", {
    init: function() {
      document.getElementById( "ce-images-search" ).addEventListener( "input", render );
      document.getElementById( "ce-images-upload" ).addEventListener( "submit", upload );
      document.getElementById( "ce-images-link" ).addEventListener( "submit", link );
      document.getElementById( "ce-images-add-source" ).addEventListener( "submit", addSource );
      document.getElementById( "ce-images-sources" ).addEventListener( "click", function( event ) {
        var button = event.target.closest( "[data-remove-source]" );
        if( button ) run( ContentEditorClient.removeImageSource( button.getAttribute( "data-remove-source" ) ) );
      } );
      document.getElementById( "ce-images-groups" ).addEventListener( "click", function( event ) {
        var button = event.target.closest( "button" );
        if( !button ) return;
        if( button.hasAttribute( "data-copy" ) ) {
          var url = button.getAttribute( "data-copy" );
          ( navigator.clipboard ? navigator.clipboard.writeText( url ) : Promise.reject() )
            .then( function() { u.toast( "Copied " + url ); }, function() { u.toast( url ); } );
        }
        if( button.hasAttribute( "data-unlink" ) ) run( ContentEditorClient.updateLinkedImage( button.getAttribute( "data-unlink" ), true ) );
        if( button.hasAttribute( "data-details" ) ) openDetails( button.getAttribute( "data-details" ) );
      } );
      var detailsBox = document.getElementById( "ce-image-details" );
      detailsBox.addEventListener( "click", function( event ) {
        if( event.target.closest( "[data-close-details]" ) ) { details = null; renderDetails(); return; }
        if( !event.target.closest( "[data-remove-image]" ) || !details || !details.data ) return;
        if( details.armed !== "remove" ) { details.armed = "remove"; renderDetails(); return; }
        var name = details.data.fileName;
        details.armed = null;
        run( ContentEditorClient.removeImage( name ), function() { details = null; renderDetails(); } );
      } );
      detailsBox.addEventListener( "submit", function( event ) {
        event.preventDefault();
        if( !details || !details.data ) return;
        var input = document.getElementById( "ce-image-replace-file" );
        var chosen = input.files && input.files[ 0 ];
        if( !chosen ) { u.toast( "Choose the new image file first." ); return; }
        if( chosen.size > ContentEditorSiteLibrary.MAX_IMAGE_BYTES ) { u.toast( "Images can be at most 4MB." ); return; }
        if( details.armed !== "replace" ) { details.armed = "replace"; renderDetails(); document.getElementById( "ce-image-replace-file" ).files = input.files; return; }
        details.armed = null;
        var reader = new FileReader();
        reader.onload = function() { changeImage( ContentEditorClient.replaceImage( details.data.fileName, reader.result ) ); };
        reader.readAsDataURL( chosen );
      } );
      load();
    },
    refresh: load
  } );
} )();

