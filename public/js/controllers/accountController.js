angular.module('mikva').controller('AccountCtrl', ['flowService', 'authService', '$q', '$scope',
function(flowService, authService, $q, $scope){
    $scope.now = new Date();
    $scope.events = [];
    $scope.addNew = false;
    $scope.todaysEvents = [];
    
    function init(){
      $q.all([
        flowService.getFlows(),
        flowService.getStatus()
      ]).then(function(res){
          $scope.flows = res[0].data || [];
          $scope.flows.forEach(function(flow){
              if(flow.diffInDays) flow.diffInDays = Math.round(flow.diffInDays);
          });
          $scope.populateEvents();
          $scope.todaysEvents = $scope.events.filter(function(event){
              return moment(event.date).isSame($scope.now, 'day');
          });
          $scope.status = res[1].data;
      });
    }

    init();

    $scope.populateEvents = function(){
      $scope.flows.forEach(function(flow){
          $scope.events.push({
              date: new Date(flow.sawBlood),
              title: 'Flow Start' + ((flow.beforeSunset) ? ' (before sunset)' : ' (after sunset)'),
              status: 'red'
          });
          $scope.events.push({
              date: new Date(flow.mikva),
              title: 'You can go to the Mikva anytime after sunset.',
              status: 'green'
          });
          $scope.events.push({
              date: new Date(flow.hefsek),
              title: 'Hefsek Tahara should be done before sunset.',
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
      $scope.dt = removeTime($scope.dt);
    };

    $scope.onSelect = function(dt){
        $('#dateModal').modal();
        $scope.dt = new Date(dt);
        $scope.todaysEvents = $scope.events.filter(function(event){
            return moment(event.date).isSame($scope.dt, 'day');
        });
    };

    $scope.next = function(dt){
        $scope.dt.setDate($scope.dt.getDate() + 1);
        $scope.dt = new Date($scope.dt);
        $scope.todaysEvents = $scope.events.filter(function(event){
            return moment(event.date).isSame($scope.dt, 'day');
        });
    };

    $scope.prev = function(dt){
        $scope.dt.setDate($scope.dt.getDate() - 1);
        $scope.dt = new Date($scope.dt);
        $scope.todaysEvents = $scope.events.filter(function(event){
            return moment(event.date).isSame($scope.dt, 'day');
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
            init();
        }, function(err){
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

function removeTime(date){
    return new Date(new Date(date).setHours(0,0,0,0));
}