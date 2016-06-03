(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .filter('dateFilter', dateFilter);

  function parseDate(input) {
    var parts = input.split('-');

    return new Date(parts[2], parts[1] - 1, parts[0]);
  }

  function dateFilter() {
    return function(items, type, from, to) {
      var dateFrom = parseDate(from);
      var dateTo = parseDate(to);
      var arrayToReturn = [];
      var currentDay = new Date();

      for (var i = 0; i < items.length; i++) {
        var tournamentDateStart = new Date(items[i].dateStart)
          , tournamentDateEnd = new Date(items[i].dateEnd);

        if(type === 'futureTournaments') {
          if(tournamentDateStart > currentDay) {
            arrayToReturn.push(items[i]);
          } else {
          }
        } else if(type === 'activeTournaments') {
          if(tournamentDateStart < currentDay && tournamentDateEnd > currentDay) {
            arrayToReturn.push(items[i]);
          }
        } else if(type === 'expiredTournaments') {
          if(tournamentDateEnd < currentDay) {
            arrayToReturn.push(items[i]);
          }
        }
      }

      return arrayToReturn;
    }
  }
})();
