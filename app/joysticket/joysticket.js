/*jslint node: true */
'use strict';

var crypto  = require('crypto');
var request = require('request');

function Joysticket(options, callback){

  this.options = options || {};
  this.options.joysticketURL = this.options.joysticketURL || 'https://joysticket.com/api/v2/';

}

/**
 * Single authentication headers
 */
Joysticket.prototype.prepareSingle = function(){
  return {
    'Authorization' : new Buffer(this.options.publicKey).toString('base64'),
    'UrlCallback'   : this.options.urlCallback,
    'User-Agent'    : 'request'
  };
};

/**
 * Double authentication headers
 */
Joysticket.prototype.prepareDouble = function(userId){
  var b64 = this.options.publicKey + ':' + userId;
  var sha = this.options.secretKey + ':' + userId;

  var b64Hash = new Buffer(b64).toString('base64');
  var shaHash = crypto.createHash('sha256').update(sha, 'utf8').digest();

  return {
    'Authorization' : b64Hash + ':' + shaHash,
    'UrlCallback'   : this.options.urlCallback,
    'User-Agent'    : 'request'
  };
};

/**
 * Creates a connection to Joysticket and returns the URL to redirect the user.
 * @param callback  A callback function with two parameters:
                    err - The error message if something goes wrong
                    url - The URL to redirect the user to for login
 */
Joysticket.prototype.makeAuthRequest = function(callback){

    // Sets single authentication header
    var options = {
      url : this.options.joysticketURL + 'authorization?web',
      headers : this.prepareSingle()
    };

    console.log(options);
    // Connects to Joysticket
    request(options, function(err, res, body){
      // Error treatment
      if(err) return callback(err, null);
      if(res.statusCode > 400){
        return callback(new Error('Wrong credentials'), null);
      }

      var urlRedirect = JSON.parse(body).url;
      return callback(null, urlRedirect);
    });

};

/**
 * Creates a connection to Joysticket and returns the public user profile.
 * @param userId    The app user ID, retrieved from the authentication route.
 * @param callback  A callback function with two parameters:
                    err - The error message if something goes wrong
                    prf - The user profile
 */
Joysticket.prototype.getUserProfile = function(userId, callback){
  // Sets single authentication header
  var options = {
    url : this.options.joysticketURL + 'profile?user=' + userId
  };
  request(options, function(err, res, body){
    // Error treatment
    if(err) return callback(err, null);
    if(res.statusCode > 400){
      return callback(new Error('Wrong credentials'), null);
    }

    var profile = JSON.parse(body);
    return callback(null, profile);
  });
};

module.exports = Joysticket;
