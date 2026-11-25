OpenForum.bind = function( a, b) {
  if(typeof b == "function") {
    b( OpenForum.getObject( a ).getValue() );
    OpenForum.getObject( a ).addListener( function(value) {
      b( value.getValue() );
    } );
  } else {
    OpenForum.getObject( b ).setValue( OpenForum.getObject( a ).getValue() );
    OpenForum.getObject( a ).addListener( function(value) {
      OpenForum.getObject( b ).setValue( value.getValue() );
    } ); 
  }
};