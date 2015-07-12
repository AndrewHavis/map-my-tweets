var app = angular.module('app', ['uiGmapgoogle-maps', 'ngEmbed']);

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
    
    // ngEmbed options
    $scope.options = {
      link             : true,      //convert links into anchor tags
      linkTarget       : '_blank',   //_blank|_self|_parent|_top|framename
      tweetEmbed       : true,
      tweetOptions     : {
          //The maximum width of a rendered Tweet in whole pixels. Must be between 220 and 550 inclusive.
          maxWidth  : 550,
          //When set to true or 1 links in a Tweet are not expanded to photo, video, or link previews.
          hideMedia : false,
          //When set to true or 1 a collapsed version of the previous Tweet in a conversation thread
          //will not be displayed when the requested Tweet is in reply to another Tweet.
          hideThread: true,
          //Specifies whether the embedded Tweet should be floated left, right, or center in
          //the page relative to the parent element.Valid values are left, right, center, and none.
          //Defaults to none, meaning no alignment styles are specified for the Tweet.
          align     : 'none',
          //Request returned HTML and a rendered Tweet in the specified.
          //Supported Languages listed here (https://dev.twitter.com/web/overview/languages)
          lang      : 'en'
      }
    };
    
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
           
    $http.get('/api/twitter/locations/')
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

            for (var i = 0; i < $scope.locationResults.length; i++) {
                mark = {}; // Reset our marker object
                mark.idKey = $scope.locationResults[i].idKey;
                mark.latitude = $scope.locationResults[i].geometry.coordinates[1];
                mark.longitude = $scope.locationResults[i].geometry.coordinates[0];
                mark.tweet = $scope.locationResults[i].tweet;
                mark.url = 'http://twitter.com/' + $scope.userHandle + '/status/' + $scope.locationResults[i].idKey;
                $scope.locations.push(mark);
            }

            // Populate the map with our geotagged tweets
            $scope.map.markers = $scope.locations;
        }
            
    })
    .error(function(error) {
        $scope.title = 'Map My Tweets';
        console.log('There was an error retrieving the location results from the API');
        console.log(error);
    });
});