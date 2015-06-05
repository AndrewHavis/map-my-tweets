var app = angular.module('app', []);

app.controller('MainCtrl', function($scope, $http) {
    
	$scope.title = 'Twitter User Search';
	$scope.test = 'Hello, World!';
    $scope.userResults = [];
    
    $scope.doUserSearch = function doUserSearch(userQuery, companyQuery) {
    $http.get('/api/confidence/' + userQuery + '/' + companyQuery)
    .success(function(response) {
        
        // Fetch the user information from the API
        $scope.userResults = response;
        $scope.title = 'Twitter User Search for ' + userQuery;
        
    })
    .error(function(error) {
        $scope.title = 'Twitter User Search';
        console.log('There was an error retrieving the user results from the API');
        console.log(error);
    });
    }
    
});