module.exports = {
	port: process.env.PORT || 4000,
  startingPoints: 100,
	maxStockChartData: 10,
  usersOnRanking: 100,
	usersOnTournamentRanking: 50,
	roundDuration: 60000,
	clientUrl: process.env.TWEETSTOCKR_CLIENT_URL || 'http://localhost:4000/play',
	homeUrl: process.env.TWEETSTOCKR_HOME_URL || 'http://tweetstockr.com',
	apiUrl: process.env.TWEETSTOCKR_API_URL || 'http://localhost:4000/api',
	sessionSecret : process.env.TWEETSTOCKR_SESSION_SECRET || 'whatsthenextrend',
	sessionKey : process.env.TWEETSTOCKR_SESSION_KEY || 'tweetstockr.sid'
};
