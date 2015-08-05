var app = angular.module('app', ['uiGmapgoogle-maps', 'ngSanitize']);

app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
});

app.controller('MainCtrl', function($scope, $http, $q, apiService) {
    
	$scope.title = 'Map My Tweets';
	$scope.test = 'Hello, World!';
    
    // Get results from our API service
    $scope.profileJSON = apiService.getProfile();
    $scope.locationJSON = apiService.getLocations();
    $scope.embeds = [];
    
    // Set our title
    $scope.profileJSON.then(function(profile) {
        console.log(profile);
        $scope.title = 'Tweet Map for ' + profile.data.name;
    });
    
    // Get our embed HTML
    $scope.locationJSON.then(function(locations) {
        console.log(locations);
        $scope.locations = [];
        $scope.userId = locations.data[0].user.id; // Get the user ID
        $scope.userName = locations.data[0].user.name; // Get the user name
        $scope.userHandle = locations.data[0].user.handle; // Get the user handle

        // Initialise our Google map
        $scope.map = {
            center: {
                latitude: 0,
                longitude: 0
            },
            zoom: 2, // Zoom out enough so that the whole world is visible
            markers: [],
            markersEvents: { // Define the 'bubble' that appears when a map marker is clicked
                click: function(marker, eventName, model, arguments) {
                    console.log(marker);
                    console.log(eventName);
                    console.log(model);
                    console.log(arguments);
                    $scope.map.window.model = model;
                    $scope.map.window.show = true;
                }
            },
            window: {
                marker: {},
                show: false,
                closeClick: function() {
                    this.show = false;
                },
                options: {} // define when map is ready
            }
        };

        // Collate the information for our map markers
        var mark = {}; // Initialise our marker object

        for (loc in locations.data) {
            console.log(locations.data[loc]);
            apiService.getEmbedHTML(locations.data[loc].idKey).then(function(embed) {
                // Get the tweet, and its ID, latitude and longitude
                mark = {}; // Reset our marker object
                mark.idKey = locations.data[loc].idKey;
                mark.latitude = locations.data[loc].geometry.coordinates[1];
                mark.longitude = locations.data[loc].geometry.coordinates[0];
                mark.tweet = locations.data[loc].tweet;
                mark.embedHTML = embed.data.html;
                console.log(mark);
                $scope.embeds.push(mark);
            });
        }

        // Populate the map with our geotagged tweets
        $scope.map.markers = $scope.embeds;
    });
});

app.factory('apiService', function($http, $q) {
    return {
        getProfile: function() {
            var promise = $http.get('/api/twitter/profile/');
            return $q.when(promise);
        },
        getLocations: function() {
            var promise = $http.get('/api/twitter/locations/');
            return $q.when(promise);
        },
        getEmbedHTML: function(tweetId) {
            var promise = $http.get('/api/twitter/tweet/' + tweetId + '/embed');
            return $q.when(promise);
        }
    }
});
