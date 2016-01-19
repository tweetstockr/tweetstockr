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
    points: {
      type: Number,
      get: parsePoints
    },
    created: {
      type: Date,
      default: Date.now
    },

});


function parsePoints (p) {
  return parseInt(p) || 0;
}

/* Virtuals */
userSchema.virtual('user_info')
  .get(function () {
    return {
      '_id': this._id,
      'username': this.twitter.username,
      'name': this.twitter.displayName,
      'points': this.points,
      'picture': this.twitter.profile_image,
      'picture_thumb': this.twitter.profile_image_normal,
    };
  });


// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
