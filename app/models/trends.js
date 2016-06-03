'use strict';

// List of Trending Topics

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var StockModel   = require('./stock');

// Trends Model
var TrendsSchema = new Schema({
  woeid : Number,
  list : [{
    tweet_volume : Number,
    query : String,
    name : String,
  }],
  created_at: Date,
  updated_at: Date,
});


TrendsSchema.pre('save', function(next){

  var now = new Date();
  this.updated_at = now;

  if ( !this.created_at )
    this.created_at = now;

  next();

});

/**
 * Methods
 */
TrendsSchema.statics.findMostRecent = function findMostRecent(cb) {
  return this.findOne()
            .sort('-created_at')
            .select('-_id')
            .exec(cb);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Trends', TrendsSchema);
