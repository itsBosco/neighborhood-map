/*jshint loopfunc: true */
var map, bounds, InfoWindow, locations;
var flickr_api_key = 'c409285ba83e15950d72eddb6f85a5ec';
var markers = [];
//hardcoded locations
var locations = [{
    title: "World of Coca-Cola",
    position: {
        lat: 33.7628,
        lng: -84.3928
    }
}, {
    title: "Centennial Olympic Park",
    position: {
        lat: 33.7608,
        lng: -84.3931
    }
}, {
    title: "Six Flags",
    position: {
        lat: 33.7681,
        lng: -84.5513
    }
}, {
    title: "Fox Theatre",
    position: {
        lat: 33.7726,
        lng: -84.3856
    }
}, {
    title: "Turner Field",
    position: {
        lat: 33.7348,
        lng: -84.3900
    }
}, {
    title: "Philips Arena",
    position: {
        lat: 33.7573,
        lng: -84.3963
    }
}, {
    title: "Georgia Dome",
    position: {
        lat: 33.7577,
        lng: -84.4008
    }
}, {
    title: "Zoo Atlanta",
    position: {
        lat: 33.7322,
        lng: -84.3713
    }
}];


//VIEWMODEL
function AppViewModel(locations) {
    var self = this;

    self.markers = ko.observableArray(markers);

    //called when list item is cliked
    self.populateInfoWindow = function() {
        populateInfoWindow(this, InfoWindow);
        this.toggleBounce();
    };

    self.filter = ko.observable("");

    //Takes items from the markers array and filters them based of the text in the filter
    self.filteredItems = ko.dependentObservable(function() {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            //makes sure markers are empty
            deleteMarkers();
            //creates markers for each location
            for (i = 0; i < locations.length; i++) {
                addMarker(locations[i]);
            }
            return markers;
        } else {
            return ko.utils.arrayFilter(markers, function(marker) {
                if (ko.utils.stringStartsWith(marker.title.toLowerCase(), filter)) {
                    //clears markers
                    deleteMarkers();
                    //adds the filtered marker
                    markers.push(marker);
                    showMarkers();
                    return marker;
                }
            });
        }

    });
} //end of viewmodel

//Init Google Map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 33.7490,
            lng: -84.3880
        },
        zoom: 14
    });
    InfoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();

    ko.applyBindings(new AppViewModel(locations));
}

// Adds a marker to the map and push to the array.
function addMarker(location) {
    var marker = new google.maps.Marker({
        position: {
            lat: location.position.lat,
            lng: location.position.lng
        },
        map: map,
        title: location.title,
        animation: google.maps.Animation.DROP,
        populateInfoWindow: populateInfoWindow,
        image: '',
        //gets flikr image
        getImage: function() {
            var marker = this;
            $.ajax({
                url: ' https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' +
                    flickr_api_key + '&per_page=50&radius=0.1&lat=' + location.position.lat +
                    '&lon=' + location.position.lng + '&format=json&nojsoncallback=1',
                dataType: 'json',

                success: function jsonFlickrApi(response) {
                    var photoData = response.photos.photo[0];
                    var farm = photoData.farm;
                    var photoID = photoData.id;
                    var secretID = photoData.secret;
                    var server = photoData.server;
                    //sets marker image as the results from the flickr api
                    setImage(marker, '<img src=https://farm' + farm + '.staticflickr.com/' +
                        server + '/' + photoID + '_' + secretID + '.jpg');
                },

                error: function(e) {
                    setImage(marker, '<h1>Failed to get image</h1>');
                }
            });

        },
        //changes marker to bouncing when it is clicked
        toggleBounce: function() {
            //makes sure that more than one marker is bouncing at a time
            markers.forEach(function(marker) {
                marker.setAnimation(null);
            });
            //checks if current marker is already bouncing
            if (this.getAnimation() !== null) {
                this.setAnimation(null);
            } else {
                this.setAnimation(google.maps.Animation.BOUNCE);
            }
        },
    });
    marker.getImage();
    marker.addListener('click', function() {
        this.toggleBounce();
        this.populateInfoWindow(this, InfoWindow);
    });
    markers.push(marker);
    bounds.extend(marker.position);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}

//Infowindow for markers
function populateInfoWindow(marker, infowindow) {
    infowindow.marker = marker;
    infowindow.setContent('<div class="infowindow">' + '<h1>' + marker.title + '</h1>' + '<br>' + marker.image + '<br>' + '<p>Recent flickr upload of ' + marker.title + '</p>' + '</div>');
    infowindow.open(map, marker);
    //stops bouncing when user closes infowindow
    infowindow.addListener('closeclick', function() {
        marker.setAnimation(null);
    });
}

//Handles map not loading error
function mapError() {
    'use strict';
    alert('Failed to load map');
}

//sets the given markers image to the image url from the flickr api
function setImage(marker, image) {
    marker.image = image;
    return image;
}

//Checks if a certain string starts with a certain character(had to add this here for it to work)
ko.utils.stringStartsWith = function(string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};
