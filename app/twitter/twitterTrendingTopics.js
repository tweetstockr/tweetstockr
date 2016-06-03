/*
 *  twitterTrendingTopics.js
 *
 *  Gets the updated Trending Topics list from Twitter
 *  Twitter limits the search in 5 minutes intervals
 *
 */

var TrendsModel = require('../models/trends');

var refreshTrendsRate = 5 * 60000; // Interval to wait before update Trends list
var woeid = 1; // TT location id: 1 = location worldwide, 23424768 = BR

var Twitter = require('./twitterInteractions');

// Updates the Trending Topics list
exports.getUpdatedTrendsList = function(cb) {

  // It can only be called once in [refreshTrendsRate] due to Twitter API limitation
  var nowMinusRequestLimitMinutes = new Date(new Date() - refreshTrendsRate);

  TrendsModel.find(
    { 'created_at' : { '$gte' : nowMinusRequestLimitMinutes, '$lt' : new Date() } },
    function (err, results) {

      if(err) return console.error(err);

      // No update in the last 5 minutes, so... update it!
      if(!results.length) {

        var clientTwitter = new Twitter();
        clientTwitter.getTrendingTopics(woeid, function(resultTrends){

            //Store trends on database
            var newTrends = new TrendsModel({
              woeid : woeid,
              list : [],
            });

            for (var i = 0; i < resultTrends.length; i++) {
              newTrends.list.push({
                'tweet_volume' : resultTrends[i].tweet_volume,
                'query' : resultTrends[i].query,
                'name' : resultTrends[i].name,
              });
            }

            newTrends.save(function(err, newTrends) {
              // Trends list updated!
              cb(err, newTrends);
            });
        });
      }
      // Updated on the las 5 minutes, get last one from mongo
      else{
        TrendsModel.findOne()
          .sort('-created')
            .exec(function(err, trends) {
              // console.log('-- TTs list fetched from Mongo: ' + JSON.stringify(trends));
              cb(err, trends);
        });
      }
    }
  );

}
