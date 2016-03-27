// config/auth.js
// expose our config directly to our application using module.exports

module.exports = {
  'twitterAuth' : {
      'consumerKey'        : process.env.TWITTER_CONSUMER_KEY,
      'consumerSecret'     : process.env.TWITTER_CONSUMER_SECRET,
      'accessTokenKey'     : process.env.TWITTER_TOKEN_KEY,
      'accessTokenSecret'  : process.env.TWITTER_TOKEN_SECRET,
      'callbackURL'        : process.env.TWITTER_CALLBACK_URL,
  },
  'joysticketAuth' : {
    'appPublicKey' : process.env.JOYSTICKET_PUBLIC_KEY,
    'appSecretKey' : process.env.JOYSTICKET_SECRET_KEY
  },
};
