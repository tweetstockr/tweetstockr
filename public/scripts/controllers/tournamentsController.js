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

    $scope.currentTab = '/views/components/tournaments.html';

    $scope.tournamentTabs = [{
        title: 'Tournaments'
      , icon: '/views/icons/shares-icon.html'
      , url: '/views/components/tournaments.html'
    }, {
        title: 'Future Tournaments'
      , icon: '/views/icons/portfolio-icon.html'
      , url: '/views/components/futuretournaments.html'
    }, {
        title: 'Old Tournaments'
      , icon: '/views/icons/portfolio-icon.html'
      , url: '/views/components/oldtournaments.html'
    }];

    $scope.onClickTab = function (tab) {
      $scope.currentTab = tab.url;
    }

    $scope.isActiveTab = function(tabUrl) {
      return tabUrl == $scope.currentTab;
    }
  }
})();
