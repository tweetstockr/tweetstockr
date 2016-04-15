module.exports = {
	port: process.env.PORT || 4000,
  startingPoints: 10000,
	maxStockChartData: 10,
  usersOnRanking: 100,
	usersOnTournamentRanking: 100,
	roundDuration: 60000,
	clientUrl: process.env.TWEETSTOCKR_CLIENT_URL || 'http://localhost:9000',
	// clientUrl: process.env.TWEETSTOCKR_CLIENT_URL || 'http://localhost:4000/admin' || 'http://localhost:9000',
	homeUrl: process.env.TWEETSTOCKR_HOME_URL || 'http://tweetstockr.com',
	apiUrl: process.env.TWEETSTOCKR_API_URL || 'http://localhost:4000',
	allowedOrigins: process.env.TWEETSTOCKR_ALLOWED_ORIGINS || 'http://play.tweetstockr.com,http://localhost:9000'
};
