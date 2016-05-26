(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('marketController', marketController);

  function marketController ($rootScope, $scope, portfolioService, networkService, marketService, CONFIG, Notification, $timeout, $interval) {
    $scope.loading = false;
    $scope.responseReceived = false;
    $scope.chartOptions = { showArea: true };

    $scope.getRound = function(){
      socket.emit('requestRound');
    };
    $scope.getRound();

    $scope.getPortfolio = function(){
      socket.emit('requestPortfolio');
    };
    $scope.getPortfolio();

    $scope.buy = function(){
      socket.emit('requestBuy');
    };

    socket.on('receivePortfolio', function(data){
      $scope.portfolio = data;
      $scope.loading = true;
      $scope.responseReceived = true;
      $scope.stockBtn = false;

      stockDataToChart(data);
    });

    socket.on('receiveRound', function(data){
      $timeout(function() {
        $scope.loading = true;
        $scope.stocks = data.stocks;
        $scope.nextUpdateIn = data.nextUpdateIn;
        $scope.lastUpdate = data.lastUpdate;
        $scope.nextUpdate = data.nextUpdate;
        $scope.roundDuration = data.roundDuration;
        $scope.responseReceived = true;

        initializeClock(data.nextUpdate);
        stockDataToChart(data.stocks);
      });
    });

    function stockDataToChart(stocksArray){
      // Get chart data
      stocksArray.forEach(function(stock, index){
        var chartData = { 'labels' : [], 'series' : [[]] };
        stock.history.forEach(function(item, index){
          var time = new Date(item.created_at);
          var label = time.getHours() + ':' + time.getMinutes();
          chartData.series[0].push(item.price);
          chartData.labels.push(label);
        });
        stock.chartData = chartData;
      });
    }

    // Update Countdown ========================================================
    function getTimeRemaining(endtime) {
      var t = Date.parse(new Date(endtime)) - Date.parse(new Date());

      return {
        'total': t,
        'days': Math.floor(t / (1000 * 60 * 60 * 24)),
        'hours': Math.floor((t / (1000 * 60 * 60)) % 24),
        'minutes': Math.floor((t / 1000 / 60) % 60),
        'seconds': Math.floor((t / 1000) % 60)
      };
    }

    var timeinterval;

    function initializeClock(endtime) {
      clearInterval(timeinterval);
      function updateClock() {
        var t = getTimeRemaining(endtime);

        if (t.total > 0) {
          var timeString = ('0' + t.minutes).slice(-2) + ':' + ('0' + t.seconds).slice(-2);
          $timeout(function() {
            $scope.nextUpdateLabel = timeString;
            $scope.nextUpdatePerc = (t.total / $scope.roundDuration) * 100;
          });
        } else {
          $timeout(function() {
            $scope.nextUpdateLabel = '00:00';
            $scope.nextUpdatePerc = 0;
          });
          clearInterval(timeinterval);
        }
      }

      updateClock();
      timeinterval = setInterval(updateClock, 1000);
    }

    // Game loop ===============================================================

    $scope.sellShare = function(share) {
      $scope.stockBtn = true;

      marketService.sell(share.tradeId,
        function successCallback(response) {
          var audio = document.getElementById('audio2');
          audio.play();
          $scope.getPortfolio();
          Notification.success(response.message);
          $scope.stockBtn = false;
        },
        function errorCallback(response) {
          Notification.error(response.message);
          $scope.stockBtn = false;
        }
      );
    };

    $scope.buyShare = function(name, quantity) {
      $scope.stockBtn = true;

      marketService.buy(name, quantity,
        function successCallback(response) {
          Notification.success(response);
          var audio = document.getElementById('audio');
          audio.play();
          $scope.getPortfolio();
          $scope.stockBtn = false;
        },
        function errorCallback(response) {
          Notification.error(response.message);
          $scope.stockBtn = false;
        }
      );
    };

    $scope.currentTab = 'shares';

    $scope.marketTabs = [{
        title: 'Shares (Buy)'
      , icon: '../icons/shares-icon'
      , url: '../components/shares'
    }, {
        title: 'Portfolio (Sell)'
      , icon: '../icons/portfolio-icon'
      , url: '../components/portfolio'
    }];

    $scope.onClickTab = function (tab) {
      $timeout(function(){
        $scope.currentTab = tab.url;
      });
    }

    $scope.isActiveTab = function(tabUrl) {
      return tabUrl == $scope.currentTab;
    }
  }
})();
