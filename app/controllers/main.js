var app = angular.module('app', ['uiGmapgoogle-maps']);

app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
});

app.controller('MainCtrl', function($scope, $http) {
    
	$scope.title = 'Map My Tweets';
	$scope.test = 'Hello, World!';
    
    $http.get('/api/twitter/profile/')
    .success(function(response) {
        $scope.profileJSON = response;
        $scope.title = 'Tweet Map for ' + response[0].name; // Put together our page title
    })
    .error(function(error) {
        $scope.title = 'Map My Tweets';
        console.log('There was an error retrieving the user results from the API');
        console.log(error);
    });
           
    // Twitter returns up to 3,200 of a user's most recent tweets, from pages 1 to 17
    for (var i = 1; i <= 17; i++) {
        $http.get('/api/twitter/locations/' + i)
        .success(function(response) {


            // Fetch the user information from the API if we have anything
            if (response.length > 0) {    
                $scope.locationResults = response;
                $scope.locations = [];
                $scope.userId = response[0].user.id; // Get the user ID
                $scope.userName = response[0].user.name; // Get the user name
                $scope.userHandle = response[0].user.handle; // Get the user handle


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
                var mark = {};

                for (var j = 0; j < $scope.locationResults.length; j++) {
                    mark = {}; // Reset our marker object
                    mark.idKey = $scope.locationResults[j].idKey;
                    mark.latitude = $scope.locationResults[j].geometry.coordinates[1];
                    mark.longitude = $scope.locationResults[j].geometry.coordinates[0];
                    mark.tweet = $scope.locationResults[j].tweet;
                    $scope.locations.push(mark);
                }
            }
            
            console.log($scope.locations);

            // Populate the map with our geotagged tweets
            $scope.map.markers = $scope.locations;
        })
        .error(function(error) {
            $scope.title = 'Map My Tweets';
            console.log('There was an error retrieving the location results from the API');
            console.log(error);
        });
    }
});