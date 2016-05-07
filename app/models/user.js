// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var UserSchema = mongoose.Schema({

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
    created_at: Date,
    updated_at: Date,

});


function parseTokens (p) {
  return parseInt(p) || 0;
}


UserSchema.pre('save', function(next){

  var now = new Date();
  this.updated_at = now;

  if ( !this.created_at )
    this.created_at = now;

  next();

});


/* Virtuals */
UserSchema.virtual('publicInfo')
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
module.exports = mongoose.model('User', UserSchema);
