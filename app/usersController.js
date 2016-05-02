'use strict';

var UserModel = require('./models/user');
var UserController = require('./userController');
var TradeController = require('./tradeController');

var userController = new UserController();
var tradeController = new TradeController();

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
            tradeController.balance(c, function(balance){
              callback({
                'user':c,
                'statement': statement,
                'portfolio': portfolio,
                'position': position,
                'balance': balance
              });
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

  this.listAllIds = function(callback){
    UserModel.find({}, '_id',function(err, docs){
      callback(docs);
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
