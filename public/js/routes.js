angular.module('mikva').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
        url: '/home',
        templateUrl: '/views/home.html',
        controller: 'MainCtrl'
    });
    $urlRouterProvider.otherwise('home');
}]);
