'use strict';

var UserModel = require('./models/user');
var TradeModel = require('./models/trade');
var StockModel = require('./models/stock');

var config = require('../config/config');

module.exports = function() {


  this.ranking = function(callback){

    UserModel.find({},{
        '_id': 0,
      })
      .limit(config.usersOnRanking)
      .sort('-points')
      .exec(function(err, users) {
        if(err) {
          callback(err);
        } else {
          callback(users);
        }
      });

  };


  this.sell = function(user, tradeId, mainCallback){

    // Check if user can buy
    // Need to get user again so it will not be affected by manipulated requests
    UserModel.findOne({ '_id' : user._id }, function(err, docUser){
      if (err)
        return mainCallback({ success: false, message: err });

      if (!docUser)
        return mainCallback({ success: false, message: 'User not found' });

      findTrade(docUser, tradeId, processSell);
    });


    var findTrade = function(docUser, tradeId, callback){

      TradeModel.findOne({ '_id' : tradeId }, function(err, docTrade){
        if (err)
          return mainCallback({ success: false, message: err });

        if (!docTrade)
          return mainCallback({ success: false, message: 'Trade not found' });

        // processSell
        callback(docTrade.totalPrice, tradeId, docUser);
      });

    }


    var processSell = function(tradePrice, tradeId, docUser){

      TradeModel.findOne({ '_id' : tradeId }).remove(function(){

          docUser.points += tradePrice;
          docUser.save(function(err){
            if (err)
              return mainCallback({ success: false, message: err });

            return mainCallback({
              success: true,
              message: 'You sell it',
            });

        });

      });

    }


  };

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
        stock: stock.name,
        price: stock.price,
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

    TradeModel.find({ 'owner' : user, 'type' : 'Buy' }, function(err, trades) {
      callback(trades);
    });

  };

  this.statement = function(user, callback){

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
