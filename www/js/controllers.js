angular.module('starter.controllers', [])
  .controller(function ($scope, $ionicPopup, $timeout) {

  })

  .controller('DashCtrl', function ($scope) {
  })

  .controller('ChatsCtrl', function ($scope, $http, $location, $filter, $ionicScrollDelegate, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.shouldShow = function () {
      var top = $ionicScrollDelegate.getScrollPosition().top;
      console.info(top);
      return top > 800;
    }

    $scope.scrollTop = function () {
      $ionicScrollDelegate.scrollTop(true);
    };

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
          $location.path('/tab/login');
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
          $location.path('/tab/login');
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
    $scope.$on('$ionicView.beforeEnter', function () {
      var map = new BMap.Map("mapContainer");    // 创建Map实例
      map.disableScrollWheelZoom();     //开启鼠标滚轮缩放
      map.disableDoubleClickZoom();
      map.disablePinchToZoom();
      map.disableDragging();
      if ($scope.chat.beginlat == null && $scope.chat.endlat == null) {
        map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);  // 初始化地图,设置中心点坐标和地图级别
        map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
        return;
      }
      var points = new Array();
      if ($scope.chat.beginlat != null) {
        var point = new BMap.Point($scope.chat.beginlng, $scope.chat.beginlat);
        points.push(point);
      }
      if ($scope.chat.endlat != null) {
        var point = new BMap.Point($scope.chat.endlng, $scope.chat.endlat);
        points.push(point);
      }

      //坐标转换完之后的回调函数
      translateCallback = function (data) {
        if (data.status === 0) {
          var newPoints = data.points;
          for (var i = 0; i < newPoints.length; i++) {
            var marker = new BMap.Marker(newPoints[i]);
            map.addOverlay(marker);
          }

          var polyline = new BMap.Polyline(newPoints, {strokeColor: "blue", strokeWeight: 2, strokeOpacity: 0.5});
          map.addOverlay(polyline);
          map.setViewport(newPoints);
        }
      }
      setTimeout(function () {
        var convertor = new BMap.Convertor();
        convertor.translate(points, 1, 5, translateCallback)
      }, 1000);

    }, false);


  })

  .controller('AccountCtrl', function ($scope, $stateParams, $ionicModal, $ionicHistory, $ionicPopover, $timeout, $location, $ionicPopup, $http, Account) {
    $scope.user = Account.instance();
    $scope.userInfo = Account.instanceUserInfo();

    $scope.quitLogin = function () {
      Account.clean();
      $location.path("/tab/loginAgain");
    };

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
