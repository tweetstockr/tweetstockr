
module.exports = function(app, passport, tweetOmeter) {

var UserController = require('./userController');
var userController = new UserController();

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

        userController.balance(req.user, function(response){

          res.json({
            user: req.user,
            'balance': response
          });

        });

    });

    // STOCKS ==================================================================
    app.get('/stocks', function(req, res) {
        res.json({
          stocks: tweetOmeter.getStocks(),
        });
    });

    // RANKING =================================================================
    app.get('/ranking', function(req, res) {
        userController.ranking(function(response){
            res.json({
              response
            });
          });
    });

    // PORTFOLIO ===============================================================
    // Post with parameters 'stock' and 'amount'
    app.post('/trade/buy', isLoggedIn, function(req, res) {
      var trendingTopic = req.body.stock;
      var amount = req.body.amount;

      userController.buy(req.user, trendingTopic, amount, function(response){
        res.json(response);
      });
    });

    app.post('/trade/sell', isLoggedIn, function(req, res) {
      var tradeId = req.body.trade;
      userController.sell(req.user, tradeId, function(response){
        res.json(response);
      });
    });

    app.get('/portfolio', isLoggedIn, function(req, res) {
        userController.portfolio(req.user, function(trades){
          res.json(trades);
        });
    });
    app.post('/reset', isLoggedIn, function(req, res){
      userController.restart(req.user, function(err){
          res.json({
              success: !err,
          });
      });
    });

    // LOGOUT ==============================
    app.post('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });






    app.get('/test', function(req, res){

        userController.test(function(response){
            res.json(response);
        });

    });

    // AUTHENTICATE AND LOGIN ==================================================

    // send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter'), function(req, res) {
          console.log('redirect to ' + req.session.redirect_to);
            res.redirect(req.session.redirect_to || 'http://localhost:3000/');
        });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    // Remember last page
    req.session.redirect_to = 'http://localhost:3000/#' + req.path;

    res.json({
      redirect_to : '/auth/twitter'
    });
    // res.redirect('/auth/twitter');
}
