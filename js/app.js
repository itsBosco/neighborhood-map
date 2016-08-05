/*jshint loopfunc: true */
var map, bounds, InfoWindow, locations;
var markers = [];


//VIEWMODEL
function AppViewModel(locations) {
    var self = this;

    self.createMarkers = function(locations) {
        createMarkers(locations);
    };

    self.createMarkers(locations);

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
            return markers;
        } else {
            return ko.utils.arrayFilter(locations, function(location) {
                // if (ko.utils.stringStartsWith(location.title.toLowerCase(), filter)) {
                //     clearMarkers();
                //     markers.push(marker);
                //     console.log(markers);
                //     createMarkers(locations);
                // }
                return ko.utils.stringStartsWith(location.title.toLowerCase(), filter);
            });
        }

    });
}

//Init Google Map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 37.7749,
            lng: -122.4194
        },
        zoom: 12
    });
    InfoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();


    //hardcoded locations
    var locations = [{
        title: "Golden Gate Bridge",
        location: {
            lat: 37.8199,
            lng: -122.4783
        }
    }, {
        title: "Union Square",
        location: {
            lat: 37.7880,
            lng: -122.4074
        }
    }, {
        title: "Chinatown",
        location: {
            lat: 37.7941,
            lng: -122.4078
        }
    }, {
        title: "AT&T Park",
        location: {
            lat: 37.7786,
            lng: -122.3893
        }
    }, {
        title: "Cable Car System",
        location: {
            lat: 37.7907,
            lng: -122.4188
        }
    }, ];

    ko.applyBindings(new AppViewModel(locations));
}

//Creates markers based of locations array
var createMarkers = function(locations) {
    for (i = 0; i < locations.length; i++) {
        var marker = new google.maps.Marker({
            position: {
                lat: locations[i].location.lat,
                lng: locations[i].location.lng
            },
            map: map,
            title: locations[i].title,
            animation: google.maps.Animation.DROP,

            populateInfoWindow: populateInfoWindow,

            //bounce animation for marker
            toggleBounce: function() {
                if (this.getAnimation() !== null) {
                    this.setAnimation(null);
                } else {
                    this.setAnimation(google.maps.Animation.BOUNCE);
                }
            }

        });
        markers.push(marker);
        marker.addListener('click', function() {
            //populateInfoWindow(this, InfoWindow);
            this.toggleBounce();
            this.populateInfoWindow(this, InfoWindow);
        });
        bounds.extend(markers[i].position);
    }
};

//Infowindow for markers
function populateInfoWindow(marker, infowindow) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
}

//Infowindow for markers
function populateInfoWindow(marker, infowindow) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    //stops bouncing when user closes infowindow
    infowindow.addListener('closeclick', function() {
        marker.setAnimation(null);
    });
}

//Handles map not loading error
function mapError() {
    alert('Failed to load map');
}

//Checks if a certain string starts with a certain character(had to add this here for it to work)
ko.utils.stringStartsWith = function(string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};
