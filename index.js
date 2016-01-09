var app = angular.module('app', ['ngRoute', 'firebase', 'angular.filter']);

app.constant('FIREBASE_URL', 'https://daniel-cantwell.firebaseio.com');

app.config(function($routeProvider) {
    $routeProvider
        .when('/about', {
            templateUrl: 'views/about.html'
        })
        .when('/tri', {
            templateUrl: 'views/tri.html'
        })
        .when('/work', {
            templateUrl: 'views/work.html'
        })
        .when('/contact', {
            templateUrl: 'views/contact.html'
        })
        .when('/addrace', {
            templateUrl: 'views/addrace.html'
        })
        .otherwise({
            redirectTo: '/about'
        });
});

app.controller('controller', function ($scope, $firebase, $firebaseObject, $firebaseArray, FIREBASE_URL, $window) {

    var ref = new Firebase(FIREBASE_URL);
    var racesRef = ref.child('races');

    $scope.races = $firebaseArray(racesRef);
    $scope.races.$loaded().then(function(races) {
        $scope.racecount = races.length;
    });

    $scope.addRace = function(n, d, o, s, b, r, p) {

        $.post( "api/add-race", { racename: n, date: d, overall: o, swim: s, bike: b, run: r, password: p }, function(data) {
            var result = JSON.parse(data);
            console.log(result.status);

            if (result && result.status == 200) {
                console.log("Upload Successful")
                $window.location.href = '/#/tri';
            } else {
                console.log("Upload Failed")
                console.log(data);
            }
        });
    }

    $scope.toggleMenu = function() {
        $('#menu').toggleClass('hidden');
        $('#menu').toggleClass('open');
    }

    $('#menu').on('click', 'a', function() {
        $scope.toggleMenu();
    });
});