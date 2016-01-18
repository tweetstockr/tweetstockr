'use strict';


var UserModel = require('./models/user');
var TradeModel = require('./models/trade');
var StockModel = require('./models/stock');

var config = require('../config/config');

module.exports = function() {

  this.buy = function(user, paramStock, paramAmount, mainCallback){

    // Check if user can buy
    // Need to get user again so it will not be affected by manipulated requests
    UserModel.findOne({ '_id' : user._id }, function(err, docUser){
      if (err)
        return mainCallback({ success: false, message: err });

      if (!docUser)
        return mainCallback({ success: false, message: 'User not found' });

      findPrice(paramStock, paramAmount, docUser, processPurchase);
    });


    var findPrice = function(stockName, amount, docUser, callback){
      // Get last stock prices
      StockModel.getLastPrices(stockName, function(err, stocks){
        if (err)
          return mainCallback({ success: false, message: err });

        if (!stocks.length)
          return mainCallback({ success: false, message: 'Stock not found' });

        callback(stocks[0], amount, docUser);

      });
    }


    var processPurchase = function(stock, amount, docUser){
      var totalPrice = (stock.price * amount);

      if (totalPrice == 0)
        return mainCallback({success: false, message: 'Invalid stock price' });

      if (user.points < totalPrice)
        return mainCallback({success: false, message: 'You do not have enough points' });

      // Everything is OK. Proceed with the purchase
      var trade = new TradeModel({
        stock: stock,
        amount: amount,
        owner: docUser,
        type: 'Buy',
      });

      trade.save(function(err) {
        if (err)
          return mainCallback({ success: false, message: err });

        user.points -= totalPrice;
        user.save(function(err){
          if (err)
            return mainCallback({ success: false, message: err });

          return mainCallback({
            success: true,
            message: 'You have purchased ' + stock,
            purchase: trade
          });
        });
      });

    }


  };

  this.portfolio = function(user, callback){

    TradeModel.find({ 'owner' : user }, function(err, trades) {
      callback(trades);
    });

  };

  this.restart = function(user, callback){

    user.points = config.startingPoints;

    user.save(function(err) {
        if (err)
            callback(err);

        TradeModel.find({ 'owner' : user }).remove(callback);
    });

  }

};
