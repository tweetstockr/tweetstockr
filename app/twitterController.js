/*
 *  twitterController.js
 *
 *  Turns the streaming on
 *  After 1 minute of streaming, restart it
 *
 */

'use strict';


module.exports = function(server) {

  var refreshTweetsCountRate = 60000; // Interval to wait before update Tweets count
  var TwitterStream = require('./twitter/twitterStream');

  var twitterStream = new TwitterStream(server);

  twitterStream.startTwitterStream();

  // Get counted Tweets and store in the database
  var tweetCounter = setInterval(function() {

    twitterStream.startTwitterStream();

  }, refreshTweetsCountRate);


  this.getStocks = function(){
    return twitterStream.stocks();
  }

};
