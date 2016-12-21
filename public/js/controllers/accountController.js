angular.module('mikva').controller('AccountCtrl', ['flowService', 'authService', '$scope',
function(flowService, authService, $scope){
    $scope.today = new Date();
    $scope.events = [];
    $scope.addNew = false;
    $scope.todaysEvents = [];

    flowService.getFlows().then(function(res){
        $scope.flows = res.data || [];
        $scope.flows.forEach(function(flow){
            if(flow.diffInDays) flow.diffInDays = Math.round(flow.diffInDays);
        });
        $scope.populateEvents();
        $scope.todaysEvents = $scope.events.filter(function(event){
            return event.date.setHours(0,0,0,0) === new Date().setHours(0,0,0,0);
        });
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
          if(flow.haflaga){
              $scope.events.push({
                  date: new Date(flow.haflaga),
                  title: 'Haflaga (' + flow.diffInDays + ' days)',
                  status: 'lightblue'
              });
          }
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
            toastr.success('Flow saved successfully.');
            $scope.close();
            $scope.flows.push(res.data);
            $scope.populateEvents();
        }, function(err){
            console.error(err);
            toastr.error('Flow did not save. Please try again.');
        });
    };

    $scope.export = function(){
        var A = [['FlowDate', 'HefsekTahara', 'MikvaNight', 'Day30', 'Day31', 'Haflaga', 'DayDifference', 'BeforeSunset']];

        $scope.flows.forEach(function(flow){
            A.push([
                new Date(flow.sawBlood).toDateString(),
                new Date(flow.hefsek).toDateString(),
                new Date(flow.mikva).toDateString(),
                new Date(flow.day30).toDateString(),
                new Date(flow.day31).toDateString(),
                (flow.haflaga) ? new Date(flow.haflaga).toDateString() : 'N/A',
                flow.diffInDays,
                (flow.beforeSunset) ? 'Yes' : 'No'
            ]);
        });

        var csvRows = [];

        for(var i=0, l=A.length; i<l; ++i){
            csvRows.push(A[i].join(','));
        }

        var csvString = csvRows.join("\r\n");

        console.log(csvString);

        var a         = document.createElement('a');
        a.href        = 'data:application/csv;charset=utf-8,' +  encodeURIComponent(csvString);
        a.target      = '_blank';
        a.download    = 'flows.csv';

        document.body.appendChild(a);
        a.click();
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
