# API Documentation

### Current Stocks
Return a JSON with the current Stocks and historical data.
```
GET stocks
```

### Ranking
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

### User portfolio
Return JSON with current user's Shares.
```
GET portfolio
```

### Trading

#### Buy Shares
Buys a Share for the current user.
```
POST trade/buy
```
##### Parameters
**stock** : String. Stock name.
**amount** : Number. Number of Shares to buy.

#### Sell Shares
Sells current user's Shares of the specified Stock.
```
POST trade/sell
```
##### Parameters
**trade** : Trade ID.

### Reset
Resets current user's account.
```
POST reset
```

### Logout
Logout current user.
```
POST logout
```
