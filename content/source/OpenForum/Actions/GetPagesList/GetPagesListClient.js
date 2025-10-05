var GetPagesListClient = function(host) {
    var self = this;
    self.VERSION = "0.0.0";
    if(!host) host = "";

// get methods

    self.getChildPages = function( pageName, callBack ) {
      OFX.get( host+'/OpenForum/Actions/GetPagesList' )
        .withAction( 'getChildPages' )
        .withData( {pageName: pageName} )
        .onSuccess( callBack ).go();
    };



// End get methods

};
GetPagesListClient = new GetPagesListClient();

