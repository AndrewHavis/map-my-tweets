var app = angular.module('app', []);

app.controller('MainCtrl', function($scope, $http) {
    
	$scope.title = 'New Project';
	$scope.test = 'Hello, World!';
    $scope.apiData = [];
    
    $http.get('/api/cloudant')
    .success(function(response) {
        $scope.apiData = response.rows;
        console.log($scope.feedData);
    })
    .error(function(error) {
        console.log('There was an error retrieving the data from the Cloudant API');
        console.log(error);
    });
	
});