/* jshint node:true */

/*
 * @name twitter.js
 * @dev Andrew Havis
 * @description This controller is used to fetch data from Twitter using the service's API
 */

// Import the Twitter module
var Twitter = require('twitter');

// Import Cloudant
var cloudant = require('./cloudant');

// Import our API controller
var api = require('../controllers/api.ctrl.js');

var twitter = Twitter({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token_key: process.env.access_token_key,
    access_token_secret: process.env.access_token_secret
});

module.exports.confidenceSearch = function(userQuery, companyQuery, callback) {

    // Search for the user and company, and determine a confidence level of whether the user is associated with that company
    
    // Do a user search, and do a confidence search for each of the results
    module.exports.userSearch(userQuery, function(res, err) {
        if (!!err) {
            return callback(null, new Error('An error occurred when doing the Twitter search\n' + JSON.stringify(err)));
        }
        else {
            api.confidence(res, companyQuery, function(result, error) {
                if (!!error) {
                    return callback(null, new Error('An error occurred when doing the confidence search\n' + JSON.stringify(err)));
                }
                else {
                    return callback(result);  
                }
            });
        }            
    });
}

// Run a user search
module.exports.userSearch = function(query, callback) {
    twitter.get('users/search', {q: query}, function(err, users, res) {
        if (!!err) {
            return callback(null, new Error('An error occurred when doing the user search\n' + JSON.stringify(err)));
        }
        else {
            var usersObj = JSON.parse(JSON.stringify(users));
            return callback(usersObj);
        }
    });
}

module.exports.getFollows = function(userId, callback) {
    twitter.get('friends/list', {user_id: userId}, function(err, follows, res) {
        if (!!err) {
            return callback(null, new Error('An error occurred when finding follows\n' + JSON.stringify(err)));
        }
        else {
            var followsObj = JSON.parse(JSON.stringify(follows));
            return callback(followsObj);
        }
    })
}

// Get a feed of the lists owned by a specified user
module.exports.getOwnedLists = function(userId, callback) {
    twitter.get('lists/ownerships', {user_id: userId}, function(err, lists, res) {
        if (!!err) {
            return callback(null, new Error('An error occurred when retrieving owned lists\n' + JSON.stringify(err)));
        }
        else {
            var listsObj = JSON.parse(JSON.stringify(lists));
            return callback(listsObj);
        }
    });
}

// Get a specific list
module.exports.getList = function(listId, callback) {
    twitter.get('lists/members', {list_id: listId}, function(err, list, res) {
        if (!!err) {
            return callback(null, new Error('An error occurred when retrieving a list\n' + JSON.stringify(err)));
        }
        else {
            var listObj = JSON.parse(JSON.stringify(list));
            return callback(listObj);
        }
    });
}

// Determine whether a user is in a specified list
module.exports.isUserInList = function(userId, listId, callback) {
    var userFoundInList = false;
    var users = [];
    module.exports.getList(listId, function(res, err) {
        if (!!err) {
            return callback(null, new Error('An error occurred when determining whether a user is in a list\n' + JSON.stringify(err)));
        }
        // Loop through the list items
        users = res.users;
        for (var i = 0; i < users.length; i++) {
            
            var item = users[i];
            
            // Get the user ID
            var foundUserId = item.id;
            
            // If the specified user ID matches the ID we've found, set userFoundInList to true
            if (userId == foundUserId) {
                userFoundInList = true;
                break;
            }
        }
        
        // Return our result
        return callback(userFoundInList);
        
    })
}