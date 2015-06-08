/* jshint node:true */

/*
 * @name api.ctrl.js
 * @dev Andrew Havis
 * @description This controller interfaces with our API in order to process the information given by the user via Twitter
 */

// Import Twitter module
var twitter = require('./../api/twitter');

// Function to determine the level of confidence that a user is associated with a specified company
module.exports.confidence = function(users, company, callback) {
    
    // First, let's do a bio search - if the company's name appears in the user's bio, add one to the confidence score
    for (u in users) {
        var confidenceScore = 0;
        
        // Bio search for company name
        var bio = bioSearch(users[u].description, company);
        if (!!bio) {
            confidenceScore++;
        }
        
        // Search company follows for user
        var followed = doesCompanyFollowUser(users[u], company);
        if (!!followed) {
            confidenceScore++;
        }

        users[u].confidence = confidenceScore;
    }
    return callback(users);
}

var bioSearch = function(bio, company) {
    
    // Search for the company name in the bio
    var companyNameFound = false;
    
    if (bio.indexOf(company) > -1) {
        companyNameFound = true;
    }
    
    return companyNameFound;
}

var doesCompanyFollowUser = function(user, company) {
    
    // Does the specified company follow the user?
    // Find what we think is the official company profile
    var companyProfile = findOfficialCompanyProfile(company);
    
    // Now get the list of follows of that profile
    var follows = twitter.getFollows(companyProfile.id);
    
    // Get the user ID
    var userId = user.id;
    
    // Now loop through the follows, and return true if the user ID appears in any of them
    for (f in follows.users) {
        if (follows[f].id === user.id) {
            return true;
            break;
        }
    }
    
    // If we've arrived here, say that the company doesn't follow the user
    return false;
    
}

var findOfficialCompanyProfile = function(company) {
    
    // This function attempts to find the official Twitter profile of a specified company
    // The strategy for this is to use the first verified account that appears
    // If no verified accounts appear, then we will use the one that appears first
    
    // Use the user search to look for the company
    var search = twitter.userSearch(company, function(res, err) {
        if (!!err) {
            console.log('Cannot find a Twitter profile for ' + company + '\n' + err);
        }
        else {
            // Loop through the results
            // If one is verified, return it
            for (r in res) {
               if (!!res[r].verified) {
                   return res[r];
                   break;
               } 
            }
            
            // If we're here, simply return the first result
            return res[0];
            
        }
            
    });
    
    return search;
                       
}