
// db.tournaments.insert([   { 'dateStart' : ISODate('2016-02-08T02:23:28.987Z'), 'rewards':[    {'place':0,'tokens':100},{'place':1,'tokens':50},{'place':2,'tokens':10}   ],'dateEnd' : new Date(Date.now() + (1000*60*5)), 'name' : 'Tournament test 9' } ]);

'use strict';

var UserModel = require('./models/user');

var TournamentModel = require('./models/tournament');

var config = require('../config/config');

module.exports = function() {

  var tournamentController = this;

  // Get live tournaments
  this.getActiveTournaments = function(callback){

    TournamentModel.find({
        'dateStart' : { $lt: Date.now() },
        'dateEnd' : { $gt: Date.now() }
      },
      function(err, tournaments) {
        callback(tournaments);
    });

  };

  // Loop through tournament players and get public info
  this.getTournamentPlayersDetails = function(tournament, callback){

    var topPlayers = tournament.players.slice();
    topPlayers.sort(function(a,b) {
        return a.points - b.points;
    });
    topPlayers.reverse();

    var props = {
      playersCount : topPlayers.length > config.usersOnTournamentRanking ?
                     config.usersOnTournamentRanking : topPlayers.length,
      itemsProcessed : 0,
      players : [],
    };

    if (props.playersCount === 0) callback(null, []);

    for (var i = 0; i < props.playersCount; i++) {
      var playerId = topPlayers[i].user;
      var playerPoints = topPlayers[i].points;

      UserModel.findById(playerId, function(err, docUser){
        props.itemsProcessed++;

        if (err) console.log('ERROR:' + err);
        if (docUser) props.players.push({
          'user' : docUser.publicInfo,
          'points' : playerPoints,
        });

        if(props.itemsProcessed === props.playersCount)
          callback(null, props.players);

      });

    };

  };

  // This is the public listing of tournaments
  // Will return only the top users and also recently finished tournaments
  this.getTournaments = function(callback){

    var props = {
      itemsProcessed : 0,
      tournamentsWithDetails: [],
    };

    TournamentModel.find({},
      function(err, tournaments) {

        tournaments.forEach((tournament, index, array) => {

          tournamentController.getTournamentPlayersDetails(tournament, function(err, playersDetails){
            props.itemsProcessed++;

            if (err) console.log(err);

            props.tournamentsWithDetails.push({
              'dateStart':tournament.dateStart,
              'rewards':tournament.rewards,
              'dateEnd':tournament.dateEnd,
              'name':tournament.name,
              'available':tournament.isActive,
              'processed':tournament.processed,
              'players':playersDetails
            });

            if(props.itemsProcessed === tournaments.length)
              callback(props.tournamentsWithDetails);

          });
      });
    });
  };

  // Get tournaments that the reward was not given and not live
  this.getTournamentsToProcess = function(callback){

    TournamentModel.find({
        'processed' : { $ne: true } ,
        'dateEnd' : { $lt: Date.now()}
      },
      function(err, tournaments) {
        callback(tournaments);
    });

  };

  // Add points user get selling to the tournament points count
  // The Tournament ranking is based on the sum of these points
  this.recordTournamentScore = function(user, roundPoints, callback){

    // This will add points to a Tournament and save the tournament
    function checkTournamentAndSave(tournament, user, roundPoints, callback){

      var player = false;
      // Get tournament user
      // Add user and points to tournament
      for (var i = 0; i < tournament.players.length; i++) {
           if (tournament.players[i].user.equals(user._id)) {
              player = tournament.players[i];
              break;
           }
       }

      // Add user to tournament if he or she is not yet in
      if (player) {
        player.points += roundPoints;
      }
      else{
        tournament.players.push({
           'user' : user._id,
           'points' : roundPoints
         });
      }

      tournament.save(function(err){
        if (err)
          return callback({ success: false, message: err });

        return callback({
          success: true,
          message: 'Tournament score saved',
        });
      });

    };

    tournamentController.getActiveTournaments(function(tournaments){

      var itemsProcessed = 0;
      tournaments.forEach((tournament, index, array) => {

        checkTournamentAndSave(tournament, user, roundPoints, function(response){
          itemsProcessed++;
          if(itemsProcessed === tournaments.length)
            callback(response);

        });
      });
    });

  };

  // This will reward the participants according to the tournament's rewards list
  this.processTournamentEnd = function(tournamentId){

    // Add tokens to player
    function rewardTournamentPlayer(playerId, tokensReward){

      UserModel.findById(playerId, function(err, docUser){
        if (err) console.log('ERROR ' + err);
        else{

          if (!docUser) console.log('ERROR: User not found');
          else{
            docUser.tokens += tokensReward;
            docUser.save(function(err){
              console.log('User successfuly rewarded!');
            });
          }

        }

      });

    };

    // Get updated Tournament data
    TournamentModel.findById(tournamentId, function(err, tournament){
      console.log('Tournament ' + tournament.name + ' ended!');

      var players = tournament.players.slice();
      players.sort(function(a,b) {
          return a.points - b.points;
      });
      players.reverse();

      // Distribute reward to users
      tournament.rewards.forEach((reward, index) => {

        if(players[reward.place] !== undefined) {

          var rewardedUser = players[reward.place];
          console.log(reward.place + ' - ' + rewardedUser.user + ' (with ' + rewardedUser.points + ' points)');
          console.log('    Prize: ' + reward.tokens + ' tokens!' );

          rewardTournamentPlayer(rewardedUser.user, reward.tokens);

        }

      });

      // Mark tournamen as processed
      // (Tournament ended and users have been rewarded)
      tournament.processed = true;
      tournament.save(function(err){

      });

    });

  };

  // Loop through unprocessed tournaments and finish them, rewarding the players
  this.processTournaments = function(){

    // Schedule tournaments end
    tournamentController.getTournamentsToProcess(function(tournaments){
      tournaments.forEach((tournament, index) => {

        // Tournament is ended but not processed. Process it now
        tournamentController.processTournamentEnd(tournament._id);

      });

    });

  };

};
