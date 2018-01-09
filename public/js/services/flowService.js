angular.module('mikva').factory('flowService', ['$http', 'authService', '$window', function($http, authService, $window){
    var flow = {};

    flow.getFlows = function() {
        return $http.get('/flows', {
            headers:{
                Authorization: 'Bearer ' + authService.getToken()
            }
        });
    };

     flow.getStatus = function() {
        return $http.get('/status', {
            headers:{
                Authorization: 'Bearer ' + authService.getToken()
            }
        });
    };

    flow.getFlowById = function(id) {
        return $http.get('/flows/' + id, {
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

    flow.updateFlow = function(flow) {
        return $http.put('/flows/' + flow._id, flow, {
            headers: {
                Authorization: 'Bearer ' + authService.getToken()
            }
        });
    };

    flow.deleteFlow = function(flow) {
        return $http.delete('/flows/' + flow._id, {
            headers: {
                Authorization: 'Bearer ' + authService.getToken()
            }
        });
    };

    return flow;
}]);
