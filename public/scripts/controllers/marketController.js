(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('marketController', marketController);

  function marketController ($rootScope, $scope, portfolioService, networkService, marketService, CONFIG, Notification, $timeout, $interval) {

    $scope.loading = false;
    $scope.responseReceived = false;
    $scope.currentTab = 'SHARES';
    $scope.chartOptions = { showArea: true };

    $scope.getRound = function(){
      socket.emit('requestRound');
    };
    $scope.getRound();

    $scope.buy = function(){
      socket.emit('requestBuy');
    };

    $scope.onClickTab = function (tab) {
      $scope.currentTab = tab;
    };

    $scope.isActiveTab = function (tab) {
      return $scope.currentTab === tab;
    };

    socket.on('receiveRound',function(data){

      console.log(data);

      $timeout(function() {

        $scope.loading = true;
        $scope.stocks = data.stocks;
        $scope.nextUpdateIn = data.nextUpdateIn;
        $scope.lastUpdate = data.lastUpdate;
        $scope.nextUpdate = data.nextUpdate;
        $scope.roundDuration = data.roundDuration;
        initializeClock(data.nextUpdate);

        // Get chart data
        data.stocks.forEach(function(stock, index){
          var chartData = { 'labels' : [], 'series' : [[]] };
          stock.history.forEach(function(item, index){
            var time = new Date(item.created_at);
            var label = time.getHours() + ':' + time.getMinutes();
            chartData.series[0].push(item.price);
            chartData.labels.push(label);
          });
          stock.chartData = chartData;
        });

        $scope.responseReceived = true;

      });

    });

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
        },
        function errorCallback(response) {
          Notification.error(response.message);
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
        },
        function errorCallback(response) {
          Notification.error(response.message);
        }
      );
    };

    $scope.getPortfolio = function () {
      // portfolioService.getPortfolio(
      //   function onSuccess(data) {
      //     $scope.portfolio = data;
      //
      //     for (var i = 0; i < $scope.portfolio.length; i++) {
      //       var portfolio = $scope.portfolio[i];
      //       // var dataLenght = portfolio.history.length;
      //       var chartData = {};
      //       chartData.labels = [];
      //       chartData.series = [[]];
      //       //
      //       // for (var j = dataLenght-1; j >= 0; j--) {
      //       //   var time = new Date(portfolio.history[j].created_at);
      //       //   var label = time.getHours() + ':' + time.getMinutes();
      //       //
      //       //   chartData.series[0].push(portfolio.history[j].price);
      //       //   chartData.labels.push(label);
      //       // }
      //
      //       portfolio.chartData = chartData;
      //     }
      //
      //     $scope.responseReceived = true;
      //     $scope.loading = true;
      //     $scope.stockBtn = false;
      //   },
      //   function onError(data) {
      //     Notification.error(data.message);
      //     console.log('Portfolio Error: ' + data.message);
      //   }
      // );
    };
  }
})();
