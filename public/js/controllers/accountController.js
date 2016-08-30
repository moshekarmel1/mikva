angular.module('mikva').controller('AccountCtrl', ['flowService', 'authService', '$scope',
function(flowService, authService, $scope){
    $scope.events = [];
    flowService.getFlows().then(function(res){
      console.log(res);
      $scope.flows = res.data || [];
      $scope.flows.forEach(function(flow){
        $scope.events.push({
          date: new Date(flow.sawBlood),
          status: 'red'
        });
        $scope.events.push({
          date: new Date(flow.mikva),
          status: 'green'
        });
        $scope.events.push({
          date: new Date(flow.hefsek),
          status: 'orange'
        });
        $scope.events.push({
          date: new Date(flow.day30),
          status: 'yellow'
        });
        $scope.events.push({
          date: new Date(flow.day31),
          status: 'yellow'
        });
      });
    });

  $scope.addFlow = function(beforeSunset){
    flowService.createFlow({
      date: new Date(),
      beforeSunset: beforeSunset
    }).then(function(res){
      if(res.status === 201){
        toastr.success('Flow saved successfully.');
        $scope.flows.push(res.data);
      }
    }, function(err){
      console.error(err);
    });
  };



  $scope.today = function() {
   $scope.dt = new Date();
 };
 $scope.today();

 $scope.clear = function() {
   $scope.dt = null;
 };

 $scope.options = {
   customClass: getDayClass,
   minDate: new Date(),
   showWeeks: true
 };

 // Disable weekend selection
 function disabled(data) {
   var date = data.date,
     mode = data.mode;
   return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
 }

 $scope.toggleMin = function() {
   $scope.options.minDate = $scope.options.minDate ? null : new Date();
 };

 $scope.toggleMin();

 $scope.setDate = function(year, month, day) {
   $scope.dt = new Date(year, month, day);
 };

 function getDayClass(data) {
   var date = data.date,
     mode = data.mode;
   if (mode === 'day') {
     var dayToCheck = new Date(date).setHours(0,0,0,0);

     for (var i = 0; i < $scope.events.length; i++) {
       var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

       if (dayToCheck === currentDay) {
         return $scope.events[i].status;
       }
     }
   }

   return '';
 }
}]);
