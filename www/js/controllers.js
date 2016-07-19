angular.module('starter.controllers', [])
  .controller(function ($scope, $ionicPopup, $timeout) {

  })

  .controller('DashCtrl', function ($scope) {
  })

  .controller('ChatsCtrl', function ($scope, $http, $location, $filter, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});


    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
      Chats.remove(chat);
    };

    $scope.doRefresh = function () {
      var promise = $http({
        method: 'POST',
        url: '/OnceRfid.BaseOnceRfid/GetLinkGoodRecord_RawJson.ajax',
        data: {page: '1', rows: '10'}
      });
      promise.then(function (resp) {
        console.info(resp.data.rows);
        if (resp.headers("sessionStatus")) {
          $location.path('/tab/account');
          return;
        }
        Chats.updateTotal(resp.data.total);
        Chats.update(resp.data.rows, $filter);
        $scope.chats = Chats.all();

      }, function (resp) {

      }).finally(function () {
        // 停止广播ion-refresher
        $scope.$broadcast('scroll.refreshComplete');
      })
    };

    $scope.LoadMore = function () {
      var promise = $http({
        method: 'POST',
        url: '/OnceRfid.BaseOnceRfid/GetLinkGoodRecord_RawJson.ajax',
        data: {page: Chats.length() + 1, rows: '10'}
      });

      promise.then(function (resp) {
        // console.info(resp.data.rows);
        if (resp.headers("sessionStatus")) {
          $location.path('/tab/account');
          return;
        }
        Chats.updateTotal(resp.data.total);
        Chats.add(resp.data.rows, $filter);
        $scope.chats = Chats.all();
      }, function (resp) {

      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    };

    $scope.$on('stateChangeSuccess', function () {
      $scope.LoadMore();
    });

    $scope.canLoadMore = function () {
      return Chats.canLoadMore();
    }
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
    console.info($scope.chat);
    $scope.$on('$ionicView.afterEnter', function () {
      var map = new AMap.Map('mapContainer', {
        center: [121.498586, 31.239637]
      });
    }, false);

  })

  .controller('AccountCtrl', function ($scope, $stateParams, $ionicModal, $ionicHistory, $ionicPopover, $timeout, $location, $ionicPopup, $http, Account) {
    $scope.user = Account.instance();

    $scope.login = function (user) {
      if (undefined == user || user.username == '' || user.password == '') {
        $scope.showAlert('请输入完整信息');
        return
      }

      Account.update(user);

      var promise = $http({
        method: 'POST',
        url: '/CoreSYS.SYS/LGKeyLogin.index.ajax',
        data: user
      });
      promise.then(function (resp) {
        if (!resp.data.bOK) {
          $scope.showAlert(resp.data.sMsg);
          return;
        }
        var tempUserInfo = resp.data.m_ReturnOBJ.m_UserInfo;
        Account.updateUserInfo(tempUserInfo)
        // $location.path('/tab/account');
        console.info(resp.headers("sessionStatus"));
        $ionicHistory.goBack();
      }, function (resp) {

      });
    }

    $scope.showAlert = function (msg) {
      var alertPopup = $ionicPopup.alert({
        title: '提示',
        template: msg,
        buttons: [{text: '确认', type: 'button-positive'}]
      });
    }
  });
