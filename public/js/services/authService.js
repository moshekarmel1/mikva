angular.module('mikva').factory('authService', ['$http', '$window', function($http, $window){
    var auth = {};
    //save jwt token in local storage
    auth.saveToken = function (token){
        $window.localStorage['mikva-token'] = token;
    };
    //get jwt token from local storage
    auth.getToken = function (){
        return $window.localStorage['mikva-token'];
    }
    //is the user logged in?
    auth.isLoggedIn = function(){
        var token = auth.getToken();
        if(token){
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };
    //get current user
    auth.currentUser = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.username;
        }
    };
    //register route
    auth.register = function(user){
        return $http.post('/register', user);
    };
    //login route
    auth.logIn = function(user){
        return $http.post('/login', user);
    };

    auth.logOut = function(){
        $window.localStorage.removeItem('mikva-token');
    };

    return auth;
}]);
