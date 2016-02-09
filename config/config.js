module.exports = {
	port: process.env.PORT || 4000,
  startingPoints: 10000,
	maxStockChartData: 10,
  usersOnRanking: 100,
	refreshTweetsCountRate: 60000,
	clientUrl: process.env.TWEETSTOCKR_CLIENT_URL || 'http://localhost:9000',
	landingUrl: process.env.TWEETSTOCKR_LANDING_URL || 'http://localhost:9000',
	apiUrl: process.env.TWEETSTOCKR_API_URL || 'http://localhost:4000'
};
