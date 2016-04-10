'use strict';

var UserModel = require('./models/user');

module.exports = function() {

  this.count = function(callback){

    UserModel.count().exec(function(err, c) {
      callback(c);
    });

  };

  this.user = function(id, callback){

    UserModel.findById(id).exec(function(err, c) {
      callback(c);
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
