/*
* ContentEditorStyleTokens
* Site design-token set for the style/layout inspector controls (CON-T-017,
* FR-STYLE-003/004) plus explicit per-breakpoint override storage
* (CON-T-018, FR-STYLE-005). Deliberately a small closed set of named
* tokens rather than freeform CSS - see section 4.5 ("safe constraints over
* unlimited freedom") and FR-STYLE-006 ("invalid CSS values must never
* reach publication output"): resolve() only ever returns a real CSS value
* for a token that appears in TOKEN_SETS, so an unrecognised or tampered
* value can never make it into rendered output. The initial token values
* and breakpoint widths are exactly the kind of decision section 20 flags
* as "still to be made" - picked here as reasonable MVP defaults, not a
* fixed design-system import.
*/
var ContentEditorStyleTokens = (function() {

  var TOKEN_SETS = {
    background: [
      { value: "subtle", label: "Subtle grey", css: "#f4f4f4" },
      { value: "brand", label: "Brand blue", css: "#2ba6cb" },
      { value: "dark", label: "Dark", css: "#1a1a1a" }
    ],
    spacing: [
      { value: "space-1", label: "Extra small (4px)", css: "4px" },
      { value: "space-2", label: "Small (8px)", css: "8px" },
      { value: "space-3", label: "Medium (12px)", css: "12px" },
      { value: "space-4", label: "Large (16px)", css: "16px" },
      { value: "space-6", label: "Extra large (24px)", css: "24px" },
      { value: "space-8", label: "Huge (32px)", css: "32px" }
    ],
    size: [
      { value: "narrow", label: "Narrow (480px)", css: "480px" },
      { value: "content", label: "Content (720px)", css: "720px" },
      { value: "wide", label: "Wide (960px)", css: "960px" },
      { value: "full", label: "Full width (100%)", css: "100%" }
    ],
    alignment: [
      { value: "left", label: "Left", css: "left" },
      { value: "center", label: "Center", css: "center" },
      { value: "right", label: "Right", css: "right" }
    ]
  };

  // Which token set each style-control key (as declared in an element
  // definition's styleControls array, ContentEditorElementDefinitions)
  // draws its options from.
  var CONTROL_TOKEN_SET = {
    background: "background",
    spacingTop: "spacing",
    spacingBottom: "spacing",
    maxWidth: "size",
    width: "size",
    alignment: "alignment"
  };

  // CON-T-018: explicit breakpoint set (FR-STYLE-005). "base" applies with
  // no media query (desktop-and-up); tablet/phone are progressively
  // narrower max-width overrides, matching the phone/tablet/desktop
  // language already used for the not-yet-built preview widths (FR-PREV-001).
  var BREAKPOINTS = [ "base", "tablet", "phone" ];
  var BREAKPOINT_MEDIA = {
    tablet: "(max-width: 900px)",
    phone: "(max-width: 480px)"
  };

  function optionsFor( controlKey ) {
    var setName = CONTROL_TOKEN_SET[ controlKey ];
    return setName ? TOKEN_SETS[ setName ] : [];
  }

  // Resolves a token value to its real CSS value, or null if the token is
  // empty/unrecognised - the one place an invalid or forged token gets
  // dropped rather than passed through (FR-STYLE-006).
  function resolve( controlKey, tokenValue ) {
    if( !tokenValue ) return null;
    var options = optionsFor( controlKey );
    for( var i = 0; i < options.length; i++ ) {
      if( options[ i ].value === tokenValue ) return options[ i ].css;
    }
    return null;
  }

  function isValidToken( controlKey, tokenValue ) {
    if( !tokenValue ) return true; // empty = "use default", always valid
    return resolve( controlKey, tokenValue ) !== null;
  }

  // A style control's stored value can be a plain token string (base only -
  // the CON-T-017 shape) or an explicit per-breakpoint object (the CON-T-018
  // shape: {base, tablet, phone}, any of which may be absent/empty to mean
  // "inherit the next wider breakpoint's value"). These two helpers hide
  // that shape from every caller.
  function getStyleValueAt( styleValue, breakpoint ) {
    if( styleValue == null ) return "";
    if( typeof styleValue === "string" ) return breakpoint === "base" ? styleValue : "";
    return styleValue[ breakpoint ] || "";
  }

  function withStyleValueAt( styleValue, breakpoint, newValue ) {
    var normalized = {};
    if( styleValue && typeof styleValue === "object" ) {
      for( var key in styleValue ) normalized[ key ] = styleValue[ key ];
    } else if( typeof styleValue === "string" && styleValue ) {
      normalized.base = styleValue;
    }
    normalized[ breakpoint ] = newValue;
    return normalized;
  }

  var api = {
    TOKEN_SETS: TOKEN_SETS,
    CONTROL_TOKEN_SET: CONTROL_TOKEN_SET,
    BREAKPOINTS: BREAKPOINTS,
    BREAKPOINT_MEDIA: BREAKPOINT_MEDIA,
    optionsFor: optionsFor,
    resolve: resolve,
    isValidToken: isValidToken,
    getStyleValueAt: getStyleValueAt,
    withStyleValueAt: withStyleValueAt
  };

  if( typeof module !== "undefined" && module.exports ) module.exports = api;
  if( typeof window !== "undefined" ) window.ContentEditorStyleTokens = api;
  return api;
})();
