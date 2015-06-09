/* jshint node:true */

/*
 * @name api.ctrl.js
 * @dev Andrew Havis
 * @description This controller interfaces with our API in order to process the information given by the user via Twitter
 */

// Import Twitter module
var twitter = require('./../api/twitter');

// Function to determine the level of confidence that a user is associated with a specified company
module.exports.confidence = function(userQuery, company, callback) {
    
    // First, let's do a user search for our user query
    var userSearch = function(callback) {
        twitter.userSearch(userQuery, function(results, error) {
            if (!!error) {
                var e = new Error('ERROR: Cannot do confidence search\n' + error)
                return callback(e);
            }
            else {
                return callback(results);
            }
        });
    };
    
    userSearch(function(userResults) {
        for (u in userResults) {

            var confidenceScore = 0;

            // Do a bio search - if the company's name appears in the user's bio, add one to the confidence score
            var bio = bioSearch(userResults[u].description, company);
            if (!!bio) {
                confidenceScore++;
            }

            // Search company follows for user
            doesCompanyFollowUser(userResults[u], company, function(followed) {
                if (!!followed) {
                    confidenceScore++;
                }
            });

            userResults[u].confidence = confidenceScore;

        }
        return callback(userResults);
    });
}

var bioSearch = function(bio, company) {
    
    // Search for the company name in the bio
    var companyNameFound = false;
    
    if (bio.indexOf(company) > -1) {
        companyNameFound = true;
    }
    
    return companyNameFound;
}

var doesCompanyFollowUser = function(user, company, callback) {
    
    // Get the user ID
    var userId = user.id;
    
    // Does the specified company follow the user?
    // Find what we think is the official company profile
    findOfficialCompanyProfile(company, function(result) {
        
        // Now get the list of follows of that profile
        twitter.getFollows(result.id, function(follows, error) {
            
            if (!!error) {
                console.log('Cannot find follows\n' + error);
            }
            else {
            
                var followsJSON = JSON.parse(JSON.stringify(follows));

                // Now loop through the follows, and return true if the user ID appears in any of them
                for (f in follows.users) {
                    if (follows.users[f].id == user.id) {
                        return callback(true);
                        break;
                    }
                }
                
            }
            
        });
        
    });
    
    // If we've arrived here, say that the company doesn't follow the user
    return callback(false);
    
}

var findOfficialCompanyProfile = function(company, callback) {
    
    // This function attempts to find the official Twitter profile of a specified company
    // The strategy for this is to use the first verified account that appears
    // If no verified accounts appear, then we will use the one that appears first
    
    // Use the user search to look for the company
    twitter.userSearch(company, function(res, err) {
        if (!!err) {
            console.log('Cannot find a Twitter profile for ' + company + '\n' + err);
        }
        else {
            // Loop through the results
            // If one is verified, return it
            for (r in res) {
               if (!!res[r].verified) {
                   return callback(res[r]);
                   break;
               } 
            }

            // If we're here, simply return the first result
            return callback(res[0]);

        }

    });
                       
}