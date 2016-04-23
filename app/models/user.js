// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String,
        profile_image: String,
        profile_image_normal:String
    },
    joysticket : {
      id : String,
      username : String,
      firstName : String,
      lastName : String,
      profile_image : String
    },
    tokens: {
      type: Number,
      get: parseTokens
    },
    created: {
      type: Date,
      default: Date.now
    },

});


function parseTokens (p) {
  return parseInt(p) || 0;
}

/* Virtuals */
userSchema.virtual('publicInfo')
  .get(function () {
    return {
      'username': this.twitter.username,
      'name': this.twitter.displayName,
      'tokens': this.tokens,
      'profile_image': this.twitter.profile_image,
      'profile_image_normal': this.twitter.profile_image_normal
    };
  });


// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
