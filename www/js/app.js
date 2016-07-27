// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ionic-datepicker', 'ionic-toast','starter.controllers', 'starter.services'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })
  .constant('$ionicLoadingConfig', {
    template: '<ion-spinner icon="bubbles" class="spinner-balanced"></ion-spinner>',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  })
  .directive('hideTabs', function ($rootScope) {
    return {
      restrict: 'A',
      link: function (scope, element, attributes) {
        scope.$on('$ionicView.beforeEnter', function () {
          scope.$watch(attributes.hideTabs, function (value) {
            $rootScope.hideTabs = value;
          });
        });
        scope.$on('$ionicView.beforeLeave', function () {
          $rootScope.hideTabs = false;
        });
      }
    };
  })

  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('bottom');

    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');

    $ionicConfigProvider.platform.ios.backButton.previousTitleText('返回').icon('ion-ios-arrow-back');
    $ionicConfigProvider.platform.android.backButton.previousTitleText('返回').icon('ion-android-arrow-back');

    $ionicConfigProvider.platform.ios.views.transition('ios');
    $ionicConfigProvider.platform.android.views.transition('android');

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      .state('tab.loginAgain', {
          url: '/loginAgain',
          views: {
            'tab-records': {
              templateUrl: 'templates/tab-login.html',
              controller: 'UserCtrl'
            }
          }
        }
      )

      .state('tab.pictureView', {
          url: '/pictureView',
          views: {
            'tab-records': {
              templateUrl: 'templates/tab-picture.html',
              controller: 'PictureCtrl'
            }
          }
        }
      )

      .state('tab.login', {
        url: '/login',
        views: {
          'tab-user': {
            templateUrl: 'templates/tab-login.html',
            controller: 'UserCtrl'
          }
        }
      })

      // Each tab has its own nav history stack:

      .state('tab.about', {
        url: '/about',
        views: {
          'tab-about': {
            templateUrl: 'templates/tab-about.html',
            controller: 'DashCtrl'
          }
        }
      })

      .state('tab.records', {
        url: '/records',
        views: {
          'tab-records': {
            templateUrl: 'templates/tab-records.html',
            controller: 'CardCtrl'
          }
        }
      })

      .state('tab.records-wl', {
        url: '/records/wl',
        views: {
          'tab-records': {
            templateUrl: 'templates/wl-records.html',
            controller: 'WlRecordsCtrl'
          }
        }
      })

      .state('tab.select',{
        url: '/select',
        views: {
          'tab-records': {
            templateUrl: 'templates/tab-select.html',
            controller: 'SelectCtrl'
          }
        }
      })

      .state('tab.records-dzs', {
        url: '/records/dzs',
        views: {
          'tab-records': {
            templateUrl: 'templates/dzs-records.html',
            controller: 'DzsRecordsCtrl'
          }
        }
      })

      .state('tab.records-dzs-detail', {
        url: '/records/dzs/detail',
        views: {
          'tab-records': {
            templateUrl: 'templates/dzs-record-detail.html',
            controller: 'DzsRecordDetailCtrl'
          }
        }
      })

      .state('tab.records-dzs-detail-position', {
        url: '/records/dzs/detail/position',
        views: {
          'tab-records': {
            templateUrl: 'templates/dzs-record-detail-position.html',
            controller: 'DzsRecordPositionCtrl'
          }
        }
      })

      .state('tab.records-dzs-detail-map', {
        url: '/records/dzs/detail/map',
        views: {
          'tab-records': {
            templateUrl: 'templates/dzs-record-detail-map.html',
            controller: 'DzsRecordMapCtrl'
          }
        }
      })

      .state('tab.records-ll', {
        url: '/records/ll',
        views: {
          'tab-records': {
            templateUrl: 'templates/wl-records.html',
            controller: 'WlRecordsCtrl'
          }
        }
      })

      .state('tab.records-wl-detail', {
        url: '/records/wl/detail',
        views: {
          'tab-records': {
            templateUrl: 'templates/wl-record-detail.html',
            controller: 'WlRecordDetailCtrl'
          }
        }
      })

      .state('tab.records-wl-detail-position', {
        url: '/records/wl/detail/position',
        views: {
          'tab-records': {
            templateUrl: 'templates/wl-record-detail-position.html',
            controller: 'WlRecordPositionCtrl'
          }
        }
      })

      .state('tab.user', {
        url: '/user',
        views: {
          'tab-user': {
            templateUrl: 'templates/tab-user.html',
            controller: 'UserCtrl'
          }
        }
      })


    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/about');

  });
