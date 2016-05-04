// Tweetstockr Server
'use strict';

// set up ======================================================================
// get all the tools we need
const express  = require('express');
const app      = express();
const http     = require('http').Server(app);
const mongoose = require('mongoose');
const passport = require('passport');
const flash    = require('connect-flash');

const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');
const MongoStore   = require('connect-mongo')(session);

const configDB = require('./config/database');
const configGeneral = require('./config/config');

// CORS config =================================================================
const cors = require('cors');
const whitelist = configGeneral.allowedOrigins.split(',');
const corsOptions = {
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

app.use(express.static(__dirname + '/development'));

// parse Jade (for administrator views) ========================================
app.set('view engine', 'jade');

// round =======================================================================
var Round = require('./app/roundController');
var round = new Round(http);

// routes ======================================================================
require('./app/userRoutes.js')(app, passport, round); // load our routes and pass in our app and fully configured passport
require('./app/adminRoutes.js')(app); // administrator routes
require('./app/playRoutes.js')(app); // game routes

// launch ======================================================================
http.listen(configGeneral.port, function(){
  console.log('The magic happens on port ' + configGeneral.port);
});
