angular.module('mikva').controller('FlowCtrl', ['flowService', '$state', '$stateParams', '$scope',
function(flowService, $state, $stateParams, $scope){
    flowService.getFlowById($stateParams.flowId).then(function(res){
        $scope.flow = res.data || [];
        makeDates();
    });

    $scope.updateFlow = function(){
        flowService.updateFlow($scope.flow).then(function(res){
            if(res.data){
                $scope.flow = res.data;
                makeDates();
                toastr.success('Flow updated successfully!');
            }
        }, function(err){
            console.error(err);
            toastr.error('Flow update failed. Please try again.');
        });
    };

    $scope.delete = function(flow){
        $scope.modalFlow = flow;
        $('#deleteModal').modal();
    };

    $scope.deleteFlow = function(){
        flowService.deleteFlow($scope.modalFlow).then(function(res){
            toastr.success('Deleted successfully!');
            $('#deleteModal').modal('hide');
            $state.go('account');
        }, function(err){
            toastr.error('Flow was not deleted, please try again.');
        });
    };

    function makeDates(){
        $scope.flow.saw_blood = new Date($scope.flow.saw_blood);
        $scope.flow.hefsek = new Date($scope.flow.hefsek);
        $scope.flow.mikva = new Date($scope.flow.mikva);
        $scope.flow.day_30 = new Date($scope.flow.day_30);
        $scope.flow.day_31 = new Date($scope.flow.day_31);
        if($scope.flow.haflaga) $scope.flow.haflaga = new Date($scope.flow.haflaga);
    }
}]);
