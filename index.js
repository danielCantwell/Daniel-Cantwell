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
        .otherwise({
            redirectTo: '/about'
        });
});

app.controller('controller', function ($scope, $firebase, $firebaseObject, $firebaseArray, FIREBASE_URL) {

    var ref = new Firebase(FIREBASE_URL);
    var racesRef = ref.child('races');

    var r1 = {
        name: "Coveskipper Aquathlon",
        date: "2014-10-24",
        overall: "34:18",
        swim: "12:47",
        bike: "--:--",
        run: "21:31"
    };

    // racesRef.push(r1); 


    $scope.races = $firebaseArray(racesRef);

    // $(document).ready(function(){
    //     $('#racelist').on('click', 'a', function() {
    //         console.log('click');
    //         $(this).next('section').toggle();
    //     });
    // });

    // var prevItem = null;
    // $scope.toggleul = function($event) {
    //     var e = $($event.currentTarget);

    //     if (prevItem != e) {
    //         e.next('section').hide();
    //     } else {
    //         e.next('section').show();
    //     }

    //     prevItem = e;

    //     return false;
    // }

    // , $firebase, $firebaseObject, $firebaseArray, FIREBASE_URL

    // $scope.terms = false;
    // $scope.pledgeTaken = false;

    // var ref = new Firebase(FIREBASE_URL);
    // var pledgesRef = ref.child('pledges');

    // $scope.pledges = $firebaseArray(pledgesRef);

    // var updateCount = function() {
    //     countRef = ref.child('viewCount');
    //     countRef.once("value", function(snapshot) {
    //         var count = snapshot.val();
    //         count++;
    //         countRef.set(count);
    //     }, function(error) {
    //         console.log("Count Read Failed");
    //     });
    // }
    // updateCount();

    // $scope.takePledge = function() {

    //     if ($scope.pledgeForm.$invalid || !$scope.termscheck) {
    //         console.log("inavlid");
    //         return;
    //     }

    //     var pledgesRef = ref.child('pledges');

    //     var first = $scope.firstname;
    //     var last = $scope.lastname;
    //     var em = $scope.email;
    //     var zip = $scope.zip;

    //     var pledge = {
    //         firstname : first,
    //         lastname : last,
    //         email: em,
    //         zip: zip
    //     }

    //     $scope.pledgeTaken = true;
    //     pledgesRef.push(pledge);

    //     $('#pledge').hide();
    //     $('#pledgeinfoScrollButton').attr("href", "#pledgelist");
    //     $('#mobilePledgeInfoScrollButton').attr("href", "#pledgelist");
    // }
});