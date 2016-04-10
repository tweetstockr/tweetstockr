'use strict';

module.exports = function(app) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/admin', isLoggedInAsAdministrator, function(req, res) {
      res.render('admin/index');
    });

};


// route middleware to ensure user is logged in as administrator ===============
function isLoggedInAsAdministrator(req, res, next) {

    var configGeneral = require('../config/config');

    if (req.isAuthenticated()){

      var admins = configGeneral.administrators.split(',');
      var currentUsername = req.user.twitter.username;

      for (var i = 0; i < admins.length; i++) {
          if (admins[i] === currentUsername)
            return next();
      };
      return res.redirect(configGeneral.homeUrl);

    } else
      return res.redirect(configGeneral.homeUrl);

}
