'use strict';

// List of Trending Topics

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var StockModel   = require('./stock');

// Trends Model
var TrendsSchema = new Schema({
  woeid : Number,
  list : [mongoose.Schema.Types.Mixed],
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
 * Statics
 */
TrendsSchema.statics = {
  load: function(id, cb) {
    this.findOne({
      _id: id
    }).populate('owner', 'username').exec(cb);
  },
  getNewestStoredTT: function(cb){
    this.findOne()
      .sort('-created')
      .exec(cb);
  },
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Trends', TrendsSchema);
