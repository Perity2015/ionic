angular.module('starter.controllers', [])

  .controller('CardCtrl', function ($scope, Cards, Account) {
    $scope.cards = Cards.getWlRecords();

    $scope.$on('$ionicView.enter', function () {
      if (Account.getUserInfo().username) {
        return;
      }

    });
  })

  .controller('DashCtrl', function ($scope) {
  })

  .controller('WlRecordsCtrl', function ($scope, $http, $location, $ionicScrollDelegate, WlRecords, Account) {
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
          $location.path('/tab/loginAgain');
          return;
        }
        WlRecords.setTotal(resp.data.total);
        WlRecords.setWlRecords(resp.data.rows);
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
          $location.path('/tab/loginAgain');
          return;
        }
        WlRecords.setTotal(resp.data.total);
        WlRecords.addWlRecords(resp.data.rows);
        $scope.wlRecords = WlRecords.getWlRecords();
      }, function (resp) {

      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    };

    $scope.$on('$ionicView.beforeEnter', function () {
      if (Account.getFirstEnter()) {
        Account.setFirstEnter(false);
        $scope.doRefresh();
      }
    });

    $scope.canLoadMore = function () {
      return WlRecords.canLoadMore();
    }

    $scope.viewDetail = function (wlRecord) {
      WlRecords.setWlRecord(wlRecord);
      $location.path("/tab/records/wl/detail");
    }
  })

  .controller('WlRecordDetailCtrl', function ($scope, $http, $location, $ionicPopup, $ionicLoading, WlRecords, Picture) {
    var myPopup;
    $scope.wlRecord = WlRecords.getWlRecord();

    $scope.$on('$ionicView.loaded', function () {
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

    $scope.$on('$ionicView.beforeLeave', function () {
      if (myPopup != null) {
        myPopup.close();
      }
    });

    $scope.viewPosition = function (wlPosition) {
      WlRecords.setWlPosition(wlPosition);
      myPopup.close();
      $location.path('/tab/records/wl/detail/position');
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
          $location.path('/tab/loginAgain');
          return;
        }
        var returnObj = resp.data;
        if (!returnObj.bOK) {
          return;
        }
        WlRecords.setWlPositions(returnObj.m_ReturnOBJ);
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

    $scope.viewRecordPicture = function (wlRecord) {
      Picture.setPicture(wlRecord.overpaperpic, wlRecord.papermemo, "运单");
      $location.path('/tab/pictureView');
    }
  })

  .controller('WlRecordPositionCtrl', function ($scope, $http, $location, $ionicLoading, WlRecords, Picture) {
    $scope.wlPosition = WlRecords.getWlPosition();

    $scope.$on('$ionicView.loaded', function () {
      $ionicLoading.show();
      var promise = $http({
        method: 'POST',
        url: '/OnceRfid.BaseOnceRfid/GetLinkGoodRfidSteps.ajax',
        data: {rfid: $scope.wlPosition.rfid, linkrfid: WlRecords.getWlRecord().linkrfid}
      });

      promise.then(function (resp) {
        if (resp.headers("sessionStatus") == "clear") {
          $location.path('/tab/loginAgain');
          return;
        }
        var m_ReturnOBJ = resp.data.m_ReturnOBJ;
        var stepInfos = [m_ReturnOBJ.length];

        for (var i = 0; i < m_ReturnOBJ.length; i++) {
          var object = m_ReturnOBJ[i];
          var stepInfo = {};

          stepInfo.id = i;
          if(i == 0){
            stepInfo.show ="show";
          }
          stepInfo.title = object.stepname;
          stepInfo.time = WlRecords.formatDate(object.createtime);

          var items = [];
          var fieldjson = JSON.parse(object.fieldjson);
          for (var key in fieldjson) {
            if (key == "files") {
              continue;
            }
            var item = {};
            item.name = key;
            item.value = fieldjson[key];
            items.push(item);
          }
          if (!object.bok) {
            var item = {};
            item.name = "错误信息";
            item.value = object.errormsg;
            items.push(item);
          }
          var files = fieldjson.files;
          for (var j = 0; j < files.length; j++) {
            var file = files[j];
            var item = {};
            if (file.fieldshowname)
              item.name = file.fieldshowname;
            else
              item.name = "错误图片";
            item.image = file.fileurl;
            items.push(item);
          }
          stepInfo.items = items;
          stepInfos[i] = stepInfo;
        }


        $scope.steps = stepInfos;
      }, function (resp) {

      }).finally(function () {
        $ionicLoading.hide();
      })
    });

    $scope.viewStepPicture = function (item) {
      Picture.setPicture(item.image, null, item.name);
      $location.path('/tab/pictureView');
    };

    $scope.displayShow = function (index) {
      for (var i = 0;i<$scope.steps.length;i++){
        if (i == index){
          if ($scope.steps[i].show){
            $scope.steps[i].show = null;
          }else {
            $scope.steps[i].show = "show";
          }
        }else {
          $scope.steps[i].show = null;
        }
      }
    };
  })

  .controller('PictureCtrl', function ($scope, $ionicHistory, Picture) {
    $scope.picture = Picture.getPicture();

    $scope.back = function () {
      $ionicHistory.goBack();
    }
  })

  .controller('UserCtrl', function ($scope, $ionicHistory, $ionicLoading, $timeout, $location, $ionicPopup, $http, Account) {
    $scope.userInfo = Account.getUserInfo();

    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.userInfo = Account.getUserInfo();
    });

    $scope.quitLogin = function () {
      $location.path("/tab/login");
    };

    $scope.login = function (userInfo) {
      if (undefined == userInfo || userInfo.username == "" || userInfo.password == "") {
        $scope.showAlert('请输入完整信息');
        return
      }
      $ionicLoading.show();
      var promise = $http({
        method: 'POST',
        url: '/CoreSYS.SYS/LGKeyLogin.index.ajax',
        data: {username: userInfo.username, password: userInfo.password}
      });
      promise.then(function (resp) {
        $ionicLoading.hide();
        if (!resp.data.bOK) {
          $scope.showAlert(resp.data.sMsg);
          return;
        }
        var tempUserInfo = resp.data.m_ReturnOBJ.m_UserInfo;
        Account.setUserInfo(tempUserInfo);
        Account.setFirstEnter(true);
        $ionicHistory.goBack();
      }, function (resp) {

      }).finally(function () {
        $ionicLoading.hide();
      });
    }

    var alertPopup;
    $scope.showAlert = function (msg) {
      alertPopup = $ionicPopup.alert({
        title: '提示',
        template: msg,
        buttons: [{text: '确认', type: 'button-positive'}]
      });
      $timeout(function () {
        alertPopup.close();
      }, 3000);
    }

    $scope.$on('$ionicView.beforeLeave', function () {
      if (alertPopup != null) {
        alertPopup.close();
      }
    });
  });
