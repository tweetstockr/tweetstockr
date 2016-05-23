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

  // =========================================================================

};
