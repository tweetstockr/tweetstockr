'use strict';

// Tournament Model

// Contains users and points accumulated on tournament

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TournamentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dateStart: {
    type: Date,
    default: Date.now
  },
  dateEnd: {
    type: Date,
    default: Date.now
  },
  rewards: [{
    place: {
      type: Number,
      default: 0
    },
    tokens: {
      type: Number,
      default: 0
    },
  }],
  players: [{
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    points: {
      type: Number,
      default: 0
    },
  }],
  processed: {
    type: Boolean,
    default: false
  },
  created_at: Date,
  updated_at: Date,
});


TournamentSchema.pre('save', function(next){

  var now = new Date();
  this.updated_at = now;

  if ( !this.created_at )
    this.created_at = now;

  next();

});

TournamentSchema.virtual('isActive').get(function() {
    return (this.dateStart > Date.now && this.dateEnd < Date.now);
});

module.exports = mongoose.model('Tournament', TournamentSchema);
