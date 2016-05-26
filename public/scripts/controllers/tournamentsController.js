(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('tournamentsController', tournamentsController);

  function tournamentsController ($scope, tournamentService) {
    $scope.loading = false;

    tournamentService.getActiveTournaments(
      function onSuccess(response) {
        $scope.tournamentsList = response;
        $scope.loading = true;
      },
      function onError(response) {
        console.log('error: ', JSON.stringify(response));
      }
    );

    $scope.currentTab = '../components/tournaments';

    $scope.tournamentTabs = [{
        title: 'Tournaments'
      , icon: '../icons/shares-icon'
      , url: '../components/tournaments'
    }, {
        title: 'Future Tournaments'
      , icon: '../icons/portfolio-icon'
      , url: '../components/futuretournaments'
    }, {
        title: 'Old Tournaments'
      , icon: '../icons/portfolio-icon'
      , url: '../components/oldtournaments'
    }];

    $scope.onClickTab = function (tab) {
      $scope.currentTab = tab.url;
    }

    $scope.isActiveTab = function(tabUrl) {
      return tabUrl == $scope.currentTab;
    }
  }
})();
