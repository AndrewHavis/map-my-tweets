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