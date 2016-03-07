'use strict';

var UserModel = require('./models/user');

var config = require('../config/config');

module.exports = function() {

  var shopController = this;

  var products = [
    {
      'code' : '100JOYSTICKETS',
      'name' : '100 Tickets',
      'description' : '100 Joysticket Tickets. You need to be logged with your Joysticket account.',
      'tokens' : 100 ,
      'action' : function(){ shopController.exchangeForTickets(100); }
    },
    {
      'code' : '200JOYSTICKETS',
      'name' : '200 Tickets',
      'description' : '200 Joysticket Tickets. You need to be logged with your Joysticket account.',
      'tokens' : 200,
      'action' : function(){ shopController.exchangeForTickets(200); }
    }
  ];

  this.getProducts = function(){

    var productsCopy = products.slice(0);
    productsCopy.forEach(function(v){ delete v.action });

    return productsCopy;

  };

  this.exchange = function(user, code, callback){

    // Get Product
    var productArray = products.filter(function( obj ) {
      return obj.code == code;
    });
    if (!productArray[0])
      return callback({ success: false, message: 'Product not found.' });

    var currentProduct = productArray[0];

    // Get user
    UserModel.findById(user._id, function(err, docUser){

      if (err)
        return callback({ success: false, message: err });

      if (!docUser)
        return callback({ success: false, message: 'User not found' });

      // Check tokens
      if (docUser.tokens >= currentProduct.tokens) {

        // Remove tokens from players and save
        docUser.tokens -= currentProduct.tokens;

        docUser.save(function(err){
          if (err)
            return callback({ success: false, message: err });

          // Execute action
          currentProduct.action();

          return callback({
            success: true,
            message: 'You have purchased ' + currentProduct.name + '!'
          });

        });

      }

      return callback({
        success: false,
        message: 'You must have at least ' + currentProduct.tokens + ' tokens!'
      });

    });

  };

  this.exchangeForTickets = function(tickets){

    console.log('Joysticket API > you bought ' + tickets + ' Tickets!');

  };

};
