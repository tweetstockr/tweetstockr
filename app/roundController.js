/*
 *  roundController.js
 *
 *  Turns the streaming on and process tournaments
 *  After 1 minute of streaming, restart it
 *
 */

'use strict';

var config = require('../config/config');
var TwitterStream = require('./twitter/twitterStream');
var TournamentController = require('./tournamentController');
var UsersController = require('./usersController');
var StocksController = require('./stocksController');
var TradeModel = require('./models/trade');
var moment = require('moment');
var Twitter = require('./twitter/twitterInteractions');

module.exports = function(onRoundFinish) {

  var twitterStream = new TwitterStream();
  var tournamentController = new TournamentController();
  var usersController = new UsersController();
  var stocksController = new StocksController();

  function roundProcess(){
    twitterStream.startTwitterStream(function(roundData){
      stocksController.getStocksWithHistory(function(dataWithHistory){

        onRoundFinish({
          'stocks' : dataWithHistory,
          'nextUpdateIn' : roundData.nextUpdateIn,
          'lastUpdate' : roundData.lastUpdate,
          'nextUpdate' : roundData.nextUpdate,
          'roundDuration' : roundData.roundDuration,
        });

      });
    });
    tournamentController.processTournaments();

    // Check if there is a trade from yesterday
    var start = moment().startOf('day');
    TradeModel.find({ "created_at": { "$lt": start }}, function(err, docs){
      if (err) console.log(err);
      else if (docs.length) restartMarket();
    });
  }

  roundProcess();

  // Get counted Tweets and store in the database
  var round = setInterval(function() {
    roundProcess();
  }, config.roundDuration);


  this.getStocks = function(){
    return {
      stocks: twitterStream.stocks()
    };
  };

  this.getRound = function(callback){
    var round = twitterStream.round();
    stocksController.getStocksWithHistory(function(dataWithHistory){
      callback({
        'stocks' : dataWithHistory,
        'nextUpdateIn' : round.nextUpdateIn,
        'lastUpdate' : round.lastUpdate,
        'nextUpdate' : round.nextUpdate,
        'roundDuration' : round.roundDuration,
      });
    });
  };

  // reset all users
  function restartMarket(){

    // Get all users
    usersController.listAllIds(function(docs){

      // Create RESET trades to insert
      var tradesArray = [];
      var now = new Date();
      for (var i = 0; i < docs.length; i++) {
        tradesArray.push(new TradeModel({
            stock: '_RESET',
            price: config.startingPoints,
            amount: 1,
            owner: docs[i]._id,
            type: 'Sell',
            updated_at: now,
            created_at: now,
          })
        );
      }

      // Remove all trades
      TradeModel.remove({}, function(err){
        if (err) console.log(err);
        else{
          // Trades removed. Add reset trade for all users
          TradeModel.insertMany(tradesArray, function(err) {
            if (err) console.log(err);
            else {
              console.log('Market was restarted.');
              var yesterdatString = moment().add(-1,'day').format('MMM Do[,] YYYY');
              var twitter = new Twitter();
              twitter.postTweet(yesterdatString + ' market is closed! Let\'s start trading again!');
            }
          });
        }

      });

    });

  };

};
