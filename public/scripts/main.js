(function() {
  'use strict';

  angular
    .module('tweetstockr', ['ngRoute', 'angular-chartist', 'ui-notification', 'ordinal'])
    .constant('CONFIG', {
      apiUrl: ''
    })
    .config(function (NotificationProvider) {

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
})();
