'use strict';


var UserModel = require('./models/user');
var SharesModel = require('./models/share');

module.exports = function() {

  this.buy = function(user, paramStock, paramAmount){

    //TODO: check if user can buy :P

    var share = new SharesModel({
      stock: paramStock,
      amount: paramAmount,
      owner: user,
    });

    share.save(function(res) {
      return res;
    });

  };


  this.portfolio = function(user, callback){

    SharesModel.find({ 'owner' : user }, function(err, shares) {
      callback(shares);
    });

  };

};
