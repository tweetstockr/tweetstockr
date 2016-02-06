/*
 *  twitterController.js
 *
 *  Turns the streaming on
 *  After 1 minute of streaming, restart it
 *
 */

'use strict';

var config = require('../config/config');
var TwitterStream = require('./twitter/twitterStream');

module.exports = function(server) {

  var twitterStream = new TwitterStream(server);

  twitterStream.startTwitterStream();

  // Get counted Tweets and store in the database
  var tweetCounter = setInterval(function() {

    twitterStream.startTwitterStream();

  }, config.refreshTweetsCountRate);


  this.getStocks = function(){
    return twitterStream.stocks();
  }

};
