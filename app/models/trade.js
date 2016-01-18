'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TradeSchema = new Schema({
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
  created: Date
});

/**
 * Pre hook.
 */
TradeSchema.pre('save', function(next, done){
  if (this.isNew) {
    this.created = Date.now();
  }
  next();
});

module.exports = mongoose.model('Trade', TradeSchema);
