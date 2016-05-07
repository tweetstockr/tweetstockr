// Tweetstockr Server
'use strict';

// Environment
var env = process.env.NODE_ENV || 'development';

// set up ======================================================================
// get all the tools we need
const express  = require('express');
const app      = express();
const http     = require('http').Server(app);
const io      = require('socket.io')(http);

const mongoose = require('mongoose');
const passport = require('passport');
const flash    = require('connect-flash');

const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');
const MongoStore   = require('connect-mongo')(session);
const passportSocketIo = require("passport.socketio");

const configDB = require('./config/database');
const configGeneral = require('./config/config');

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

if (app.get('env') !== 'production')
  app.use(morgan('dev'));

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

if (app.get('env') === 'production')
  app.use(express.static(__dirname + '/development'));
else
  app.use(express.static(__dirname + '/production'));

// socket ======================================================================
//https://github.com/jfromaniello/passport.socketio
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key:          configGeneral.sessionKey,
  secret:       configGeneral.sessionSecret,
  store:        sessionStore,
}));

// parse Jade (for administrator views) ========================================
app.set('view engine', 'jade');

// round =======================================================================
var SocketController = require('./app/socketController');
var RoundController = require('./app/roundController');

var socketController = new SocketController(io);
var roundController = null;

// routes ======================================================================
require('./app/userRoutes.js')(app, passport, roundController); // load our routes and pass in our app and fully configured passport
require('./app/adminRoutes.js')(app); // administrator routes
require('./app/playRoutes.js')(app); // game routes

// launch ======================================================================
http.listen(configGeneral.port, function(){
  console.log('The magic happens on port ' + configGeneral.port + ' [' + app.get('env') + ']');
});
