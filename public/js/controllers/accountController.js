angular.module('mikva').controller('AccountCtrl', ['flowService', 'authService', '$q', '$scope',
    function (flowService, authService, $q, $scope) {
        $scope.now = moment.utc().toDate();
        $scope.events = [];
        $scope.addNew = false;
        $scope.todaysEvents = [];

        function init() {
            $q.all([
                flowService.getFlows(),
                flowService.getStatus()
            ]).then(function (res) {
                $scope.flows = res[0].data || [];
                $scope.flows.forEach(function (flow) {
                    if (flow.diff_in_days) flow.diff_in_days = Math.round(flow.diff_in_days);
                });
                $scope.populateEvents();
                $scope.todaysEvents = $scope.events.filter(function (event) {
                    return moment(event.date).isSame($scope.now, 'day');
                });
                $scope.status = res[1].data;
            });
        }

        init();

        $scope.populateEvents = function () {
            $scope.flows.forEach(function (flow) {
                $scope.events.push({
                    date: moment.utc(flow.saw_blood),
                    title: 'Flow Start' + ((flow.before_sunset) ? ' (before sunset)' : ' (after sunset)'),
                    status: 'red'
                });
                $scope.events.push({
                    date: moment.utc(flow.mikva),
                    title: 'You can go to the Mikva anytime after sunset.',
                    status: 'green'
                });
                $scope.events.push({
                    date: moment.utc(flow.hefsek),
                    title: 'Hefsek Tahara should be done before sunset.',
                    status: 'yellow'
                });
                $scope.events.push({
                    date: moment.utc(flow.day_30),
                    title: 'Day 30',
                    status: 'lightblue'
                });
                $scope.events.push({
                    date: moment.utc(flow.day_31),
                    title: 'Day 31',
                    status: 'lightblue'
                });
                if (flow.haflaga) {
                    $scope.events.push({
                        date: moment.utc(flow.haflaga),
                        title: 'Haflaga (' + flow.diff_in_days + ' days)',
                        status: 'lightblue'
                    });
                }
            });
            $scope.dt = removeTime($scope.dt);
        };

        $scope.onSelect = function (dt) {
            $('#dateModal').modal();
            $scope.dt = moment.utc(dt).toDate();
            $scope.todaysEvents = $scope.events.filter(function (event) {
                return moment(event.date).isSame($scope.dt, 'day');
            });
        };

        $scope.next = function (dt) {
            $scope.dt.setDate($scope.dt.getDate() + 1);
            $scope.dt = moment.utc($scope.dt).toDate();
            $scope.todaysEvents = $scope.events.filter(function (event) {
                return moment(event.date).isSame($scope.dt, 'day');
            });
        };

        $scope.prev = function (dt) {
            $scope.dt.setDate($scope.dt.getDate() - 1);
            $scope.dt = moment.utc($scope.dt).toDate();
            $scope.todaysEvents = $scope.events.filter(function (event) {
                return moment(event.date).isSame($scope.dt, 'day');
            });
        };

        $scope.add = function () {
            $scope.addNew = true;
        };

        $scope.close = function () {
            $scope.addNew = false;
            $('#dateModal').modal('hide');
        };

        $scope.addFlow = function (beforeSunset) {
            console.log($scope.dt);
            flowService.createFlow({
                date: $scope.dt,
                beforeSunset: beforeSunset
            }).then(function (res) {
                toastr.success('Flow saved successfully.');
                $scope.close();
                init();
            }, function (err) {
                toastr.error('Flow did not save. Please try again.');
            });
        };

        $scope.export = function () {
            var A = [['FlowDate', 'HefsekTahara', 'MikvaNight', 'Day30', 'Day31', 'Haflaga', 'DayDifference', 'BeforeSunset']];

            $scope.flows.forEach(function (flow) {
                A.push([
                    moment.utc(flow.saw_blood).format('ddd MMM DD YYYY'),
                    moment.utc(flow.hefsek).format('ddd MMM DD YYYY'),
                    moment.utc(flow.mikva).format('ddd MMM DD YYYY'),
                    moment.utc(flow.day_30).format('ddd MMM DD YYYY'),
                    moment.utc(flow.day_31).format('ddd MMM DD YYYY'),
                    (flow.haflaga) ? moment.utc(flow.haflaga).format('ddd MMM DD YYYY') : 'N/A',
                    flow.diff_in_days,
                    (flow.before_sunset) ? 'Yes' : 'No'
                ]);
            });

            var csvRows = [];

            for (var i = 0, l = A.length; i < l; ++i) {
                csvRows.push(A[i].join(','));
            }

            var csvString = csvRows.join("\r\n");

            var a = document.createElement('a');
            a.href = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csvString);
            a.target = '_blank';
            a.download = 'flows.csv';

            document.body.appendChild(a);
            a.click();
        };


        $scope.today = function () {
            $scope.dt = moment.utc().toDate();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };

        $scope.options = {
            customClass: getDayClass,
            showWeeks: true
        };

        $scope.setDate = function (year, month, day) {
            $scope.dt = moment(`${year}-${month}-${day}`).utc().toDate();
        };

        function getDayClass(data) {
            const date = data.date;
            const mode = data.mode;
            if (mode === 'day') {
                const arr = [];
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);
                    if (dayToCheck === currentDay) {
                        arr.push($scope.events[i].status);
                    }
                }
                arr.sort((a, b) => {
                    if (a === 'red') return -1;
                    return a.localeCompare(b)
                });
                return arr[0];
            }
            return '';
        }
    }]);

function removeTime(date) {
    return moment.utc(date).toDate();
}