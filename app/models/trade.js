'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TradeSchema = new Schema({
  active: {
    type: Boolean,
    default: true
  },
  stock: {
    type: String,
    index: true,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    default: 1
  },
  price: {
    type: Number,
    default: 0
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
  },
  reference: {
    type: Schema.ObjectId,
    ref: 'Trade'
  },
  created_at: Date,
  updated_at: Date,
});

TradeSchema.pre('save', function(next){

  var now = new Date();
  this.updated_at = now;

  if ( !this.created_at )
    this.created_at = now;

  next();

});

TradeSchema.virtual('totalPrice').get(function() {
    return this.amount * this.price;
});

module.exports = mongoose.model('Trade', TradeSchema);
