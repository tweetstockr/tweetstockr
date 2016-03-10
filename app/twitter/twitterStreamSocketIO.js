/*
 *  twitterStream.js
 *
 *  Stream Twitter with current Trending Topics
 *  Count Tweets while streaming
 *  Send updated Tweets count to client and update Mongo documents
 *
 */

var StockModel  = require('../models/stock');
var twitterTrendingTopics = require('./twitterTrendingTopics');

var configAuth  = require('../../config/auth');
var configGeneral  = require('../../config/config');

var clientTwitter  = null; // Twitter API client
var currentTrends  = []; // The current Trending Topics (being created)
var lastTrends     = []; // The last count (ready)
var lastUpdateDate = Date.now();
var nextUpdateDate = lastUpdateDate + configGeneral.roundDuration;

module.exports = function(server){

  var io = require('socket.io')(server);
  io.set('origins', configGeneral.allowedOriginA + ' ' + configGeneral.allowedOriginB);
  io.set('transports', [ 'websocket', 'flashsocket', 'polling' ] );

  io.on('connection', function (socket) {
      // console.log('User connected!');
      // When the user connect, send updated data
      socket.on('update-me', function() {
        io.emit('update', lastTrends);
        io.emit('update-date', {
          'lastUpdate' : lastUpdateDate,
          'nextUpdate' : nextUpdateDate,
          'nextUpdateIn' : nextUpdateDate - Date.now(),
          'roundDuration' : configGeneral.roundDuration,
        });
      });
  });


  this.stocks = function() {
    return lastTrends;
  }


  // Count Tweets!
  // Get lastest TTs list and serch for terms in Twitter stream
  this.startTwitterStream = function() {

    this.resetTwitterStream();
    this.sendListToClient();

    // Find updated Trends list from Twitter or mongo
    twitterTrendingTopics.getUpdatedTrendsList(function(err, trends) {

      if(err) return console.error(err);

      // Please wait for the first count of tweets
      if(!trends) return console.log('Please, wait until the next Tweet count.');

      // Clone the Trends
      var trendsObj = JSON.parse(JSON.stringify(trends));

      // No recent Trending Topics returned from Twitter
      if(!trendsObj.list) return console.log('No recent Trending Topics returned from Twitter.');

      // Get only the Trending Topics' name and create a string ----------------
      var search = [];
      for(var i = 0; i < trendsObj.list.length; i++)
        search.push(trendsObj.list[i].name);

      var streamQuery = search.join(',');
      // -----------------------------------------------------------------------

      // Copy and prepare current Trends array ---------------------------------
      currentTrends = JSON.parse(JSON.stringify(trendsObj.list));
      for(var i = 0; i < currentTrends.length; i++)
        currentTrends[i].count = 0;
      // -----------------------------------------------------------------------

      // Starting Twitter Stream -----------------------------------------------
      console.log('Starting Twitter Stream...');

      var stream = clientTwitter.stream('statuses/filter', { track: streamQuery });

      // Receives a new Tweet
      stream.on('tweet', function(tweet) {

        if(tweet.text) {
          // Iterate through Trending Topics
          // Search word in Tweet text and update Tweets count
          for(var key in currentTrends) {
            var n = tweet.text.search( currentTrends[key].name );
            if(n !== -1) currentTrends[key].count ++;
          }
        }

      });

      stream.on('error', function(error) {
        console.log(error);
      });


    });

  }


  // Init/Reset Twitter client
  this.resetTwitterStream = function() {

    var Twit = require('twit');
    clientTwitter = new Twit({
      consumer_key        : configAuth.twitterAuth.consumerKey,
      consumer_secret     : configAuth.twitterAuth.consumerSecret,
      access_token        : configAuth.twitterAuth.accessTokenKey,
      access_token_secret : configAuth.twitterAuth.accessTokenSecret,
    });

  }


  // Get the trends and fetch the price and price history
  // then update the lastTrends list
  this.sendListToClient = function() {

    // console.log('-- Last Trends with count: ' + JSON.stringify(currentTrends));

    twitterTrendingTopics.getUpdatedTrendsList(function(err, trends) {

      if(err) return console.log(err);

      // Please wait for the first count of tweets
      if(!trends) return console.log('Please, wait until the next Tweet count');

      // Clone the Trends
      var trendsObj = JSON.parse(JSON.stringify(trends));

      // No recent Trending Topics returned from Twitter
      if(!trendsObj.list) return console.log('No recent Trending Topics returned from Twitter');

      var tt = [];
      var stocksWithPrice = 0;

      // Iterate through Trending Topics and get last price
      for(var i = 0; i < trendsObj.list.length; i++) {
        var stockName = trendsObj.list[i].name;

        // Push to array empty TT with count
        tt.push({ name : stockName, price : 0, history : [] });

        // For each stock, get last computed prices
        StockModel.getLastPrices(stockName, function(err, stocks) {
          stocksWithPrice++;

          // If prices history were found, update TT ---------------------------
          if(stocks.length) {

            // Search for TT in list and update prices
            for(var i2 = 0; i2 < tt.length; i2++) {
              if(tt[i2].name === stocks[0].name) {

                // Get historcal price data for charts
                var priceHistory = [];
                for(var i3 = 0; i3 < stocks.length; i3++) {
                  priceHistory.push({
                    price : stocks[i3].price || 0,
                    created : stocks[i3].created
                  });
                }

                tt[i2].price = stocks[0].price || 0;
                tt[i2].history = priceHistory;
                break;
              }
            }

          }
          //--------------------------------------------------------------------

          if(stocksWithPrice === trendsObj.list.length) {

            // All TTs were updated with recent counts
            // console.log('-- Sending new values to client');

            lastTrends = JSON.parse(JSON.stringify(tt));
            lastUpdateDate = Date.now();
            nextUpdateDate = Date.now() + configGeneral.roundDuration;

            io.emit('update', lastTrends);
            io.emit('update-date', {
              'lastUpdate' : lastUpdateDate,
              'nextUpdate' : nextUpdateDate,
              'nextUpdateIn' : configGeneral.roundDuration,
              'roundDuration' : configGeneral.roundDuration,
            });

          }

        });
      }
    });

    this.saveTrendsCount();

  }

  // Save an updated count
  this.saveTrendsCount = function(){

    for(var key in currentTrends) {
      // Save stock to database
      var newStockModel = new StockModel({
        name: currentTrends[key].name
      , price: currentTrends[key].count
      , date: lastUpdateDate
      });

      newStockModel.save(function(err, newStockModel) {
        if(err) console.error(err);
        StockModel.cleanOlderEntries(newStockModel.name);
      });

      // Reset count
      currentTrends[key].count = 0;
    }

  }


}