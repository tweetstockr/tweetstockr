/*
 *  twitterStream.js
 *
 *  Stream Twitter with current Trending Topics
 *  Count Tweets while streaming
 *  Send updated Tweets count to client and update Mongo documents
 *
 */

var StockModel  = require('../models/stock');
var Twitter = require('./twitterInteractions');

var twitterTrendingTopics = require('./twitterTrendingTopics');
var configGeneral  = require('../../config/config');
var currentTrends  = []; // The current Trending Topics (being created)
var lastTrends = []; // The ready-for-use Trending Topics with price

var lastUpdateDate = Date.now();
var nextUpdateDate = lastUpdateDate + configGeneral.roundDuration;

module.exports = function(server){

  this.stocks = function(){
    return lastTrends;
  };

  this.round = function(){
    return {
      stocks : lastTrends,
      lastUpdate : lastUpdateDate,
      nextUpdate : nextUpdateDate,
      nextUpdateIn : nextUpdateDate - Date.now(),
      roundDuration : configGeneral.roundDuration,
    };
  }

  // Count Tweets!
  // Get lastest TTs list and serch for terms in Twitter stream
  this.startTwitterStream = function() {

    // Save counted tweets of the previous round as Stocks
    this.saveTweetsAsStocks();

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

      var clientTwitter = new Twitter();
      var stream = clientTwitter.getStream(streamQuery);

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

  // Save trends count as stocks
  this.saveTweetsAsStocks = function(){

    var itemsProcessed = 0;
    var currentTrendsCopy = JSON.parse(JSON.stringify(currentTrends));
    currentTrends = [];

    function finishLoop(){
      // All stocks were saved with updated price
      itemsProcessed++;
      if (itemsProcessed === currentTrendsCopy.length){
        lastTrends = currentTrendsCopy;
        lastUpdateDate = Date.now();
      }
    }

    currentTrendsCopy.forEach(function(item, index){

      // Update or create stock
      StockModel.findOne({'name' : item.name})
        .exec(function(err, stock){
          if(err) finishLoop();
          else{

            if (!stock) {
              stock = new StockModel({
                name : item.name,
                history : []
              });
            }
            stock.history.push({ 'price':item.count });
            stock.save(function(err, stock){ finishLoop() });

          }
        });
    });

  }

}
