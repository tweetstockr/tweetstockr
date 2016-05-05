'use strict';

// This is the Stock itself
// One trending topic is one Stock

// eg.
// name: #CalaBocaVoceVotouNaDilma
// history.price: 829
// history.created_at: Wed Sep 23 2015 09:37:38 GMT-0300 (BRT)

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config/config');

// Stock Model
var StockSchema = new Schema({
  name: String,
  history: [{
    price: Number,
    created_at: {
      type: Date,
      default: Date.now,
    }
  }],
  created_at: Date,
  updated_at: Date,
});

StockSchema.pre('save', function(next){

  var now = new Date();
  this.updated_at = now;

  if ( !this.created_at )
    this.created_at = now;

  next();

});

/**
 * Statics
 */
StockSchema.virtual('price').get(function() {

  var mostRecent = 0;
  var price = 0;
  var tmp;
  for (var i = 0; i < this.history.length; i++) {
    tmp = this.history[i].created_at;
    if (tmp > mostRecent){
      mostRecent = tmp;
      price = this.history[i].price;
    }
  }

  return price;
});

/**
 * Methods
 */
StockSchema.statics.findOneByName = function findOneByName(name, cb) {
  return this.findOne({'name':name}, cb);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Stock', StockSchema);
