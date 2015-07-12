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
var appEnv      = cf.getAppEnv({vcap: {services: credentials[0]}});

// Set public directory and alias bower_components
app.use(express.static(__dirname + '/app'));
app.use('/lib', express.static(__dirname + '/bower_components'));

// If local, set credential variables
if(appEnv.isLocal) {
    console.log('Environment: Local');
    for(var key in credentials) { 
        process.env[key] = credentials[key]; 
    }
}
// If not, we're in Bluemix and environment variables are set
else {
    console.log('Environment: Bluemix');
}

// ************ Twitter API *************

var twitter = require('./server/api/twitter.js');

// ************ Passport ****************

var passport = require('passport');

// **************************************

// These extra four lines are for Passport
var session = require('express-session');
app.use(session({
    secret: 'KDXHICPKLQEMZOLL',
    resave: true,
    saveUninitialized: false
})); // Session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// Set up our API routes

// Authentication (npm passport / npm passport-twitter)
var TwitterStrategy = require('passport-twitter').Strategy;
var User = {};
passport.use(new TwitterStrategy({
    consumerKey: process.env.consumer_key,
    consumerSecret: process.env.consumer_secret,
    callbackURL: process.env.callback_url
  },
  function(token, tokenSecret, profile, done) {
    User = {
        id: profile.id,
        name: profile.displayName,
        handle: profile.username
    };
    this.redirect('/');
  }
));

app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });


// User search
app.get('/api/twitter/profile', function(req, res) {
    var query = User.handle;
    twitter.userSearch(query, function(results, error) {
        if (!!error) {
            res.send(error);
        }
        else {
            res.json(results);
        }
    });
});


// Get tweets
app.get('/api/twitter/tweets', function(req, res) {
    var userId = User.id;
    twitter.getTweets(userId, function(result, error) {
        if (!!error) {
            res.send(error);
        }
        else {
            res.send(result);
        }
    });
});


// Get the location (latitude and longitude in GeoJSON format) of a tweet
app.get('/api/twitter/locations', function(req, res) {
    var userId = User.id;
    twitter.getLocations(userId, function(result, error) {
        if (!!error) {
            res.send(error);
        }
        else {
            res.send(result);
        }
    });
});

// Get the embed code for a tweet
app.get('/api/twitter/tweet/:tweetId/embed', function(req, res) {
    var tweetId = req.params.tweetId;
    twitter.getEmbedCode(tweetId, function(result, error) {
        if (!!error) {
            res.send(error);
        }
        else {
            res.send(result);
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
