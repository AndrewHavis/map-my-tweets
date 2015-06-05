/* jshint node:true */

/*
 * @name api.ctrl.js
 * @dev Andrew Havis
 * @description This controller interfaces with our API in order to process the information given by the user
 */


// Function to determine the level of confidence for the user
module.exports.confidence = function(userObj, company, callback) {
    
    // Function to calculate the confidence level that a user is associated with a company
    var confidenceScore = 0;
    
    // First, let's do a bio search - if the company's name appears in the user's bio, add one to the confidence score
    var bio = bioSearch(userObj.description, company);
    if (!!bio) {
        confidenceScore++;
    }
    
    userObj.confidence = confidenceScore;
    return userObj;
    
}

var bioSearch = function(bio, company) {
    
    // Search for the company name in the bio
    var companyNameFound = false;
    
    if (bio.indexOf(company) > -1) {
        companyNameFound = true;
    }
    
    return companyNameFound;
}