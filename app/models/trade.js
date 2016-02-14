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
  created: {
    type: Date,
    default: Date.now
  },
  reference: {
    type: Schema.ObjectId,
    ref: 'Trade'
  },
});

TradeSchema.virtual('totalPrice').get(function() {
    return this.amount * this.price;
});

module.exports = mongoose.model('Trade', TradeSchema);
