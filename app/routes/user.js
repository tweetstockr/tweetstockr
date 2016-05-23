module.exports = function(app, passport, tweetOmeter) {

var UserController = require('../userController');
var TournamentController = require('../tournamentController');
var TradeController = require('../tradeController');
var ShopController = require('../shopController');

var userController = new UserController();
var tournamentController = new TournamentController();
var tradeController = new TradeController();
var shopController = new ShopController();

var url = require('url');

// USER routes =================================================================

  // RESET USER ================================================================
  app.post('/reset', isLoggedIn, function(req, res){
    userController.restart(req.user, function(response){
        res.json(response);
    });
  });

  // LOGOUT ==============================
  app.post('/logout', function(req, res) {
      req.logout();
      var configGeneral = require('../../config/config');
      res.json({
        redirect_to : configGeneral.homeUrl
      });
  });

  // AUTHENTICATE AND LOGIN ====================================================

  // send to twitter to do the authentication
  app.get('/auth/twitter', passport.authenticate('twitter'));

  // handle the callback after twitter has authenticated the user
  app.get('/auth/twitter/callback',
      passport.authenticate('twitter'), function(req, res) {
        // console.log('now you can redirect to ' + req.session.redirect_to);
        // console.log('redirect to ' + req.session.redirect_to);
          var configGeneral = require('../../config/config');
          res.redirect(req.session.redirect_to || configGeneral.clientUrl);
      });

  // JOYSTICKET ================================================================

  // Joysticket login
  app.get('/joylogin', isLoggedIn, function(req, res){
    userController.joyLogin(req.user, function(response){
      res.json(response);
    });
  });

  app.get('/joylogout', isLoggedIn, function(req, res){
    var configGeneral = require('../../config/config');

    userController.joyLogout(req.user, function(response){
      if(!response.err){

        req.login(req.user, function(err){
            return res.json({url : configGeneral.clientUrl + '/#' + '/profile'});
        });
      }
    });
  });

  // Joysticket callback
  app.get('/joycb', isLoggedIn, function(req, res){
    var url_parts = url.parse(req.url, true);
    var configGeneral = require('../../config/config');
    joyId = url_parts.query.id;

    userController.joyCallback(joyId, req.user, function(response){
      if(response.success){
        return res.redirect(configGeneral.clientUrl + '/#' + '/profile');
      }else{
        return res.json(response);
      }
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
      redirect_to : configGeneral.apiUrl + '/auth/twitter'
    });
    // res.redirect('/auth/twitter');
}
