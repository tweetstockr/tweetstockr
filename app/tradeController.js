'use strict';

var UserModel = require('./models/user');
var TradeModel = require('./models/trade');
var StockModel = require('./models/stock');

var config = require('../config/config');

var TournamentController = require('./tournamentController');
var tournamentController = new TournamentController();

module.exports = function() {

  var tradeController = this;

  // Group and sum transactions according to match criteria
  function sumTransactions(match, callback) {

    TradeModel.aggregate(
      { $match: match},
      { $group: {
        _id: null,
        balance: { $sum: { $multiply: [ "$price", "$amount" ] } }
      }},
      function (err, res) {
        if (err)
          return console.log(err);

        callback(res.length ? res[0].balance : 0);
      });

  }

  this.buy = function(user, paramStock, paramAmount, callback){

    var options = {
      'user' : user,
      'stock' : paramStock,
      'amount' : paramAmount,
    };

    // Check if user can buy
    // Need to get user again so it will not be affected by manipulated requests
    UserModel.findOne({ '_id' : user._id }, function(err, docUser){

        if (err)
          return callback({ success: false, message: err });

        if (!docUser)
          return callback({ success: false, message: 'User not found' });

      options.user = docUser;

      // Find current stock price
      StockModel.findOneByName(options.stock, function(err, docStock){

        var currentPrice = docStock.price;
        var totalPrice = (currentPrice * options.amount);
        if (totalPrice == 0)
          return callback({success: false, message: 'Invalid stock price' });

        // Get user balance
        tradeController.balance(options.user, function(totalBalance){

          if (totalBalance < totalPrice)
            return callback({success: false, message: 'You do not have enough points' });

          // Everything is OK. Proceed with the purchase
          var trade = new TradeModel({
            stock: options.stock,
            price: currentPrice,
            amount: options.amount,
            owner: options.user,
            type: 'Buy',
          });

          trade.save(function(err) {
            if (err)
              return callback({ success: false, message: err });

            user.save(function(err){
              if (err)
                return callback({ success: false, message: err });

              return callback({
                success: true,
                message: 'You have purchased ' + options.stock,
                purchase: trade
              });

            });

          });

        });

      });

    });

  };

  this.sell = function(user, tradeId, callback){

    var options = {
      'user' : user,
      'tradeId' : tradeId,
      'trade' : null,
    };

    // Check if user can buy
    // Need to get user again so it will not be affected by manipulated requests
    UserModel.findOne({ '_id' : user._id }, function(err, docUser){

        if (err)
          return callback({ success: false, message: err });
        if (!docUser)
          return callback({ success: false, message: 'User not found' });

      options.user = docUser;

      // Check if this stock has already been sold
      TradeModel.findOne({ 'reference' : options.tradeId,  'type' : 'Sell' }, function(err, refTrade){

        if (err)
          return callback({ success: false, message: err });
        if (refTrade)
          return callback({ success: false, message: 'Stock already sold' });

        TradeModel.findOne({ '_id' : options.tradeId }, function(err, docTrade){

          if (err)
            return callback({ success: false, message: err });
          if (!docTrade)
            return callback({ success: false, message: 'Trade not found' });

          options.trade = docTrade;

          // Update trade
          docTrade.active = false; // Does not count on balance
          docTrade.save(function(err){
            if (err)
              return callback({ success: false, message: err });

            // Get current Stock price
            // Find current stock price
            StockModel.findOneByName(options.trade.stock, function(err, docStock){

              if (err)
                return callback({ success: false, message: err });

              var currentPrice = docStock.price;

              // Trades removed. Add sell trade.
              var trade = new TradeModel({
                stock: options.trade.stock,
                price: currentPrice,
                amount: options.trade.amount,
                owner: options.user,
                reference: options.trade,
                type: 'Sell',
              });

              trade.save(function(err){
                if (err)
                  return callback({ success: false, message: err });

                var roundPoints = (currentPrice * options.trade.amount) -
                                  (options.trade.price * options.trade.amount);

                tournamentController.recordTournamentScore(
                  options.user, roundPoints, function(response){
                    
                  return callback({
                    success: true,
                    message: 'You sell ' + options.trade.stock
                  });

                });

              });

            });

          });

        });
      });

    });

  };

  this.totalPurchases = function(user, callback){

    sumTransactions(
      { 'type' : 'Buy', 'owner' : user._id },
      function(total){ callback(total); }
    );

  };

  this.totalSells = function(user, callback){

    sumTransactions(
      { 'type' : 'Sell', 'owner' : user._id },
      function(total){ callback(total); }
    );

  };

  this.balance = function(user, callback){

    tradeController.totalSells(user, function(totalSell){
        tradeController.totalPurchases(user, function(totalBuy){
          callback(totalSell - totalBuy);
        });
      });

  };

};
