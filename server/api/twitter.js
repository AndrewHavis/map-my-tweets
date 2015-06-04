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

var twitter = Twitter({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token_key: process.env.access_token_key,
    access_token_secret: process.env.access_token_secret
});

// Run a user search
module.exports.userSearch = function(query, callback) {
    twitter.get('users/search', {q: query}, function(err, users, res) {
        if (!!err) {
            return callback(null, new Error('An error occurred when doing the Twitter search\n' + JSON.stringify(err)));
        }
        else {
            var usersObj = JSON.parse(JSON.stringify(users));
            return callback(usersObj);
        }
    });
}