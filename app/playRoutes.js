module.exports = function(app) {

  // GAME ====================================================================
  app.get('/play', function(req,res) {
    res.redirect('/play/market');
  });

  app.get('/play/market', function(req,res) {
    res.render('play/pages/market');
  });

  app.get('/play/wallet', function(req,res) {
    res.render('play/pages/wallet');
  });

  app.get('/play/shop', function(req,res) {
    res.render('play/pages/shop');
  });

  app.get('/play/ranking', function(req,res) {
    res.render('play/pages/ranking');
  });

  app.get('/play/tournaments', function(req,res) {
    res.render('play/pages/tournaments');
  });

  app.get('/play/profile', function(req,res) {
    res.render('play/pages/profile');
  });

  // =========================================================================

};
