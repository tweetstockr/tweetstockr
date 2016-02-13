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

module.exports = function(server) {

  var twitterStream = new TwitterStream(server);
  var tournamentController = new TournamentController();

  function roundProcess(){
    twitterStream.startTwitterStream();
    tournamentController.processTournaments();
  }

  roundProcess();

  // Get counted Tweets and store in the database
  var round = setInterval(function() {
    roundProcess();
  }, config.roundDuration);


  this.getStocks = function(){
    return twitterStream.stocks();
  }

};
