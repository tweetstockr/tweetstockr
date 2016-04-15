'use strict';

var UserModel = require('./models/user');
var UserController = require('./userController');

var userController = new UserController();

module.exports = function() {

  this.count = function(callback){

    UserModel.count().exec(function(err, c) {
      callback(c);
    });

  };

  this.user = function(id, callback){

    // TODO: This is no good...

    UserModel.findById(id).exec(function(err, c) {
      userController.rankingPosition(c, function(position){
        userController.portfolio(c, function(portfolio){
          userController.statement(c, function(statement){
            callback({
              'user':c,
              'statement':statement,
              'portfolio':portfolio,
              'position':position,
            });
          });
        });
      });
    });

  };

  this.update = function(id, update, callback){

    UserModel.update({'_id':id}, update, {}, function(err, doc){
      callback(doc);
    });

  };

  this.list = function(perPage, page, search, callback){

    if (page < 1) page = 1;

    var query = search.length ?
      {"twitter.username": {'$regex': new RegExp(search, "i") }} : {};

    UserModel.find(query)
      // .select('search')
      // .sort({name: 'asc'})
      .limit(perPage)
      .skip(perPage * (page - 1))
      .exec(function (err, users) {
        UserModel.count(query).exec(function (err, count) {
          callback({
            'count': count,
            'users': users,
            'page': page,
            'pages': Math.ceil(count / perPage),
            'search': search,
          });
        })
      });
  };

};
