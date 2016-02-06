'use strict';

var UserModel = require('./models/user');
var TradeModel = require('./models/trade');
var StockModel = require('./models/stock');

var config = require('../config/config');

module.exports = function() {

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

  this.ranking = function(mainCallback){

    // Get all sells
    TradeModel.aggregate(
      { $match: { 'type' : 'Sell', active : true }},
      { $group: {
        _id: "$owner",
        balance: { $sum: { $multiply: [ "$price", "$amount" ] } }
      }},
      function (sellErr, sellRes) {
        if (sellErr)
          return console.log(sellErr);

        // Get all purchases
        TradeModel.aggregate(
          { $match: { 'type' : 'Buy', active : true }},
          { $group: {
            _id: "$owner",
            balance: { $sum: { $multiply: [ "$price", "$amount", -1 ] } }
          }},
          function (buyErr, buyRes) {
            if (buyErr)
              return console.log(buyErr);

            // Join purchases with sells
            var transactionsSum = sellRes.concat(buyRes);

            // Group purchases and sells (sells - purchases)
            // Sort results by balance
            // Get Top results
            var result = transactionsSum.reduce(function(res, obj) {
                if (!(obj._id in res))
                    res.__array.push(res[obj._id] = obj);
                else
                    res[obj._id].balance += obj.balance;
                return res;
            }, {__array:[]}).__array
              .sort(function(a,b) { return b.balance - a.balance; })
              .slice(0, config.usersOnRanking);

            // Fetch users data (async loop)
            var asyncLoop = function(o){
                var i=-1;
                var loop = function(){
                    i++;
                    if(i==o.length){o.callback(); return;}
                    o.functionToLoop(loop, i);
                }
                loop();//init
            }
            asyncLoop({
                length : result.length,
                functionToLoop : function(loop, i){
                  UserModel.findById(result[i]._id, function(err, userDoc){
                    delete result[i]._id;
                    result[i].user = userDoc;
                    loop();
                  });
                },
                callback : function(){
                    mainCallback(result);
                }
            });

        });

      });

  };

  this.rankingPosition = function(user, mainCallback){

    // Get all sells
    TradeModel.aggregate(
      { $match: { 'type' : 'Sell', active : true }},
      { $group: {
        _id: "$owner",
        balance: { $sum: { $multiply: [ "$price", "$amount" ] } }
      }},
      function (sellErr, sellRes) {
        if (sellErr)
          return console.log(sellErr);

        // Get all purchases
        TradeModel.aggregate(
          { $match: { 'type' : 'Buy', active : true }},
          { $group: {
            _id: "$owner",
            balance: { $sum: { $multiply: [ "$price", "$amount", -1 ] } }
          }},
          function (buyErr, buyRes) {
            if (buyErr)
              return console.log(buyErr);

            // Join purchases with sells
            var transactionsSum = sellRes.concat(buyRes);

            // Group purchases and sells (sells - purchases)
            // Sort results by balance
            var result = transactionsSum.reduce(function(res, obj) {
                if (!(obj._id in res))
                    res.__array.push(res[obj._id] = obj);
                else
                    res[obj._id].balance += obj.balance;
                return res;
            }, {__array:[]}).__array
              .sort(function(a,b) { return b.balance - a.balance; });

            // Get user position
            var position = null;
            for (var i = 0; i < result.length; i++) {
                 if (result[i]._id.equals(user._id)) {
                    position = i+1;
                    break;
                 }
             }
             mainCallback(position);

        });

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

    var thisController = this;
    thisController.totalSells(user, function(totalSell){
        thisController.totalPurchases(user, function(totalBuy){
          callback(totalSell - totalBuy);
        });
      });

  };

  this.stats = function(user, callback){

    var thisController = this;
    thisController.totalSells(user, function(totalSell){
        thisController.totalPurchases(user, function(totalBuy){
              callback({
                'totalSells': totalSell,
                'totalPurchases': totalBuy
              });
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
