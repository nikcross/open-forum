var searchResult = "----";
var filteredResults = "----";

OpenForum.init = function() {
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var mapOptions = {
      zoom: 8,
      center: latlng
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
};

function doSearch() {
  geocoder.geocode( { 'address': query,'componentRestrictions': {country: 'UK'}}, function(results, status) {
    
    searchResult = JSON.stringify(results,null,4); //.replace(/,/g,",<br/>");
    if (status == google.maps.GeocoderStatus.OK) {
      
      filterResults(results);
      
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function filterResults(results) {
  var filteredResultsData = {query: query, count: 0, matchesCount: 0, matches: []};
  filteredResultsData.count = results.length;
  for(var resultIndex in results) {
    var result = results[resultIndex];
    
    if(result.types.indexOf("locality")!=-1 || result.types.indexOf("postal_code")!=-1 ) {
      filteredResultsData.matches.push({location: {latitude: result.geometry.location.A,longitude: result.geometry.location.F}});
    }
  }
  filteredResultsData.matchesCount = filteredResultsData.matches.length;
  
  filteredResults = JSON.stringify(filteredResultsData);
}