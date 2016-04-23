'use strict';

// Product Model

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
  code: {
    type: String,
    required: true,
    trim: true
  },
  name : String,
  description : String,
  tokens : Number,
  created_at: Date,
  updated_at: Date,
});

ProductSchema.pre('save', function(next){

  var now = new Date();
  this.updated_at = now;

  if ( !this.created_at )
    this.created_at = now;

  next();

});

module.exports = mongoose.model('Product', ProductSchema);
