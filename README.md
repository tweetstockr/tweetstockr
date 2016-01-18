# API Documentation

### Current Stocks
Return a JSON with the current Stocks and historical data.
```
GET stocks
```

### Ranking (UNDER DEVELOPMENT)
Return a JSON with a ordered list of the top 100 players with more points.
```
GET ranking
```

### User login
Authenticate with Twitter.
```
GET auth/twitter
```

### User profile
Return JSON with current user's Profile.
```
GET profile
```

### User portfolio (UNDER DEVELOPMENT)
Return JSON with current user's Shares.
```
GET portfolio
```

### Buy Shares
Buys a Share for the current user.
```
POST buy
```
#### Parameters
**stock** : String. Stock name.
**amount** : Number. Number of Shares to buy.

### Sell Shares (UNDER DEVELOPMENT)
Sells current user's Shares of the specified Stock.
```
POST sell
```
#### Parameters
**stock** : String. Stock name.

### Reset
Resets current user's account.
```
POST reset
```

### Logout
Logout current user.
```
GET logout
```
