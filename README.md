# api



# API Documentation

### Current Stocks
Return a JSON with the current Stocks and historical data.
```
GET /stocks
```

### Ranking **(UNDER DEVELOPMENT)**
Return a JSON with a ordered list of the top 100 Users with more points.
```
GET /ranking
```

### User login
Authenticate with Twitter.
```
GET /auth/twitter
```

### User portfolio **(UNDER DEVELOPMENT)**
Return JSON with current User's Shares.
```
GET /portfolio
```

### Buy Shares **(UNDER DEVELOPMENT)**
Buys a Share for the current User.
```
POST /buy
```
#### Parameters
**stock** : String. Stock name.
**amount** : Number. Number of Shares to buy.

### Sell Shares **(UNDER DEVELOPMENT)**
Sells current User's Shares of the specified Stock.
```
POST /sell
```
#### Parameters
**stock** : String. Stock name.
