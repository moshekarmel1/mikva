angular.module('mikva').controller('AccountCtrl', ['flowService', 'authService', '$scope',
function(flowService, authService, $scope){
    $scope.events = [];
    $scope.addNew = false;
    $scope.todaysEvents = [];

    flowService.getFlows().then(function(res){
        console.log(res);
        $scope.flows = res.data || [];
        $scope.populateEvents();
    });

    $scope.populateEvents = function(){
      $scope.flows.forEach(function(flow){
          $scope.events.push({
              date: new Date(flow.sawBlood),
              title: 'Flow Start' + ((flow.beforeSunset) ? ' (before sunset)' : ' (after sunset)'),
              status: 'red'
          });
          $scope.events.push({
              date: new Date(flow.mikva),
              title: 'Mikva Night',
              status: 'green'
          });
          $scope.events.push({
              date: new Date(flow.hefsek),
              title: 'Hefsek Tahara',
              status: 'yellow'
          });
          $scope.events.push({
              date: new Date(flow.day30),
              title: 'Day 30',
              status: 'lightblue'
          });
          $scope.events.push({
              date: new Date(flow.day31),
              title: 'Day 31',
              status: 'lightblue'
          });
      });
      $scope.dt = $scope.dt.setHours(0,0,0,0);
    };

    $scope.onSelect = function(dt){
        $('#dateModal').modal();
        dt = new Date(dt).setHours(0,0,0,0);
        $scope.todaysEvents = $scope.events.filter(function(event){
            return event.date.setHours(0,0,0,0) === dt;
        });
    };

    $scope.add = function(){
        $scope.addNew = true;
    };

    $scope.close = function(){
        $scope.addNew = false;
        $('#dateModal').modal('hide');
    };

    $scope.addFlow = function(beforeSunset){
        flowService.createFlow({
            date: $scope.dt,
            beforeSunset: beforeSunset
        }).then(function(res){
            if(res.status === 201){
                toastr.success('Flow saved successfully.');
                $scope.close();
                $scope.flows.push(res.data);
                $scope.populateEvents();
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
       showWeeks: true
   };

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
