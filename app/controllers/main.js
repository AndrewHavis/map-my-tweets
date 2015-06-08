var app = angular.module('app', []);

app.controller('MainCtrl', function($scope, $http) {
    
	$scope.title = 'Twitter User Search';
	$scope.test = 'Hello, World!';
    $scope.userResults = [];
    
    $scope.doUserSearch = function doUserSearch(userQuery, companyQuery) {
        
    // If this is just a user search (i.e. no company has been specified), set the company query to an empty string
    if (companyQuery === undefined) {
        companyQuery = '';
    }
           
    $http.get('/api/twitter/users/' + userQuery + '/' + companyQuery)
    .success(function(response) {
        // Fetch the user information from the API
        $scope.userResults = response;
        if (companyQuery === '') {
            // If no company was specified, set the confidence level to -1 (actually a neutral level)
            $scope.userResults.confidence = -1;
        }
        $scope.title = 'Twitter User Search for ' + userQuery;
        
    })
    .error(function(error) {
        $scope.title = 'Twitter User Search';
        console.log('There was an error retrieving the user results from the API');
        console.log(error);
    });
    }
    
});