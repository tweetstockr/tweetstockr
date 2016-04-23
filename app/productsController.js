'use strict';

var ProductModel = require('./models/product');

module.exports = function() {

  this.list = function(callback){

    ProductModel.find()
      .exec(function (err, products) {
        ProductModel.count()
          .exec(function (err, count) {
          callback({
            'count': count,
            'products': products
          });
        })
      });
  };

  this.create = function(data, callback){

    var newProduct = new ProductModel(data);

    newProduct.save(function(err, doc){
      callback(err, doc);
    });

  };

  this.product = function(id, callback){

    ProductModel.findById(id).exec(function(err, c) {
      callback(c);
    });

  };

};
