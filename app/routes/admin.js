// admin routes ================================================================

'use strict';

module.exports = function(app) {

    var UsersController = require('../usersController'),
        usersController = new UsersController();

    var TournamentsController = require('../tournamentsController'),
        tournamentsController = new TournamentsController();

    var ProductsController = require('../productsController'),
        productsController = new ProductsController();


    app.all("/admin/*", isAdmin, function(req, res, next) {
      next();
    });

    app.get('/admin', isAdmin, function(req, res) {
      res.render('admin/index');
    });

    // USERS ===================================================================

    app.get('/admin/users/list/:page', function(req, res) {

      var configAdmin = require('../config/admin');

      var page = 1
      if ( typeof req.params.page !== 'undefined' && req.params.page )
        page = req.params.page;

      var search = '';
      if ( typeof req.query.search !== 'undefined' && req.query.search )
        search = req.query.search;

      usersController.list(configAdmin.resultsPerPage, page, search, function(usersList){
        if (usersList.page > usersList.pages)
          res.redirect('/admin/users/list/1?search=' + usersList.search);

        res.render('admin/users/list', usersList);
      });
    });

    app.get('/admin/users/edit/:user', function(req, res){
      usersController.user(req.params.user,function(user){
        res.render('admin/users/edit', user);
      });
    });

    app.post('/admin/users/edit/:user', function(req, res){

      var id = req.params.user;

      usersController.update(id, req.body, function(user){
        res.redirect('/admin/users/edit/' + id);
      });

    });

    app.get('/admin/users', function(req, res) {
      res.redirect('/admin/users/list/1');
    });

    // TOURNAMENTS =============================================================

    app.get('/admin/tournaments/list', function(req, res) {
      tournamentsController.list(function(tournamentsList){
        res.render('admin/tournaments/list', tournamentsList);
      });
    });

    app.get('/admin/tournaments/edit/:tournament', function(req, res){
      tournamentsController.tournament(req.params.tournament,function(t){
        res.render('admin/tournaments/edit', {
          'tournament' : t
        });
      });
    });

    app.post('/admin/tournaments/edit/:tournament', function(req, res){

      var id = req.params.tournament;

      tournamentsController.update(id, req.body, function(t){
        res.redirect('/admin/tournaments/edit/' + id);
      });

    });

    app.get('/admin/tournaments/create', function(req, res) {
      res.render('admin/tournaments/create');
    });

    app.post('/admin/tournaments/create', function(req, res) {
      tournamentsController.create(req.body, function(err, t){
        res.redirect('/admin/tournaments/edit/' + t._id);
      });
    });

    // PRODUCTS ================================================================

    app.get('/admin/products/list', function(req, res) {
      productsController.list(function(productsList){
        res.render('admin/products/list', productsList);
      });
    });

    app.get('/admin/products/edit/:product', function(req, res){
      productsController.product(req.params.product,function(t){
        res.render('admin/products/edit', {
          'product' : t
        });
      });
    });

    app.post('/admin/products/edit/:product', function(req, res){

      var id = req.params.product;
      productsController.update(id, req.body, function(t){
        res.redirect('/admin/products/edit/' + id);
      });

    });

    app.get('/admin/products/create', function(req, res) {
      res.render('admin/products/create');
    });

    app.post('/admin/products/create', function(req, res) {
      productsController.create(req.body, function(err, t){
        res.redirect('/admin/products/edit/' + t._id);
      });
    });


};


// route middleware to ensure user is logged in as administrator ===============
function isAdmin(req, res, next) {

    var configAdmin = require('../config/admin');
    var configGeneral = require('../config/config');

    if (req.isAuthenticated()){

      var admins = configAdmin.administrators.split(',');
      var currentUsername = req.user.twitter.username;

      for (var i = 0; i < admins.length; i++) {
          if ((admins[i]).toLowerCase() === currentUsername.toLowerCase())
            return next();
      };

      console.log(currentUsername + ' is not authorized.');
      return res.redirect(configGeneral.homeUrl);
      // return res.redirect(configGeneral.apiUrl + '/auth/twitter');

    } else
      return res.redirect(configGeneral.homeUrl);
      // return res.redirect(configGeneral.apiUrl + '/auth/twitter');

}
