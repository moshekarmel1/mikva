angular.module('mikva').controller('MainCtrl', ['authService', '$location', '$state', '$stateParams', '$scope',
function(authService, $location, $state, $stateParams, $scope){
  $scope.isLoggedIn = authService.isLoggedIn;
  if(location.search && location.search.split('=').length){
    var queryParams = location.search.split('=');
    if(queryParams[0] === '?token'){
      authService.saveToken(queryParams[1]);
      location.search = '';
      $state.go('account');
    }
  }
}]);
