(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('headerController', headerController);

  function headerController ($rootScope, $scope, userService, Notification) {

    socket.on('errorMessage',function(data){
      Notification.error(response.message);
    });
    socket.on('successMessage',function(data){
      Notification.success(response.message);
    });


    $rootScope.updateCurrentUser = function () {
      userService.getProfile(
        function onSuccess(response) {
          $rootScope.username = response.user.twitter.displayName;
          $rootScope.joysticket = response.user.joysticket;

          if(response.user.joysticket) {
            $rootScope.joyUser = response.user.joysticket.username;
          } else {
            $rootScope.joyUser = false;
          }

          $rootScope.twitterUser = response.user.twitter.username;
          $rootScope.balance = response.balance;
          $rootScope.ranking = response.ranking;

          if(response.user.tokens == undefined) {
            $rootScope.tokens = 0;
          } else {
            $rootScope.tokens = response.user.tokens;
          }

          // These are not being used yet...
          $rootScope.profileImage = response.user.twitter.profile_image;
          $rootScope.profileImageThumb = response.user.twitter.profile_image_normal;
          $rootScope.twitterUrl = 'https://twitter.com/' + response.user.twitter.username;
        },
        function onError(data) {
          console.log('Error: ' + data.message);
        }
      );
    };

    $rootScope.updateCurrentUser();
  }
})();
