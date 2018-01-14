angular.module('mikva').controller('LoginCtrl', ['authService', '$state', '$scope',
function(authService, $state, $scope){
  $scope.login = function(){
    if(!$scope.username || !$scope.password
      || !$scope.username.trim() || !$scope.password.trim()){
      toastr.warning('Please enter all fields.');
      return;
    }
    authService.logIn({
      username: $scope.username,
      password: $scope.password
    }).then(function(res){
      if(res.data.token){
        authService.saveToken(res.data.token);
        toastr.success('Logged in!');
        $state.go('account');
      }
    }, function(err){
      if(err.data && err.data.message){
        toastr.error(err.data.message);
      }else{
        toastr.error('Something went wrong, please try again...');
      }
    });
  };

  $scope.register = function(){
    if(!$scope.username || !$scope.password
      || !$scope.username.trim() || !$scope.password.trim()){
      toastr.warning('Please enter all fields.');
      return;
    }
    authService.register({
      username: $scope.username,
      password: $scope.password
    }).then(function(res){
      if(res.data.token){
        authService.saveToken(res.data.token);
        toastr.success('Logged in!');
        $state.go('account');
      }
    }, function(err){
      if(err.data && err.data.message){
        toastr.error(err.data.message);
      }else{
        toastr.error('Something went wrong, please try again...');
      }
    });
  };
}]);