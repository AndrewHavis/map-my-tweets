/*jshint node:true*/

/*
 * @name cloudant.js
 * @description This module adds JSON data to Cloudant, using credentials supplied in a separate JSON file
 * @author Andrew Havis
 */

// Get our credentials from local credentials.json, or VCAP_SERVICES as appropriate
var credentials;
try {
    // We're local, so specify the path to the credentials file below
    credentials = require('../credentials/credentials.json');
}
catch (err) {
    // We're on Bluemix, so get the credentials from Bluemix's VCAP_SERVICES
    console.log(err);
	credentials = {};
}

var cf = require('cfenv');
var appEnv = cf.getAppEnv({vcap: {services: credentials[1]}});

// Variables for Cloudant
var Cloudant = require('cloudant');

// Express
var express = require('express');
var app = express();

// Get our Cloudant credentials
var cloudantCreds = appEnv.getService(/cloudant/).credentials;

// Output variables
var jsonFeed = {};

module.exports.deleteDatabase = function(db) {
    // Connect to Cloudant to delete the specified database
    Cloudant({account:cloudantCreds.username, password:cloudantCreds.password}, function(err, cloudant) {
        if (err) {
            return console.log('ERROR: Cannot delete database (unable to connect to Cloudant)\n' + err);
        }
        else {
            cloudant.db.destroy(db);
        }
    });
}

module.exports.importData = function(data, db) {
    // Now go into Cloudant, and store the information there ready for retrieval by our front end
    Cloudant({account:cloudantCreds.username, password:cloudantCreds.password}, function(err, cloudant) {
        if (err) {
            return console.log('ERROR: Cannot import data (unable to connect to Cloudant)\n' + err);
        }
        else {
            // Recreate the Cloudant news database
            cloudant.db.create(db, function() {
                // New let's use our database
                var newsDb = cloudant.use(db);
                newsDb.insert(data, data.id, function(err, body, header) {
                    if (err) {
                        return console.log('ERROR: Cannot enter data\n' + err);
                    }
                    else {
                        // Data entry successful
                        // Now get the JSON data from Cloudant
                        newsDb.list({include_docs: true}, function(err, body) {
                            if (err) {
                                return console.log('ERROR: Cannot retrieve data\n' + err);
                            }
                            else {
                                jsonFeed = {};
                                jsonFeed = body; // Output our JSON feed to the API
                            }
                        })
                    }
                });
            })
        }
    });
}

module.exports.exportData = function(db, callback) {
    // Connect to the specified Cloudant database, and get a list of the documents in it
        Cloudant({account:cloudantCreds.username, password:cloudantCreds.password}, function(err, cloudant) {
        if (err) {
            return console.log('ERROR: Cannot export data (unable to connect to Cloudant)\n' + err);
        }
        else {
            var newsDb = cloudant.use(db);
            newsDb.list({include_docs: true}, function(err, body) {
                if (err) {
                    return console.log('ERROR: Cannot retrieve data\n' + err);
                }
                else {
                    jsonFeed = {};
                    jsonFeed = body; // Output our JSON feed to the API
                    return callback(jsonFeed);
                }
            });
        }
    });
}