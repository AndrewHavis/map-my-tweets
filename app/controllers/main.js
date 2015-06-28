function onGoogleReady() {
    console.log('Google Maps API initialised');
    angular.bootstrap(document.getElementById("map"), ['app']);
}

var app = angular.module('app', []);

app.controller('MainCtrl', function($scope, $http) {
    
	$scope.title = 'Map My Tweets';
	$scope.test = 'Hello, World!';
    $scope.userResults = [];
    
    $scope.doUserSearch = function doUserSearch(userQuery) {
           
    $http.get('/api/twitter/users/' + userQuery)
    .success(function(response) {
        // Fetch the user information from the API
        $scope.userResults = response;
        $scope.title = 'Tweet Map for ' + userQuery;
        
    })
    .error(function(error) {
        $scope.title = 'Map My Tweets';
        console.log('There was an error retrieving the user results from the API');
        console.log(error);
    });
    } 
});

app.controller('MapCtrl', ['$scope', 'ui.map', function ($scope) {
    $scope.mapOptions = {
      center: new google.maps.LatLng(35.784, -78.670),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
}]);