'use strict';

var TournamentModel = require('./models/tournament');

module.exports = function() {

  this.count = function(callback){

    TournamentModel.count().exec(function(err, c) {
      callback(c);
    });

  };

  this.tournament = function(id, callback){

    TournamentModel.findById(id).exec(function(err, c) {
      callback(c);
    });

  };

  this.update = function(id, update, callback){

    TournamentModel.update({'_id':id}, update, {}, function(err, doc){
      callback(doc);
    });

  };

  this.list = function(callback){

    TournamentModel.find()
      .exec(function (err, tournaments) {
        TournamentModel.count()
          .exec(function (err, count) {
          callback({
            'count': count,
            'tournaments': tournaments
          });
        })
      });
  };

  this.create = function(data, callback){

    var newTournament = new TournamentModel(data);

    newTournament.save(function(err, doc){
      callback(err, doc);
    });

  };

};
