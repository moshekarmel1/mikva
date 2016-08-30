angular.module('mikva').controller('MainCtrl', ['authService', '$scope',
function(authService, $scope){
  $scope.isLoggedIn = authService.isLoggedIn;
}]);
