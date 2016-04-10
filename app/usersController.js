'use strict';

var UserModel = require('./models/user');

module.exports = function() {

  this.listAll = function(callback){

    UserModel.find({}, function(err, users) {
      callback(users);
    });

  };

};
