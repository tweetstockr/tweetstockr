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
      templateUrl: 'pages/market',
      controller: 'marketController'
    })

    .when('/shop', {
      templateUrl: 'pages/shop',
      controller: 'shopController'
    })

    .when('/ranking', {
      templateUrl: 'pages/ranking',
      controller: 'rankingController'
    })

    .when('/tournaments', {
      templateUrl: 'pages/tournaments',
      controller: 'tournamentsController'
    })

    .when('/profile', {
      templateUrl: 'pages/profile',
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
