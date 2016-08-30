angular.module('mikva').controller('NavCtrl', ['authService', '$scope', function(authService, $scope){
  $scope.isLoggedIn = authService.isLoggedIn;
  $scope.currentUser = authService.currentUser;
}]);
