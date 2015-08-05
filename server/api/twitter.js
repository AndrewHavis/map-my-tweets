/* jshint node:true */

/*
 * @name twitter.js
 * @dev Andrew Havis
 * @description This controller is used to fetch data from Twitter using the service's API
 */

// Import the Twitter module
var Twitter = require('twitter');

// Import our API controller
var api = require('../controllers/api.ctrl.js');

var twitter = Twitter({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token_key: process.env.access_token_key,
    access_token_secret: process.env.access_token_secret
});
         

// Run a user search
module.exports.userSearch = function(userId, callback) {
    twitter.get('users/show', {user_id: userId}, function(err, user, res) {
        console.log(userId);
        if (!!err) {
            return callback(null, new Error('An error occurred when doing the user search\n' + JSON.stringify(err)));
        }
        else {
            var userObj = JSON.parse(JSON.stringify(user));
            console.log(userObj);
            return callback(userObj);
        }
    });
}

module.exports.getUserId = function(query, callback) {
    twitter.get('users/search', {q: query}, function(err, users, res) {
        if (!!err) {
            return callback(null, new Error('An error occurred when finding the user ID\n' + JSON.stringify(err)));
        }
        else {
            var userId = users[0].id;
            return callback(userId);
        }
    });
}

module.exports.getTweet = function(tweetId, callback) {
    twitter.get('statuses/show', {id: tweetId}, function(err, tweet, res) {
        if (!!err) {
            return callback(null, new Error('An error occurred when getting the tweet\n' + JSON.stringify(err)));
        }
        else {
            var tweetObj = JSON.parse(JSON.stringify(tweet));
            return callback(tweetObj);
        }
    });
}

// Get a user's tweets
module.exports.getTweets = function(userId, callback) {
    twitter.get('statuses/user_timeline', {user_id: userId, count: 200, include_rts: 1}, function(err, tweets, res) {
        if (!!err) {
            return callback(null, new Error('An error occurred when retrieving tweets\n' + JSON.stringify(err)));
        }
        else {
            var tweetsObj = JSON.parse(JSON.stringify(tweets));
            return callback(tweetsObj);
        }
    })
}

// Get a particular tweet, by ID
module.exports.getTweet = function(tweetId, callback) {
    twitter.get('statuses/show', {id: tweetId}, function(err, tweet, res) {
        if (!!err) {
            return callback(null, new Error('An error occurred when retrieving the tweet\n' + JSON.stringify(err)));
        }
        else {
            var tweetObj = JSON.parse(JSON.stringify(tweet));
            return callback(tweetObj);
        }
    })
}

// Get tweet location
module.exports.getLocations = function(userId, callback) {
    twitter.get('statuses/user_timeline', {user_id: userId, count: 200, include_rts: 1}, function(err, tweets, res) {
        if (!!err) {
            return callback(null, new Error('An error occurred when getting tweet locations\n' + JSON.stringify(err)));
        }
        else {
            var geoJSON = [];
            for (t in tweets) {
                var tweetObj = JSON.parse(JSON.stringify(tweets[t]));

                // To get the location, we'll pull the 'geo' property
                // If the property is null (i.e. the tweet isn't geotagged), return null
                if (tweetObj.geo !== null) {

                    // To make things easier, we'll use the GeoJSON formatting
                    // Note that for some unknown reason, Twitter reverses the latitude and longitude
                    // We will correct this here
                    var geoObj = {};
                    geoObj.idKey = tweetObj.id_str; // Use id_str to get the *actual* tweet ID
                    geoObj.tweet = tweetObj.text;
                    geoObj.user = {};
                    geoObj.user.id = tweetObj.user.id;
                    geoObj.user.name = tweetObj.user.name;
                    geoObj.user.handle = tweetObj.user.screen_name;
                    geoObj.type = "Point";
                    geoObj.geometry = {};
                    geoObj.geometry.type = "Point";
                    geoObj.geometry.coordinates = tweetObj.geo.coordinates.reverse();
                    geoJSON.push(geoObj);
                
                }
            
                else if (tweetObj.place !== null) {

                    // Try the 'place' object
                    // Note that if we have a polygon or bounding box, we will take the first set of coordinates
                    var geoObj = {};
                    geoObj.idKey = tweetObj.id_str; // Use id_str to get the *actual* tweet ID
                    geoObj.tweet = tweetObj.text;
                    geoObj.user = {};
                    geoObj.user.id = tweetObj.user.id;
                    geoObj.user.name = tweetObj.user.name;
                    geoObj.user.handle = tweetObj.user.screen_name;
                    geoObj.type = "Point";
                    geoObj.geometry = {};
                    geoObj.geometry.type = "Point";
                    if (tweetObj.place.bounding_box.type === "Polygon") {
                        geoObj.geometry.coordinates = tweetObj.place.bounding_box.coordinates[0][0];
                    }
                    else {
                        geoObj.geometry.coordinates = tweetObj.place.bounding_box.coordinates;
                    }
                    geoJSON.push(geoObj);
                    
                }

            }
            
            // Return the GeoJSON
            return callback(geoJSON);
        
        }
    })
}

// Get the embed code for a tweet
module.exports.getEmbedCode = function(tweetId, callback) {
    twitter.get('statuses/oembed', {id: tweetId, omit_script: true}, function(err, embedCode, res) {
        if (!!err) {
            return callback(null, new Error('An error occurred when retrieving the tweet embed code\n' + JSON.stringify(err)));
        }
        else {
            var embedObj = JSON.parse(JSON.stringify(embedCode));
            return callback(embedObj);
        }
    })
}

