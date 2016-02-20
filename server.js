// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var http  = require('http');
var app      = express();
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database');
var configGeneral = require('./config/config');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'whatsthenextrend' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// Add headers =================================================================
app.use(function (req, res, next) {

  var whitelist = [configGeneral.allowedOriginA, configGeneral.allowedOriginB];
  var host = req.get('host');

  whitelist.forEach(function(val, key){
    if (host.indexOf(val) > -1){
      res.setHeader('Access-Control-Allow-Origin', host);
    }
  });

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT');
  // res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.header('Access-Control-Allow-Credentials', true);

  next();

});


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
var server = http.createServer(app).listen(configGeneral.port, function(){
  console.log('The magic happens on port ' + configGeneral.port);
});


// round =======================================================================
var Round = require('./app/roundController');
var round = new Round(server);
