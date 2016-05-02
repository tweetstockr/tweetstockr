// Tweetstockr Server
'use strict';

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var http     = require('http').Server(app);
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var MongoStore   = require('connect-mongo')(session);

var configDB = require('./config/database');
var configGeneral = require('./config/config');

// CORS config =================================================================
var cors = require('cors');
var whitelist = configGeneral.allowedOrigins.split(',');
var corsOptions = {
  origin: function(origin, callback){
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
  allowedHeaders: ['X-Requested-With','Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// sessions ====================================================================
var sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });
var expressSession = session({
    store: sessionStore,
    key: configGeneral.sessionKey,
    secret: configGeneral.sessionSecret,
    resave: true,
    saveUninitialized: true,
});

// set up our express application
// app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// parse Jade (for administrator views) ========================================
app.set('view engine', 'jade');

// round =======================================================================
var Round = require('./app/roundController');
var round = new Round(http);

// routes ======================================================================
require('./app/userRoutes.js')(app, passport, round); // load our routes and pass in our app and fully configured passport
require('./app/adminRoutes.js')(app); // administrator routes

// launch ======================================================================
http.listen(configGeneral.port, function(){
  console.log('The magic happens on port ' + configGeneral.port);
});
