angular.module('mikva').controller('AccountCtrl', ['flowService', 'authService', '$q', '$scope',
    function (flowService, authService, $q, $scope) {
        $scope.now = new Date();
        $scope.events = [];
        $scope.addNew = false;
        $scope.todaysEvents = [];
        $scope.dateMap = {};
        $scope.isLoaded = false;

        function removeTime(d) {
            d.setHours(0, 0, 0, 0);
            return d;
        }

        function removeTimeZone(d) {
            d.setTime(d.getTime() + d.getTimezoneOffset() * 60000);
            return d;
        }

        function init() {
            $scope.isLoaded = false;
            $scope.flows = [];
            $scope.status = null;
            $scope.todaysEvents = [];
            $scope.dateMap = {};
            $q.all([
                flowService.getFlows(),
                flowService.getStatus()
            ]).then(function (res) {
                $scope.flows = res[0].data || [];
                $scope.flows.forEach(function (flow) {
                    if (flow.diff_in_days) flow.diff_in_days = Math.round(flow.diff_in_days);
                });
                $scope.populateEvents();
                $scope.todaysEvents = $scope.dateMap[new Date().toISOString().split('T')[0]];
                $scope.status = res[1].data;
                $scope.isLoaded = true;
            });
        }

        init();

        $scope.populateEvents = function () {
            $scope.flows.forEach(function (flow) {
                $scope.events.push({
                    date: new Date(flow.saw_blood),
                    title: 'Flow Start' + ((flow.before_sunset) ? ' (before sunset)' : ' (after sunset)'),
                    status: 'red'
                });
                $scope.events.push({
                    date: new Date(flow.hefsek),
                    title: 'Hefsek Tahara should be done before sunset.',
                    status: 'yellow'
                });
                $scope.events.push({
                    date: new Date(flow.mikva),
                    title: 'You can go to the Mikva anytime after sunset.',
                    status: 'green'
                });
                $scope.events.push({
                    date: new Date(flow.day_30),
                    title: 'Day 30',
                    status: 'lightblue'
                });
                $scope.events.push({
                    date: new Date(flow.day_31),
                    title: 'Day 31',
                    status: 'lightblue'
                });
                if (flow.haflaga) {
                    $scope.events.push({
                        date: new Date(flow.haflaga),
                        title: 'Haflaga (' + flow.diff_in_days + ' days)',
                        status: 'lightblue'
                    });
                }
            });
            for (let evt of $scope.events) {
                let key = evt.date.toISOString().split('T')[0];
                if (!$scope.dateMap[key]) $scope.dateMap[key] = [];
                $scope.dateMap[key].push(evt);
            }
        };

        $scope.onSelect = function (dt) {
            $('#dateModal').modal();
            $scope.dt = dt;
            $scope.todaysEvents = $scope.dateMap[$scope.dt.toISOString().split('T')[0]];
        };

        $scope.next = function (dt) {
            $scope.dt.setDate($scope.dt.getDate() + 1);
            $scope.todaysEvents = $scope.dateMap[$scope.dt.toISOString().split('T')[0]];
        };

        $scope.prev = function (dt) {
            $scope.dt.setDate($scope.dt.getDate() - 1);
            $scope.todaysEvents = $scope.dateMap[$scope.dt.toISOString().split('T')[0]];
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
                    new Date(flow.saw_blood).toDateString(),
                    new Date(flow.hefsek).toDateString(),
                    new Date(flow.mikva).toDateString(),
                    new Date(flow.day_30).toDateString(),
                    new Date(flow.day_31).toDateString(),
                    (flow.haflaga) ? new Date(flow.haflaga).toDateString() : 'N/A',
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
            const d = removeTime(new Date());
            $scope.dt = removeTimeZone(d);
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
            let d = new Date(year, month, day, 0, 0, 0, 0);
            removeTimeZone(d);
            $scope.dt = d;
        };

        function getDayClass(data) {
            const date = data.date;
            const mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = removeTime(new Date(date));
                const arr = $scope.dateMap[dayToCheck.toISOString().split('T')[0]] || [];
                if (arr.length === 0) return '';
                arr.sort((a, b) => {
                    if (a.status === 'red') return -1;
                    return a.status.localeCompare(b.status);
                });
                return arr[0].status;
            }
            return '';
        }
    }]);