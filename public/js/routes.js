angular.module('mikva').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
        url: '/home',
        templateUrl: '/views/home.html'
    })
    .state('login', {
        url: '/login',
        templateUrl: '/views/login.html',
        controller: 'LoginCtrl'
    })
    .state('register', {
        url: '/register',
        templateUrl: '/views/register.html',
        controller: 'LoginCtrl'
    });
    $urlRouterProvider.otherwise('home');
}]);
