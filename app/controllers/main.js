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
        for (loc in locations.data) {
            console.log(locations.data[loc]);
            var embedItem = apiService.getEmbedHTML(locations.data[loc].idKey);
            $q.all([$scope.locationJSON, embedItem]).then(function(results) {
                console.log(results[1].data);
                $scope.embeds[loc] = results[1].data.html;
            });
        }
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
