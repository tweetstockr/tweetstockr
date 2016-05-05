'use strict';

var StockModel = require('./models/stock');
var TrendsModel = require('./models/trends');

module.exports = function() {

  this.getStocksWithHistory = function(callback){

    var stocksWithHistory = [];
    var countProcessed = 0;

    TrendsModel.findOne()
      .sort('-created_at')
      .select('-_id name list')
      .exec(function(err, doc) {

      if (!err) {

        doc.list.forEach(function(item, index){

          // Update or create stock
          StockModel.findOneByName(item.name, function(err, stock){

            if (!err) {
              if (stock) {
                stocksWithHistory.push({
                  'name': stock.name,
                  'price': stock.price,
                  'history': stock.history,
                });
              }
            }

            countProcessed++;

            if (countProcessed === doc.list.length)
              callback(stocksWithHistory);

          });

        });

      }

    });

  };

};
