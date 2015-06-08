/*jshint node:true*/

// Express & socket.io
var express     = require('express');
var app         = express();
var socketIo    = require('socket.io');

// Cloud Foundry Environment Variables
var credentials;
try {
    credentials = require('./server/credentials/credentials.json');
}
catch(err) {
    credentials = {};
}
var cf          = require('cfenv');
var appEnv      = cf.getAppEnv({vcap: {services: credentials[1]}});


// Set public directory and alias bower_components
app.use(express.static(__dirname + '/app'));
app.use('/lib', express.static(__dirname + '/bower_components'));

// If local, set credential variables
if(appEnv.isLocal) {
    console.log('Environment: Local');
    for(var key in credentials[0]) { 
        process.env[key] = credentials[0][key]; 
    }
}
// If not, we're in Bluemix and environment variables are set
else {
    console.log('Environment: Bluemix');
}

// ************ Cloudant API  ************

var cloudant = require('./server/api/cloudant.js');

// **************************************

// ************ Twitter API *************

var twitter = require('./server/api/twitter.js');

// Set up our API routes

// User search
app.get('/api/twitter/users/:query', function(req, res) {
    var query = req.params.query;
    twitter.userSearch(query, function(results, error) {
        if (!!error) {
            res.send(error);
        }
        else {
            res.json(results);
        }
    });
});

// Get owned lists
app.get('/api/twitter/users/:query/lists', function(req, res) {
    var query = req.params.query;
    twitter.getOwnedLists(query, function(results, error) {
        if (!!error) {
            res.send(error);
        }
        else {
            res.json(results);
        }
    });
});

// Get list by ID
app.get('/api/twitter/lists/:id', function(req, res) {
    var listId = req.params.id;
    twitter.getList(listId, function(result, error) {
        if (!!error) {
            res.send(error);
        }
        else {
            res.json(result);
        }
    }); 
});

// Determine whether a given user is in a specified list
app.get('/api/twitter/lists/:listId/users/:userId', function(req, res) {
    var listId = req.params.listId;
    var userId = req.params.userId;
    twitter.isUserInList(userId, listId, function(result, error) {
        if (!!error) {
            res.send(error);
        }
        else {
            res.send(result);
        }
    });
});

// Confidence search API
app.get('/api/twitter/users/:userQuery/:companyQuery', function(req, res) {
    var userQuery = req.params.userQuery;
    var companyQuery = req.params.companyQuery;
    twitter.confidenceSearch(userQuery, companyQuery, function(result, error) {
        if (!!error) {
            res.send(error);
        }
        else {
            res.json(result);
        }
    });
});


// **************************************

// Render index page
app.get('/', function(req, res){
    res.sendFile('index.html');
});

// Start server
var io = socketIo.listen(app.listen(appEnv.port, appEnv.bind, function(){
    console.log('Listening on %s:%d', appEnv.bind, appEnv.port);
	console.log('App ready - to quit, please press CTRL+C');
}));

// Set up API routes
app.get('/api/cloudant', function(req, res) {
    cloudant.exportData('test', function(result) {
        res.json(result);
    });
});

// Keep track of number of connected users
var connectCounter = 0;
io.sockets.on('connection', function(socket) {
    connectCounter++;
    console.log('%d user(s) currently connected.', connectCounter);

    socket.on('disconnect', function() {
        connectCounter--;
        console.log('%d user(s) currently connected.', connectCounter);
    });
});