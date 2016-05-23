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

    $scope.currentTab = '/views/components/tournaments';

    $scope.tournamentTabs = [{
        title: 'Tournaments'
      , icon: '/views/icons/shares-icon'
      , url: '/views/components/tournaments'
    }, {
        title: 'Future Tournaments'
      , icon: '/views/icons/portfolio-icon'
      , url: '/views/components/futuretournaments'
    }, {
        title: 'Old Tournaments'
      , icon: '/views/icons/portfolio-icon'
      , url: '/views/components/oldtournaments'
    }];

    $scope.onClickTab = function (tab) {
      $scope.currentTab = tab.url;
    }

    $scope.isActiveTab = function(tabUrl) {
      return tabUrl == $scope.currentTab;
    }
  }
})();
