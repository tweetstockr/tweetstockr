'use strict';

var socket = io();

angular
  .module('tweetstockr', ['ngRoute', 'angular-chartist', 'ui-notification', 'ordinal'])
  .constant('CONFIG', {
    apiUrl: '/api'
  })
  .config(function ($routeProvider, $locationProvider, NotificationProvider) {
    $routeProvider
    .when('/play/market', {
      templateUrl: 'pages/market.html',
      controller: 'marketController'
    })

    .when('/play/shop', {
      templateUrl: 'pages/shop.html',
      controller: 'shopController'
    })

    .when('/play/ranking', {
      templateUrl: 'pages/ranking.html',
      controller: 'rankingController'
    })

    .when('/play/tournaments', {
      templateUrl: 'pages/tournaments.html',
      controller: 'tournamentsController'
    })

    .when('/play/profile', {
      templateUrl: 'pages/profile.html',
      controller: 'profileController'
    })

    .otherwise({
      redirectTo: 'play/market'
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
