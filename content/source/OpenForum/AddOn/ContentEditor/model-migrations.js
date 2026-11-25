/*
* ContentEditorMigrations
* Explicit, versioned schema migration infrastructure (section 8.1, section
* 17.1). Every schema change registers a numbered step here rather than
* being handled ad hoc in load code.
*/
var ContentEditorMigrations = (function() {

  var CURRENT_VERSION = 3;

  // steps[N] migrates a page from schemaVersion N to N+1 and returns the
  // updated page with schemaVersion set to N+1.
  var steps = {
    // CON-T-038: templated pages. An existing page becomes a free-form page
    // with no template or theme pinned; its elements are left untouched,
    // so it renders exactly as before.
    1: function(page) {
      if (page.template === undefined) page.template = null;
      if (page.theme === undefined) page.theme = null;
      if (page.metadata === undefined) page.metadata = {};
      page.schemaVersion = 2;
      return page;
    },
    // CON-T-044: every page publishes into a layout. Existing pages get the
    // site's default template by link, which is how they were published
    // before.
    2: function(page) {
      if (page.layout === undefined) page.layout = { id: null, version: null, templateMode: "link" };
      page.schemaVersion = 3;
      return page;
    }
  };

  function migrate(pageData) {
    var version = pageData.schemaVersion || 0;
    while (version < CURRENT_VERSION) {
      var step = steps[version];
      if (!step) {
        throw "No migration registered from schema version " + version + " to " + (version + 1);
      }
      pageData = step(pageData);
      version = pageData.schemaVersion;
    }
    return pageData;
  }

  var api = {
    CURRENT_VERSION: CURRENT_VERSION,
    steps: steps,
    migrate: migrate
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ContentEditorMigrations = api;
  return api;
})();
