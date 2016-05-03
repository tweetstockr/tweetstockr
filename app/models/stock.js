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

// create the model for users and expose it to our app
module.exports = mongoose.model('Stock', StockSchema);
