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
    $scope.userResults = [];
    
    $scope.doUserSearch = function doUserSearch(userQuery) {
           
    $http.get('/api/twitter/users/' + userQuery)
    .success(function(response) {
        
        // Fetch the user information from the API
        $scope.userResults = response;
        $scope.userId = response[0].id; // Get the user ID
        $scope.title = 'Tweet Map for ' + userQuery;
        
        // Initialise our Google map
        $scope.map = { 
            center: { 
                latitude: 0, 
                longitude: 0 
            }, 
            zoom: 2,
            markers: [],
            markersEvents: {
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
        $scope.locations = [];
        
        // Now let's get the user's tweets
        $http.get('/api/twitter/users/' + $scope.userId + '/tweets')
        .success(function(res) {
            
            $scope.tweets = res;
            $scope.showWindow = false;
            
            var item = {};
            
            for (var i = 0; i < res.length; i++) {
                // Now let's get our Google Map, and populate it with geotagged tweets
                if (res[i].geo !== null) {
                    item = {}; // Reset our item object
                    item.idKey = res[i].id;
                    item.latitude = res[i].geo.coordinates[0];
                    item.longitude = res[i].geo.coordinates[1];
                    item.tweet = res[i].text;
                    $scope.locations.push(item);
                }
                else if (res[i].place !== null) {
                    item = {}; // Reset our item object
                    item.idKey = res[i].id;
                    item.latitude = res[i].place.bounding_box.coordinates[0][0][1];
                    item.longitude = res[i].place.bounding_box.coordinates[0][0][0];
                    item.tweet = res[i].text;
                    $scope.locations.push(item);
                }
            }
            
            $scope.map.markers = $scope.locations;
            
        });
    })
    .error(function(error) {
        $scope.title = 'Map My Tweets';
        console.log('There was an error retrieving the user results from the API');
        console.log(error);
    });
    }
});