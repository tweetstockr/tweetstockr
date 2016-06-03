module.exports = function(app, passport, tweetOmeter) {

const UserController        = require('../userController');
const TournamentController  = require('../tournamentController');
const TradeController       = require('../tradeController');
const ShopController        = require('../shopController');
const StocksController      = require('../stocksController');

const userController        = new UserController();
const tournamentController  = new TournamentController();
const tradeController       = new TradeController();
const shopController        = new ShopController();
const stocksController      = new StocksController();

var url = require('url');

// API routes ==================================================================

  // TOURNAMENTS ===============================================================
  app.get('/api/tournaments', function(req,res) {
      tournamentController.getTournaments(function(response){
        res.json(response);
      });
  });

  // SHOP ======================================================================
  app.get('/api/shop', function(req,res) {
    shopController.getProducts(function(data){
      res.json(data);
    });
  });

  app.post('/api/shop/buy', isLoggedIn, function(req,res) {
      var productCode = req.body.code;
      shopController.exchange(req.user, productCode, function(response){
        res.json(response);
      });
  });

  // PROFILE SECTION ===========================================================
  app.get('/api/profile', isLoggedIn, function(req, res) {

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

  // STOCKS ====================================================================
  app.get('/api/stocks', function(req, res) {
    res.json(stocksController.getStocksWithHistory());
  });
  app.get('/api/round', function(req, res) {
    // res.json(tweetOmeter.getRound());
    res.json({});
  });

  // RANKING ===================================================================
  app.get('/api/ranking', function(req, res) {
    userController.ranking(function(response){
        res.json(response);
      });
  });

  // TRANSACTIONS ==============================================================

  // Post with parameters 'stock' and 'amount'
  app.post('/api/trade/buy', isLoggedIn, function(req, res) {
    var trendingTopic = req.body.stock;
    var amount = req.body.amount;

    tradeController.buy(req.user, trendingTopic, amount, function(response){
      res.json(response);
    });

  });

  app.post('/api/trade/sell', isLoggedIn, function(req, res) {
    var tradeId = req.body.trade;

    tradeController.sell(req.user, tradeId, function(response){
      res.json(response);
    });

  });

  // PORTFOLIO =================================================================
  app.get('/api/portfolio', isLoggedIn, function(req, res) {
      userController.portfolio(req.user, function(trades){
        res.json(trades);
      });
  });

  // GET INFO ==================================================================
  app.get('/api/balance', isLoggedIn, function(req, res){
    tradeController.balance(req.user, function(response){
        res.json(response);
    });
  });

  app.get('/api/stats', isLoggedIn, function(req, res){
    userController.stats(req.user, function(response){
        res.json(response);
    });
  });

  app.get('/api/statement', isLoggedIn, function(req, res) {
      userController.statement(req.user, function(trades){
        res.json(trades);
      });
  });

};


// route middleware to ensure user is logged in ================================
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    // Remember last page
    var configGeneral = require('../../config/config');
    req.session.redirect_to = configGeneral.clientUrl + '/#' + req.path;

    res.json({
      redirect_to : configGeneral.apiUrl + 'auth/twitter'
    });
    // res.redirect('/auth/twitter');
}
