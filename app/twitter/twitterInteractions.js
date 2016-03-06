/*
 * twitterInteractions.js
 *
 * Twitter interactions
 *
 */

var configAuth  = require('../../config/auth');
var configGeneral  = require('../../config/config');

var Twit = require('twit');
var clientTwitter = new Twit({
  consumer_key        : configAuth.twitterAuth.consumerKey,
  consumer_secret     : configAuth.twitterAuth.consumerSecret,
  access_token        : configAuth.twitterAuth.accessTokenKey,
  access_token_secret : configAuth.twitterAuth.accessTokenSecret,
});

module.exports = function(){

  this.postTweet = function(tweet) {

      clientTwitter.post('statuses/update', { status: tweet }, function(err, data, response) {
        if(err) throw err;
      });

  };

  this.getTrendingTopics = function(woeid, callback){

    // Trends location: Yahoo's Where On Earth Id
    // https://developer.yahoo.com/geo/geoplanet/
    clientTwitter.get('trends/place', { 'id' : woeid },
      function(error, result, response) {
        if(error) throw error;

        callback(result[0].trends);

      });
  };

  this.getStream = function(query){

    return clientTwitter.stream('statuses/filter', { track: query });

  };

}
