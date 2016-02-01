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

        // Update trade
        docTrade.active = false; // Does not count on balance
        docTrade.save(function(err){
          if (err)
            return mainCallback({ success: false, message: err });

          // processSell
          callback(docTrade, tradeId, docUser);
        });

      });

    }

    var processSell = function(docTrade, tradeId, docUser){

        // Trades removed. Add sell trade.
        var trade = new TradeModel({
          stock: docTrade.stock,
          price: docTrade.price,
          amount: docTrade.amount,
          owner: docUser,
          type: 'Sell',
        });

        trade.save(function(err){
          if (err)
            return mainCallback({ success: false, message: err });

          return mainCallback({
            success: true,
            message: 'You sell ' + docTrade.stock
          });

      });

    }


  };

  this.buy = function(user, paramStock, paramAmount, mainCallback){

    var thisController = this;

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
    };

    var processPurchase = function(stock, amount, docUser){

      var totalPrice = (stock.price * amount);

      if (totalPrice == 0)
        return mainCallback({success: false, message: 'Invalid stock price' });

      // Get user balance
      thisController.balance(docUser, function(totalBalance){

        if (totalBalance < totalPrice)
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

      });

    }


  };

  this.portfolio = function(user, callback){

    TradeModel.find({ 'owner' : user, 'type' : 'Buy', active : true }, function(err, trades) {
      callback(trades);
    });

  };

  this.balance = function(user, callback){

    TradeModel.aggregate(
      { $match: { 'type' : 'Sell', 'owner' : user._id, active : true }},
      { $group: {
        _id: null,
        balance: { $sum: { $multiply: [ "$price", "$amount" ] } }
      }},
      function (sellErr, sellRes) {
        if (sellErr)
          return console.log(sellErr);

        TradeModel.aggregate(
          { $match: { 'type' : 'Buy', 'owner' : user._id, active : true }},
          { $group: {
            _id: null,
            balance: { $sum: { $multiply: [ "$price", "$amount" ] } }
          }},
          function (buyErr, buyRes) {
            if (buyErr)
              return console.log(buyErr);

            var totalSell = (sellRes.length ? sellRes[0].balance : 0);
            var totalBuy = (buyRes.length ? buyRes[0].balance : 0);
            var finalBalance = totalSell - totalBuy;

            callback(finalBalance);
        });

      });

  };

  this.statement = function(user, callback){

    TradeModel.find({ 'owner' : user }, function(err, trades) {
      callback(trades);
    });

  };

  this.restart = function(user, mainCallback){

    // Need to get user again so it will not be affected by manipulated requests
    UserModel.findOne({ '_id' : user._id }, function(err, docUser){
      if (err)
        return mainCallback({ success: false, message: err });

      if (!docUser)
        return mainCallback({ success: false, message: 'User not found' });

      removeTrades(docUser, processReset);
    });


    var removeTrades = function(docUser, callback){
        TradeModel.remove({ 'owner' : docUser }, function(){
          callback(docUser);
        });
    }

    var processReset = function(docUser){

      // Trades removed. Add reset trade.
      var trade = new TradeModel({
        stock: '_RESET',
        price: config.startingPoints,
        amount: 1,
        owner: docUser,
        type: 'Sell',
      });

      trade.save(function(err) {
        if (err)
          return mainCallback({ success: false, message: err });

        return mainCallback({
          success: true,
          message: 'You reset your account'
        });

      });

    }


  };

};
