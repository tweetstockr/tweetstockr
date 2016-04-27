'use strict';

// This is the Stock itself
// One trending topic is one Stock

// eg.
// name: #CalaBocaVoceVotouNaDilma
// price: 829
// date: Wed Sep 23 2015 09:37:38 GMT-0300 (BRT)

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config/config');

// Stock Model
var StockSchema = new Schema({
  name: {
    type: String
  },
  price: {
    type: Number
  },
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
StockSchema.statics = {
  getNewestByName: function(stockName, cb) {
    this.findOne({name:stockName})
      .sort({created:-1})
      .exec(cb);
  },
  getLastPrices: function(stockName, cb) {
    this.find({name:stockName})
      .sort({created:-1})
      .limit(config.maxStockChartData)
      .exec(cb);
  },
  cleanOlderEntries: function(stockName) {

    var currentModel = this;
    this.count({name:stockName}, function( err, count){
      // remove every entry but the most recent ones
      if (count > config.maxStockChartData + 1) {
        var removeQuantity = count - config.maxStockChartData;
        currentModel.find({name:stockName})
          .sort({created:1})
          .limit(removeQuantity - 1)
          .exec(function(err, stocksToRemove){
            var ids = stocksToRemove.map(function(s) { return s._id; });
            currentModel.remove({_id: {$in: ids}}).exec();
          });
        }
    });
  }
};


// create the model for users and expose it to our app
module.exports = mongoose.model('Stock', StockSchema);
