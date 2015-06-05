var app = angular.module('app', []);

app.controller('MainCtrl', function($scope, $http) {
    
	$scope.title = 'Twitter User Search';
	$scope.test = 'Hello, World!';
    $scope.userResults = [];
    $scope.companyResults = [];
    
    $scope.doUserSearch = function doUserSearch(userQuery, companyQuery) {
    $http.get('/api/twitter/users/' + userQuery)
    .success(function(response) {
        
        // Fetch the user information from the API
        $scope.userResults = response;
        $scope.title = 'Twitter User Search for ' + userQuery;
        
        // Add in the confidence level
        $scope.userResults.confidence = 0;
        
        // Now fetch information for the company that the user has specified
        // Do a user search for our company name, and return the first user's ID number
        $http.get('/api/twitter/users/' + companyQuery)
        .success(function(response) {
            var companyTwitterId = 0;
            var firstUser = response[0];
            companyTwitterId = firstUser.id;
            
            // Get the lists owned by that user
            $http.get('/api/twitter/users/' + companyTwitterId + '/lists')
            .success(function(response) {

                $scope.listsResults = response.lists;

                // Now we have our lists, search through them for the specified user
                for (list in $scope.listsResults) {

                    // Get the list details
                    var listId = $scope.listsResults[list].id;
                    $http.get('/api/twitter/lists/' + listId)
                    .success(function(response) {

                        $scope.listMemberResults = response.users;

                        // Now loop through our user results
                        // If they are on the list (that is, if their user ID is found), add one to the confidence level for that user
                        for (user in $scope.userResults) {
                            $http.get('/api/twitter/lists/' + listId + '/users/' + $scope.userResults[user].id)
                            .success(function(response) {
                                if (!!response) {
                                    user.confidence = user.confidence + 1;
                                }
                            })
                            .error(function(error) {
                                console.log('There was an error with the API when checking whether the user with ID ' + user.id + ' exists in the list with ID ' + listId);
                                console.log(error);
                            })
                        }

                    })
                    .error(function(error) {
                        console.log('There was an error with the API when searching for the list with ID ' + listId);
                        console.log(error); 
                    })

                }

            })
            .error(function(error) {
                console.log('There was an error with the API when getting information for the user with ID ' + companyTwitterId);
                console.log(error);
            })

            })
            .error(function(error) {
                console.log('There was an error with the API when getting information for the first user with ID ' + query);
                console.log(error);
            });
        
    })
    .error(function(error) {
        $scope.title = 'Twitter User Search';
        console.log('There was an error retrieving the user results from the API');
        console.log(error);
    });
    }
    
});