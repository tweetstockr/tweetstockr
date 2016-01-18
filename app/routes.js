
module.exports = function(app, passport, tweetOmeter) {

var UserController = require('./userController');
var userController = new UserController();

// twitter robot ===============================================================
var server = require('http').createServer(app);
var TweetOmeter = require('./twitterController');
var tweetOmeter = new TweetOmeter(server);

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.json({
          message: (req.user == undefined) ?
            'Welcome. You are not logged in. Go to /auth/twitter to login with Twitter' :
            'Hello, ' + req.user.twitter.displayName + '. To view your profile go to /profile. To logout go to /logout'
        });
    });

    // PROFILE SECTION =========================================================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.json({
          message: 'This is the profile. Go to /logout to logout.',
          user: req.user
        });
    });

    // STOCKS ==================================================================
    app.get('/stocks', function(req, res) {
        res.json({
          stocks: tweetOmeter.getStocks(),
        });
    });

    // PORTFOLIO ===============================================================
    // Post with parameters 'tt' and 'amount'
    app.post('/buy', isLoggedIn, function(req, res) {

        var trendingTopic = req.body.tt;
        var amount = req.body.amount;

        res.json({
          buy : userController.buy(req.user, trendingTopic, amount)
        })
    });
    app.get('/portfolio', isLoggedIn, function(req, res) {
        userController.portfolio(req.user, function(shares){
          res.json({
            portfolio : shares
          });
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // AUTHENTICATE AND LOGIN ==================================================

    // send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

        // res.redirect('/');
    res.redirect('/auth/twitter');
}
