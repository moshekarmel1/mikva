angular.module('mikva').controller('FlowCtrl', ['flowService', '$stateParams', '$scope',
function(flowService, $stateParams, $scope){
    flowService.getFlowById($stateParams.flowId).then(function(res){
        $scope.flow = res.data || [];
        makeDates();
    });

    $scope.updateFlow = function(){
        flowService.updateFlow($scope.flow).then(function(res){
            if(res.data){
                $scope.flow = res.data;
                makeDates();
            }
        });
    };

    function makeDates(){
        $scope.flow.sawBlood = new Date($scope.flow.sawBlood);
        $scope.flow.hefsek = new Date($scope.flow.hefsek);
        $scope.flow.mikva = new Date($scope.flow.mikva);
        $scope.flow.day30 = new Date($scope.flow.day30);
        $scope.flow.day31 = new Date($scope.flow.day31);
        if($scope.flow.haflaga) $scope.flow.haflaga = new Date($scope.flow.haflaga);
    }
}]);
