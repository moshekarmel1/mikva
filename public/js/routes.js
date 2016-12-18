angular.module('mikva').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
        url: '/home',
        templateUrl: '/views/home.html'
    })
    .state('account', {
        url: '/account',
        templateUrl: '/views/account.html',
        controller: 'AccountCtrl'
    })
    .state('flow', {
        url: '/account/:flowId',
        templateUrl: '/views/flow.html',
        controller: 'FlowCtrl'
    });
    $urlRouterProvider.otherwise('home');
}]);
