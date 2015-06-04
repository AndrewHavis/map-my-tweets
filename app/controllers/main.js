var app = angular.module('app', []);

app.controller('MainCtrl', function($scope, $http) {
    
	$scope.title = 'Twitter User Search';
	$scope.test = 'Hello, World!';
    $scope.userResults = [];
    
    $scope.doUserSearch = function doUserSearch(query) {
    $http.get('/api/twitter/users/' + query)
    .success(function(response) {
        $scope.userResults = response;
        $scope.title = 'Twitter User Search for ' + query;
        console.log($scope.userResults);
    })
    .error(function(error) {
        $scope.title = 'Twitter User Search';
        console.log('There was an error retrieving the data from the API');
        console.log(error);
    });
    }
    
});