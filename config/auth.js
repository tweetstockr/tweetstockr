// config/auth.js
// expose our config directly to our application using module.exports
module.exports = {

  'twitterAuth' : {
      'consumerKey'        : process.env.TWITTER_CONSUMER_KEY     || 'YE8OioMsfY7HzPEXx4OhHHdHW',
      'consumerSecret'     : process.env.TWITTER_CONSUMER_SECRET  || 'upWLIxUqQQFvPnMktS6YcAChvKiHK1ZxQbmHc2a424ZTdynOji',
      'accessTokenKey'     : process.env.TWITTER_TOKEN_KEY        || '24684905-JBhjaHdsVnmQvjLsV3NPVFJk5EtlVLL7oLju2QJlg',
      'accessTokenSecret'  : process.env.TWITTER_TOKEN_SECRET     || '2tcb4WKMx8JNOErGx9ukqRFhf89FqJMxO47SF4aC4oV2m',
      'callbackURL'        : process.env.TWITTER_CALLBACK_URL     || 'http://localhost:4000/auth/twitter/callback',
  },
  'joysticketAuth' : {
    'appPublicKey' : '9907e08359f1d43e6a0516cc3bfd5c81969b88ad026aedb37f9aa1c6190a06f520160903451018',
    'appSecretKey' : '8ba239615136f9f444047e1c91c2de14ad9ac3d620cdec76d0c46a8c37138aeb20160903451018'
  },

};
