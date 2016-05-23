module.exports = function(app) {

  // GAME ====================================================================
  app.get('/', function(req,res) {
    res.redirect('/play/market');
  });

  app.get('/market', function(req,res) {
    res.render('play/pages/market');
  });

  app.get('/wallet', function(req,res) {
    res.render('play/pages/wallet');
  });

  app.get('/shop', function(req,res) {
    res.render('play/pages/shop');
  });

  app.get('/ranking', function(req,res) {
    res.render('play/pages/ranking');
  });

  app.get('/tournaments', function(req,res) {
    res.render('play/pages/tournaments');
  });

  app.get('/profile', function(req,res) {
    res.render('play/pages/profile');
  });

  // =========================================================================

};
