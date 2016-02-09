module.exports = {
	port: process.env.PORT || 4000,
  startingPoints: 10000,
	maxStockChartData: 10,
  usersOnRanking: 100,
	refreshTweetsCountRate: 60000,
	clientUrl: process.env.TWEETSTOCKR_CLIENT_URL || 'http://localhost:9000',
	allowedOriginA: process.env.TWEETSTOCKR_ALLOWED_ORIGIN_A || 'http://localhost:9000',
	allowedOriginB: process.env.TWEETSTOCKR_ALLOWED_ORIGIN_B || 'http://localhost:9000',
	apiUrl: process.env.TWEETSTOCKR_API_URL || 'http://localhost:4000'
};
