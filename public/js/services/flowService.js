angular.module('mikva').factory('flowService', ['$http', 'authService', '$window', function($http, authService, $window){
    var flow = {};

    flow.getFlows = function() {
        return $http.get('/flows', {
            headers:{
                Authorization: 'Bearer ' + authService.getToken()
            }
        });
    };

    flow.createFlow = function(flow) {
        return $http.post('/flows', flow, {
            headers: {
                Authorization: 'Bearer ' + authService.getToken()
            }
        });
    };

    return flow;
}]);
