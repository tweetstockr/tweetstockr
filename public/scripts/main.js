'use strict';

var socket = io();

angular
  .module('tweetstockr', ['ngRoute', 'angular-chartist', 'ui-notification', 'ordinal'])
  .constant('CONFIG', {
    apiUrl: '/api'
  })
  .config(function ($routeProvider, $locationProvider, NotificationProvider) {
    $routeProvider
    .when('/market', {
      templateUrl: '/views/play/pages/market',
      controller: 'marketController'
    })

    .when('/shop', {
      templateUrl: '/views/play/pages/shop',
      controller: 'shopController'
    })

    .when('/ranking', {
      templateUrl: '/views/play/pages/ranking',
      controller: 'rankingController'
    })

    .when('/tournaments', {
      templateUrl: '/views/play/pages/tournaments',
      controller: 'tournamentsController'
    })

    .when('/profile', {
      templateUrl: '/views/play/pages/profile',
      controller: 'profileController'
    })

    .otherwise({
      redirectTo: '/market'
    });

    NotificationProvider.setOptions({
        delay: 1000
      , startTop: 20
      , startRight: 10
      , verticalSpacing: 20
      , horizontalSpacing: 20
      , positionX: 'right'
      , positionY: 'top'
    });
  });
