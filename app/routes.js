module.exports = function(app, passport, tweetOmeter) {

var UserController = require('./userController');
var TournamentController = require('./tournamentController');
var TradeController = require('./tradeController');
var ShopController = require('./shopController');

var userController = new UserController();
var tournamentController = new TournamentController();
var tradeController = new TradeController();
var shopController = new ShopController();

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.json({
          message: (req.user == undefined) ?
            'Welcome. You are not logged in. Go to /auth/twitter to login with Twitter' :
            'Hello, ' + req.user.twitter.displayName + '. To view your profile go to /profile. To logout go to /logout'
        });
    });

    // TOURNAMENTS =============================================================
    app.get('/tournaments', function(req,res) {

        tournamentController.getTournaments(function(response){
          res.json(response);
        });

    });

    // SHOP ====================================================================
    app.get('/shop', function(req,res) {

        res.json(shopController.getProducts());

    });

    app.post('/shop/buy', isLoggedIn, function(req,res) {

        var productCode = req.body.code;
        shopController.exchange(req.user, productCode, function(response){
          res.json(response);
        });

    });


    // PROFILE SECTION =========================================================
    app.get('/profile', isLoggedIn, function(req, res) {

        tradeController.balance(req.user, function(balance){
          userController.rankingPosition(req.user, function(position){
            res.json({
              user: req.user,
              'balance': balance,
              'ranking': position,
            });
          });
        });

    });

    // STOCKS ==================================================================
    app.get('/stocks', function(req, res) {
        res.json(tweetOmeter.getStocks());
    });
    app.get('/round', function(req, res) {
        res.json(tweetOmeter.getRound());
    });

    // RANKING =================================================================
    app.get('/ranking', function(req, res) {
      userController.ranking(function(response){
          res.json(response);
        });
    });

    // TRANSACTIONS ============================================================

    // Post with parameters 'stock' and 'amount'
    app.post('/trade/buy', isLoggedIn, function(req, res) {
      var trendingTopic = req.body.stock;
      var amount = req.body.amount;

      tradeController.buy(req.user, trendingTopic, amount, function(response){
        res.json(response);
      });

    });

    app.post('/trade/sell', isLoggedIn, function(req, res) {
      var tradeId = req.body.trade;

      req.session.save(function() {
        tradeController.sell(req.user, tradeId, function(response){
          res.json(response);
        });

      });

    });

    // PORTFOLIO ===============================================================
    app.get('/portfolio', isLoggedIn, function(req, res) {
        userController.portfolio(req.user, function(trades){
          res.json(trades);
        });
    });

    // RESET USER ==============================================================
    app.post('/reset', isLoggedIn, function(req, res){
      userController.restart(req.user, function(response){
          res.json(response);
      });
    });

    // GET INFO ================================================================
    app.get('/balance', isLoggedIn, function(req, res){
      tradeController.balance(req.user, function(response){
          res.json(response);
      });
    });

    app.get('/stats', isLoggedIn, function(req, res){
      userController.stats(req.user, function(response){
          res.json(response);
      });
    });

    app.get('/statement', isLoggedIn, function(req, res) {
        userController.statement(req.user, function(trades){
          res.json(trades);
        });
    });

    // LOGOUT ==============================
    app.post('/logout', function(req, res) {
        req.logout();
        var configGeneral = require('../config/config');
        res.json({
          redirect_to : configGeneral.homeUrl
        });
    });

    // AUTHENTICATE AND LOGIN ==================================================

    // send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter'), function(req, res) {
          // console.log('now you can redirect to ' + req.session.redirect_to);
          // console.log('redirect to ' + req.session.redirect_to);
            var configGeneral = require('../config/config');
            res.redirect(req.session.redirect_to || configGeneral.clientUrl);
        });

};


// route middleware to ensure user is logged in ================================
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    // Remember last page
    var configGeneral = require('../config/config');
    req.session.redirect_to = configGeneral.clientUrl + '/#' + req.path;

    res.json({
      redirect_to : configGeneral.apiUrl + '/auth/twitter'
    });
    // res.redirect('/auth/twitter');
}
