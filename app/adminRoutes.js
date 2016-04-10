// admin routes ================================================================

'use strict';

module.exports = function(app) {

    var UsersController = require('./usersController'),
        usersController = new UsersController();

    app.get('/admin', isLoggedInAsAdministrator, function(req, res) {
      res.render('admin/index');
    });

    app.get('/admin/users', isLoggedInAsAdministrator, function(req, res) {
      usersController.listAll(function(users){
        res.render('admin/users', { message: 'hi', 'users': users });
      });
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
