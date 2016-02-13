
// db.tournaments.insert([   { 'dateStart' : ISODate('2016-02-08T02:23:28.987Z'), 'rewards':[    {'place':0,'tokens':100},{'place':1,'tokens':50},{'place':2,'tokens':10}   ],'dateEnd' : new Date(Date.now() + (1000*60*5)), 'name' : 'Tournament test 9' } ]);

// TODO: when turning on the server, get not computed tournaments

'use strict';

var UserModel = require('./models/user');

var TournamentModel = require('./models/tournament');
var schedule = require('node-schedule');

module.exports = function() {

  var tournamentController = this;
  var scheduledJobs = [];

  this.getActiveTournaments = function(callback){

    TournamentModel.find({
      'dateStart' : {$lt: Date.now()},
      'dateEnd' : {$gt: Date.now()} },
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
          if(itemsProcessed === tournaments.length) {
            callback(response);
          }
        });
      });
    });


  };

  this.startTournaments = function(){

      // Schedule tournaments end
      tournamentController.getActiveTournaments(function(tournaments){
        tournaments.forEach((tournament, index) => {

          // This will happen when a tournament ends
          var j = schedule.scheduleJob(tournament.dateEnd, function(){

            // Get updated Tournament data
            TournamentModel.findById(tournament._id, function(err, updatedTournament){

              console.log('Tournament ' + updatedTournament.name + ' ended!');
              console.log('Results:');

              var players = updatedTournament.players.slice();
              players.sort(function(a,b) {
                  return a.points - b.points;
              });
              players.reverse();

              updatedTournament.rewards.forEach((reward, index) => {

                if(players[reward.place] !== undefined) {

                  var rewardedUser = players[reward.place];

                  console.log('     ' + reward.place + ' - ' + rewardedUser.user + ' (with ' + rewardedUser.points + ' points)');
                  console.log('            Prize: ' + reward.tokens + ' tokens!' );

                  UserModel.findById(rewardedUser.user, function(err, docUser){
                    if (err) console.log('ERROR ' + err);
                    else{
                      if (!docUser) console.log('ERROR: User not found');
                      else{
                        docUser.tokens += reward.tokens;
                        docUser.save(function(err){
                          console.log('User successfuly rewarded!');
                        });
                      }

                    }

                  });
                }

              });

            });


          });
          scheduledJobs.push(j);
        });

      });

  };


};
