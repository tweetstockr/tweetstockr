// TODO: Add rewards to tournament:
// Like that Rewards: {1:100, 2:50, 3:10}

// TODO: when finished a tournament, give rewards to the players (second currency)

'use strict';

var TournamentModel = require('./models/tournament');

module.exports = function() {

  var tournamentController = this;

  this.getActiveTournaments = function(callback){

    TournamentModel.find({
      'dateStart' : {$lt: Date.now()},
      'dateEnd' : {$gt: Date.now()} },
      function(err, tournaments) {
        callback(tournaments);
    });

  };

  // provisorio
  this.createTournament = function(callback){

    var tournament = new TournamentModel({
      name: 'Tournament A',
      dateStart: "2016-02-08T02:23:28.987Z",
      dateEnd: "2016-02-16T02:23:28.987Z",
    });

    tournament.save(function(err) {
      if (err)
        return callback({ success: false, message: err });

      return callback(tournament);
    });

  };

  this.recordTournamentScore = function(user, roundPoints, callback){

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
          console.log(response);
          itemsProcessed++;
          if(itemsProcessed === tournaments.length) {
            callback(response);
          }
        });
      });
    });


  };

};
