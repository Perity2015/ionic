angular.module('starter.controllers', [])

  .controller('CardCtrl', function ($scope, Cards) {
    $scope.cards = Cards.getWlRecords();
  })

  .controller('DashCtrl', function ($scope) {
  })

  .controller('WlRecordsCtrl', function ($scope, $http, $location, $ionicScrollDelegate, WlRecords) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $scope.wlRecords = WlRecords.getWlRecords();

    $scope.shouldShow = function () {
      var top = $ionicScrollDelegate.getScrollPosition().top;
      return top > 800;
    }

    $scope.scrollTop = function () {
      $ionicScrollDelegate.scrollTop(true);
    };

    $scope.doRefresh = function () {
      var promise = $http({
        method: 'POST',
        url: '/OnceRfid.BaseOnceRfid/GetLinkGoodRecord_RawJson.ajax',
        data: {page: '1', rows: '10'}
      });
      promise.then(function (resp) {
        console.info(resp.data.rows);
        if (resp.headers("sessionStatus") == "clear") {
          $location.path('/tab/login');
          return;
        }
        WlRecords.updateTotal(resp.data.total);
        WlRecords.updateWlRecords(resp.data.rows);
        $scope.wlRecords = WlRecords.getWlRecords();

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
        data: {page: WlRecords.length() + 1, rows: '10'}
      });

      promise.then(function (resp) {
        // console.info(resp.data.rows);
        if (resp.headers("sessionStatus") == "clear") {
          $location.path('/tab/login');
          return;
        }
        WlRecords.updateTotal(resp.data.total);
        WlRecords.addWlRecords(resp.data.rows);
        $scope.wlRecords = WlRecords.getWlRecords();
      }, function (resp) {

      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    };

    $scope.$on('$ionicView.afterEnter', function () {
      if (WlRecords.getFirstEnter()) {
        WlRecords.updateFirstEnter(false);
        $scope.doRefresh();
      }
    });

    $scope.$on('stateChangeSuccess', function () {
      $scope.doRefresh();
    });

    $scope.canLoadMore = function () {
      return WlRecords.canLoadMore();
    }

    $scope.viewDetail = function (wlRecord) {
      WlRecords.updateWlRecord(wlRecord);
      $location.path("/tab/records/wl/detail");
    }
  })

  .controller('WlRecordDetailCtrl', function ($scope, $http, $ionicPopup, $ionicLoading, WlRecords) {
    var myPopup;

    $scope.wlRecord = WlRecords.getWlRecord();
    $scope.$on('$ionicView.beforeEnter', function () {
      var map = new BMap.Map("mapContainer");    // 创建Map实例
      map.disableScrollWheelZoom();     //开启鼠标滚轮缩放
      map.disableDoubleClickZoom();
      map.disablePinchToZoom();
      map.disableDragging();
      if ($scope.wlRecord.beginlat == null && $scope.wlRecord.endlat == null) {
        map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);  // 初始化地图,设置中心点坐标和地图级别
        map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
        return;
      }
      var points = new Array();
      if ($scope.wlRecord.beginlat != null) {
        var point = new BMap.Point($scope.wlRecord.beginlng, $scope.wlRecord.beginlat);
        points.push(point);
      }
      if ($scope.wlRecord.endlat != null) {
        var point = new BMap.Point($scope.wlRecord.endlng, $scope.wlRecord.endlat);
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

    $scope.$on('$destroy',function () {
      if (myPopup != null){
        myPopup.close();
      }
    });

    $scope.viewPosition = function (wlPosition) {
      myPopup.close();
    };

    $scope.getWlRecordPositions = function () {
      $ionicLoading.show();
      var promise = $http({
        method: 'POST',
        url: '/OnceRfid.BaseOnceRfid/GetLinkGoodRfids.ajax',
        data: {linkrfid: $scope.wlRecord.linkrfid}
      });
      promise.then(function (resp) {
        if (resp.headers("sessionStatus") == "clear") {
          $location.path('/tab/login');
          return;
        }
        var returnObj = resp.data;
        if (!returnObj.bOK) {
          return;
        }
        WlRecords.updateWlPositions(returnObj.m_ReturnOBJ);
        $scope.wlPositions = WlRecords.getWlPositions();
        myPopup = $ionicPopup.show({
          template: '<div class="list">  <ion-item class="item" ng-repeat="wlPosition in wlPositions" type="item-text-wrap"  ng-click="viewPosition(wlPosition)">{{wlPosition.lockpostion}}</ion-item></div>',
          title: '请选择位置',
          scope: $scope
        });

      }, function (resp) {

      }).finally(function () {
        $ionicLoading.hide();
      })
    };
  })

  .controller('UserCtrl', function ($scope, $stateParams, $ionicModal, $ionicHistory, $ionicLoading, $ionicPopover, $timeout, $location, $ionicPopup, $http, Account) {
    $scope.user = Account.instance();
    $scope.userInfo = Account.instanceUserInfo();

    $scope.$on('$stateChangeSuccess', function () {
      $scope.userInfo = Account.instanceUserInfo();
    });

    $scope.quitLogin = function () {
      // Account.clean();
      $location.path("/tab/loginAgain");
    };

    $scope.login = function (user) {
      if (undefined == user || user.username == '' || user.password == '') {
        $scope.showAlert('请输入完整信息');
        return
      }

      $ionicLoading.show();
      Account.updateWlRecords(user);

      var promise = $http({
        method: 'POST',
        url: '/CoreSYS.SYS/LGKeyLogin.index.ajax',
        data: user
      });
      promise.then(function (resp) {
        $ionicLoading.hide();
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
        $ionicLoading.hide();
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
