angular.module('mikva').controller('NavCtrl', ['authService', '$state', '$scope', function(authService, $state, $scope){
  $scope.isLoggedIn = authService.isLoggedIn;
  $scope.currentUser = authService.currentUser;
  $scope.logOut = function(){
    authService.logOut();
    $state.go('home');
  }
}]);
