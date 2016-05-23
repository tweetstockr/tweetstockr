module.exports = function(app) {

  // GAME ====================================================================
  app.get('/', function(req,res) {
    res.render('play/index');
  });

  // This is for jade partials rendering
  app.get('/partials/:name', function (req, res){
    var name = req.params.name;
    res.render('play/partials/' + name);
  });

  app.get('/components/:name', function (req, res){
    var name = req.params.name;
    res.render('play/components/' + name);
  });

  app.get('/icons/:name', function (req, res){
    var name = req.params.name;
    res.render('play/icons/' + name);
  });

  // The 404 Route (ALWAYS Keep this as the last route) ----------------------
  // app.get('*', function(req, res){
  //   res.render("play/errors/404");
  // });

  // =========================================================================

};
