angular.module('starter.controllers', [])

  .controller('CardCtrl', function ($scope, Cards, Account) {
    $scope.cards = Cards.getRecords();

    $scope.$on('$ionicView.enter', function () {
      if (Account.getUserInfo().username) {
        return;
      }

    });
  })

  .controller('DashCtrl', function ($scope) {
  })

  .controller('WlRecordsCtrl', function ($scope, $http, $location, $ionicScrollDelegate, $ionicLoading, WlRecords, Account, SelectCompanys, ionicToast) {
    $scope.wlRecords = WlRecords.getRecords();

    $scope.shouldShow = function () {
      var top = $ionicScrollDelegate.getScrollPosition().top;
      return top > 2400;
    }

    $scope.scrollTop = function () {
      $ionicScrollDelegate.scrollTop(true);
    };

    $scope.goToSelect = function () {
      $location.path('/tab/select');
    }

    $scope.doRefresh = function () {
      $ionicLoading.show();
      var promise = $http({
        method: 'POST',
        url: '/OnceRfid.BaseOnceRfid/GetLinkGoodRecord_RawJson.ajax',
        data: {
          page: '1',
          rows: '10',
          companyid: select.companyid,
          starttime: select.start,
          endtime: select.end
        }
      });
      promise.then(function (resp) {
        console.info(resp.data.rows);
        if (resp.headers("sessionStatus") == "clear") {
          Account.setLoginAgain(true);
          $location.path('/tab/loginAgain');
          return;
        }
        WlRecords.setTotal(resp.data.total);
        WlRecords.setRecords(resp.data.rows);
        $scope.wlRecords = WlRecords.getRecords();

        if (resp.data.total == 0) {
          ionicToast.show('未查询到记录.', 'middle', false, 2000);
        }

      }, function (resp) {

      }).finally(function () {
        // 停止广播ion-refresher
        $scope.$broadcast('scroll.refreshComplete');
        $ionicLoading.hide();
      })
    };

    $scope.LoadMore = function () {
      var promise = $http({
        method: 'POST',
        url: '/OnceRfid.BaseOnceRfid/GetLinkGoodRecord_RawJson.ajax',
        data: {
          page: WlRecords.length() + 1,
          rows: '10',
          companyid: select.companyid,
          starttime: select.start,
          endtime: select.end
        }
      });

      promise.then(function (resp) {
        // console.info(resp.data.rows);
        if (resp.headers("sessionStatus") == "clear") {
          Account.setLoginAgain(true);
          $location.path('/tab/loginAgain');
          return;
        }
        WlRecords.setTotal(resp.data.total);
        WlRecords.addRecords(resp.data.rows);
        $scope.wlRecords = WlRecords.getRecords();
      }, function (resp) {

      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    };

    $scope.$on('$ionicView.loaded', function () {
      Account.setFirstEnter(true);
      var s = {};
      SelectCompanys.setSelect(s);
    });

    $scope.$on('$ionicView.beforeLeave', function () {
      $ionicLoading.hide();
      select.needUpdate = false;
      SelectCompanys.setSelect(select);
    });

    var select;
    $scope.$on('$ionicView.afterEnter', function () {
      select = SelectCompanys.getSelect();
      SelectCompanys.setFullClassNames("OnceRfid.BaseOnceRfid");
      if (!select.companyid) {
        select.companyid = "";
      }
      if (!select.start) {
        select.start = "";
      }
      if (!select.end) {
        select.end = "";
      }
      SelectCompanys.setSelect(select);
      if (select.companyid != "" || select.start != "" || select.end != "") {
        if (select.needUpdate) {
          Account.setFirstEnter(false);
          $scope.doRefresh();
        }
      } else if (Account.getFirstEnter()) {
        Account.setFirstEnter(false);
        $scope.doRefresh();
      }
    });

    $scope.canLoadMore = function () {
      return WlRecords.canLoadMore();
    }

    $scope.viewDetail = function (wlRecord) {
      WlRecords.setRecord(wlRecord);
      $location.path("/tab/records/wl/detail");
    }
  })

  .controller('WlRecordDetailCtrl', function ($scope, $http, $timeout, $location, $ionicPopup, $ionicLoading, WlRecords, Picture, Account) {
    var myPopup;
    $scope.wlRecord = WlRecords.getRecord();

    $scope.$on('$ionicView.loaded', function () {
      if ($scope.wlRecord.beginlat == null && $scope.wlRecord.endlat == null) {
        // map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);  // 初始化地图,设置中心点坐标和地图级别
        // map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
        return;
      }
      var map = new BMap.Map("mapContainer");    // 创建Map实例
      map.disableScrollWheelZoom();     //开启鼠标滚轮缩放
      map.disableDoubleClickZoom();
      map.disablePinchToZoom();
      map.disableDragging();
      $scope.needShowMap = true;
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
      $ionicLoading.hide();
    });

    $scope.viewPosition = function (wlPosition) {
      WlRecords.setPosition(wlPosition);
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
          Account.setLoginAgain(true);
          $location.path('/tab/loginAgain');
          return;
        }
        var returnObj = resp.data;
        if (!returnObj.bOK) {
          return;
        }
        WlRecords.setPositions(returnObj.m_ReturnOBJ);
        $scope.wlPositions = WlRecords.getPositions();
        myPopup = $ionicPopup.show({
          template: '<div class="list">  <ion-item class="item" ng-repeat="wlPosition in wlPositions" type="item-text-wrap"  ng-click="viewPosition(wlPosition)">{{wlPosition.lockpostion}}</ion-item></div>',
          title: '请选择位置',
          scope: $scope
        });
        $timeout(function () {
          myPopup.close();
        }, 10000);


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

  .controller('WlRecordPositionCtrl', function ($scope, $http, $location, $ionicLoading, WlRecords, Picture, Account) {
    $scope.wlPosition = WlRecords.getPosition();

    $scope.toggleGroup = function (group) {
      group.show = !group.show;
    };
    $scope.isGroupShown = function (group) {
      return group.show;
    };

    $scope.$on('$ionicView.loaded', function () {
      $ionicLoading.show();
      var promise = $http({
        method: 'POST',
        url: '/OnceRfid.BaseOnceRfid/GetLinkGoodRfidSteps.ajax',
        data: {rfid: $scope.wlPosition.rfid, linkrfid: WlRecords.getRecord().linkrfid}
      });

      promise.then(function (resp) {
        if (resp.headers("sessionStatus") == "clear") {
          Account.setLoginAgain(true);
          $location.path('/tab/loginAgain');
          return;
        }
        var m_ReturnOBJ = resp.data.m_ReturnOBJ;
        var stepInfos = [];

        for (var i = 0; i < m_ReturnOBJ.length; i++) {
          var object = m_ReturnOBJ[i];
          var stepInfo = {};

          stepInfo.id = i;
          stepInfo.show = i == 0;
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
          stepInfos.push(stepInfo);
        }


        $scope.groups = stepInfos;
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
      for (var i = 0; i < $scope.steps.length; i++) {
        if (i == index) {
          if ($scope.steps[i].show) {
            $scope.steps[i].show = null;
          } else {
            $scope.steps[i].show = "show";
          }
        } else {
          $scope.steps[i].show = null;
        }
      }
    };
  })

  .controller('DzsRecordsCtrl', function ($scope, $http, $location, $ionicScrollDelegate, $ionicLoading, DzsRecords, Account, SelectCompanys, ionicToast) {
    $scope.dzsRecords = DzsRecords.getRecords();

    $scope.shouldShow = function () {
      var top = $ionicScrollDelegate.getScrollPosition().top;
      return top > 2400;
    }

    $scope.scrollTop = function () {
      $ionicScrollDelegate.scrollTop(true);
    };

    $scope.goToSelect = function () {
      $location.path('/tab/select');
    }

    $scope.doRefresh = function () {
      $ionicLoading.show();
      var promise = $http({
        method: 'POST',
        url: '/NFCLock.BaseNFCLock/RecordsList_RawJson.ajax',
        data: {
          page: '1',
          rows: '10',
          companyid: select.companyid,
          begintime: select.start,
          endtime: select.end
        }
      });
      promise.then(function (resp) {
        console.info(resp.data.rows);
        if (resp.headers("sessionStatus") == "clear") {
          Account.setLoginAgain(true);
          $location.path('/tab/loginAgain');
          return;
        }
        DzsRecords.setTotal(resp.data.total);
        DzsRecords.setRecords(resp.data.rows);
        $scope.dzsRecords = DzsRecords.getRecords();

        if (resp.data.total == 0) {
          ionicToast.show('未查询到记录.', 'middle', false, 2000);
        }

      }, function (resp) {

      }).finally(function () {
        // 停止广播ion-refresher
        $scope.$broadcast('scroll.refreshComplete');
        $ionicLoading.hide();
      })
    };

    $scope.LoadMore = function () {
      var promise = $http({
        method: 'POST',
        url: '/NFCLock.BaseNFCLock/RecordsList_RawJson.ajax',
        data: {
          page: DzsRecords.length() + 1,
          rows: '10',
          companyid: select.companyid,
          begintime: select.start,
          endtime: select.end
        }
      });
      promise.then(function (resp) {
        // console.info(resp.data.rows);
        if (resp.headers("sessionStatus") == "clear") {
          Account.setLoginAgain(true);
          $location.path('/tab/loginAgain');
          return;
        }
        DzsRecords.setTotal(resp.data.total);
        DzsRecords.addRecords(resp.data.rows);
        $scope.wlRecords = DzsRecords.getRecords();
      }, function (resp) {

      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    };

    $scope.$on('$ionicView.loaded', function () {
      Account.setFirstEnter(true);
      var s = {};
      SelectCompanys.setSelect(s);
    });

    $scope.$on('$ionicView.beforeLeave', function () {
      $ionicLoading.hide();
      select.needUpdate = false;
      SelectCompanys.setSelect(select);
    });

    var select;
    $scope.$on('$ionicView.afterEnter', function () {
      select = SelectCompanys.getSelect();
      SelectCompanys.setFullClassNames("NFCLock.BaseNFCLock");
      if (!select.companyid) {
        select.companyid = "";
      }
      if (!select.start) {
        select.start = "";
      }
      if (!select.end) {
        select.end = "";
      }
      SelectCompanys.setSelect(select);
      if (select.companyid != "" || select.start != "" || select.end != "") {
        if (select.needUpdate) {
          Account.setFirstEnter(false);
          $scope.doRefresh();
        }
      } else if (Account.getFirstEnter()) {
        Account.setFirstEnter(false);
        $scope.doRefresh();
      }
    });

    $scope.canLoadMore = function () {
      return DzsRecords.canLoadMore();
    }

    $scope.viewDetail = function (dzsRecord) {
      DzsRecords.setRecord(dzsRecord);
      $location.path("/tab/records/dzs/detail");
    }
  })

  .controller('DzsRecordDetailCtrl', function ($scope, $http, $timeout, $location, $ionicPopup, $ionicLoading, DzsRecords, Picture, Account, ionicToast) {
    var myPopup;
    $scope.dzsRecord = DzsRecords.getRecord();

    $scope.$on('$ionicView.loaded', function () {
      if ($scope.dzsRecord.beginlat == null && $scope.dzsRecord.endlat == null) {
        // map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);  // 初始化地图,设置中心点坐标和地图级别
        // map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
        return;
      }
      var map = new BMap.Map("mapContainer");    // 创建Map实例
      map.disableScrollWheelZoom();     //开启鼠标滚轮缩放
      map.disableDoubleClickZoom();
      map.disablePinchToZoom();
      map.disableDragging();
      $scope.needShowMap = true;
      var points = new Array();
      if ($scope.dzsRecord.beginlat != "") {
        var point = new BMap.Point($scope.dzsRecord.beginlng, $scope.dzsRecord.beginlat);
        points.push(point);
      }
      if ($scope.dzsRecord.endlat != "") {
        var point = new BMap.Point($scope.dzsRecord.endlng, $scope.dzsRecord.endlat);
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
      $ionicLoading.hide();
    });

    $scope.viewPosition = function (dzsPosition) {
      DzsRecords.setPosition(dzsPosition);
      myPopup.close();
      $location.path('/tab/records/dzs/detail/position');
    };

    $scope.getDzsRecordPositions = function () {
      $ionicLoading.show();
      var promise = $http({
        method: 'POST',
        url: '/NFCLock.BaseNFCLock/recordPostionList_RawJson.ajax',
        data: {recordid: $scope.dzsRecord.recordid}
      });
      promise.then(function (resp) {
        if (resp.headers("sessionStatus") == "clear") {
          Account.setLoginAgain(true);
          $location.path('/tab/loginAgain');
          return;
        }
        var returnObj = resp.data;
        if (returnObj.total == 0) {
          ionicToast.show('没有上锁位置.', 'middle', false, 2000);
          return;
        }
        DzsRecords.setPositions(returnObj.rows);
        $scope.dzsPositions = DzsRecords.getPositions();
        myPopup = $ionicPopup.show({
          template: '<div class="list">  <ion-item class="item" ng-repeat="dzsPosition in dzsPositions" type="item-text-wrap"  ng-click="viewPosition(dzsPosition)">{{dzsPosition.nfclock_objectpostionname}}</ion-item></div>',
          title: '请选择上锁位置',
          scope: $scope
        });
        $timeout(function () {
          myPopup.close();
        }, 10000);

      }, function (resp) {

      }).finally(function () {
        $ionicLoading.hide();
      })
    };

    $scope.getDzsRecordMapPositions = function () {
      $ionicLoading.show();
      var promise = $http({
        method: 'POST',
        url: '/NFCLock.BaseNFCLock/getRecords_RawJson.ajax',
        data: {recordids: $scope.dzsRecord.recordid}
      });
      promise.then(function (resp) {
        if (resp.headers("sessionStatus") == "clear") {
          Account.setLoginAgain(true);
          $location.path('/tab/loginAgain');
          return;
        }
        var data = resp.data;
        if (data.mapData[0].length == 0) {
          ionicToast.show('没有地图信息.', 'middle', false, 2000);
          return;
        }
        DzsRecords.setMapData(data.mapData[0]);
        $location.path('/tab/records/dzs/detail/map');


      }, function (resp) {

      }).finally(function () {
        $ionicLoading.hide();
      })
    };

    $scope.viewRecordPicture = function (dzsRecord) {
      Picture.setPicture(dzsRecord.overpaperpic, dzsRecord.papermemo, "运单");
      $location.path('/tab/pictureView');
    }
  })

  .controller('DzsRecordMapCtrl', function ($scope, $http, $timeout, DzsRecords) {
    var map;
    var lockIcon = new BMap.Icon("img/ic_map_marker_lock.png", new BMap.Size(27, 36));
    var loopIcon = new BMap.Icon("img/ic_map_marker_loop.png", new BMap.Size(27, 36));
    var openIcon = new BMap.Icon("img/ic_map_marker_open.png", new BMap.Size(27, 36));

    $scope.$on('$ionicView.loaded', function () {
      map = new BMap.Map("dzsMapContainer");    // 创建Map实例
      map.disableScrollWheelZoom();     //开启鼠标滚轮缩放
      map.disableDoubleClickZoom();
      map.disablePinchToZoom();
      map.disableDragging();
      map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);  // 初始化地图,设置中心点坐标和地图级别
      map.setCurrentCity("北京");
    });

    $scope.$on('$ionicView.afterEnter', function () {
      var mapData = DzsRecords.getMapData();
      var points = [];
      for (var i = 0; i < mapData.length; i++) {

        points.push(new BMap.Point(mapData[i].lng, mapData[i].lat));
      }

      //坐标转换完之后的回调函数
      translateCallback = function (data) {
        if (data.status === 0) {
          var newPoints = data.points;
          for (var i = 0; i < newPoints.length; i++) {
            var img;
            var status = mapData[i].status;
            switch (status) {
              case "lock":
                img = lockIcon;
                break
              case "loopTrue":
              case "loopFalse":
                img = loopIcon;
                break
              case "openTrue":
              case "openFalse":
                img = openIcon;
                break
            }
            var marker = new BMap.Marker(newPoints[i], {icon: img, offset: new BMap.Size(0, -18)});
            map.addOverlay(marker);
            marker.addEventListener("click", getInfo.bind(null, i));
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

      function getInfo(i, e) {
        var status = mapData[i].status;
        var title;
        var content;
        switch (status) {
          case "lock":
            title = "操作" + (i + 1) + " 上锁"
            content = "上锁人员：" + mapData[i].acount + "<br>" + "上锁时间：" + mapData[i].time + "<br>" + "上锁地址：" + mapData[i].addr;
            break
          case "loopTrue":
          case "loopFalse":
            title = "操作" + (i + 1) + " 巡检"
            content = "巡检人员：" + mapData[i].acount + "<br>" + "巡检时间：" + mapData[i].time + "<br>" + "巡检地址：" + mapData[i].addr;
            break
          case "openTrue":
          case "openFalse":
            title = "操作" + (i + 1) + " 开锁"
            content = "开锁人员：" + mapData[i].acount + "<br>" + "开锁时间：" + mapData[i].time + "<br>" + "开锁地址：" + mapData[i].addr;
            break
        }
        var opts = {
          title: title, // 信息窗口标题
          enableMessage: true,//设置允许信息窗发送短息
          message: "请查看信息",
          offset: new BMap.Size(0, -18)
        }
        var p = e.target;
        var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
        var infoWindow = new BMap.InfoWindow(content, opts);  // 创建信息窗口对象
        map.openInfoWindow(infoWindow, point); //开启信息窗
      }
    });
  })

  .controller('DzsRecordPositionCtrl', function ($scope, $http, $location, $ionicLoading, DzsRecords, Picture, Account) {
    $scope.dzsPosition = DzsRecords.getPosition();

    $scope.toggleGroup = function (group) {
      group.show = !group.show;
    };
    $scope.isGroupShown = function (group) {
      return group.show;
    };

    $scope.$on('$ionicView.loaded', function () {
      $ionicLoading.show();
      var promise = $http({
        method: 'POST',
        url: '/NFCLock.BaseNFCLock/postionRecordList_RawJson.ajax',
        data: {postionname: $scope.dzsPosition.nfclock_objectpostionname, recordid: DzsRecords.getRecord().recordid}
      });

      promise.then(function (resp) {
        if (resp.headers("sessionStatus") == "clear") {
          Account.setLoginAgain(true);
          $location.path('/tab/loginAgain');
          return;
        }

        var rows = resp.data.rows;
        var stepInfos = [];

        for (var i = 0; i < rows.length; i++) {
          var object = rows[i];
          var stepInfo = {};

          stepInfo.id = i;
          stepInfo.show = i == 0;
          stepInfo.title = object.stepname;
          stepInfo.time = DzsRecords.formatDate(object.createtime);

          var items = [];
          var fieldjson = JSON.parse(object.spfieldjson);
          for (var j = 0; j < fieldjson.length; j++) {
            var field = fieldjson[j];
            var item = {};
            item.name = field.showname;
            if (field.datatype == "string") {
              item.value = field.fieldValue;
            } else {
              item.image = field.fieldValue;
            }
            items.push(item);
          }

          if (object.pic != "") {
            var item = {};
            item.name = object.stepname + "图片";
            item.image = object.pic;
            items.push(item);
          }

          stepInfo.items = items;
          stepInfos.push(stepInfo);
        }

        var postionInfo = resp.data.postionInfo;
        if (postionInfo.errorpic != null) {
          var stepInfo = {};
          stepInfo.show = false;
          stepInfo.title = "异常";
          stepInfo.time = DzsRecords.formatDate(object.createtime);
          var items = [];
          var item1 = {};
          item1.name = "异常信息";
          item1.value = postionInfo.errormsg;
          items.push(item1);
          var item2 = {};
          item2.name = "异常图片";
          item2.image = postionInfo.errorpic;
          items.push(item2);

          stepInfo.items = items;
          stepInfos.push(stepInfo);
        }

        $scope.groups = stepInfos;
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
      for (var i = 0; i < $scope.steps.length; i++) {
        if (i == index) {
          if ($scope.steps[i].show) {
            $scope.steps[i].show = null;
          } else {
            $scope.steps[i].show = "show";
          }
        } else {
          $scope.steps[i].show = null;
        }
      }
    };
  })

  .controller('SelectCtrl', function ($scope, $location, $http, $filter, $ionicLoading, ionicDatePicker, SelectCompanys) {
    $scope.$on('$ionicView.afterEnter', function () {
      $ionicLoading.show();
      var promise = $http({
        method: 'POST',
        url: '/CoreSYS.SYS/GetSelectCompanyFromClass_RawJson.ajax',
        data: {fullclassnames: SelectCompanys.getFullClassNames()}
      });
      promise.then(function (resp) {
        if (resp.headers("sessionStatus") == "clear") {
          $location.path('/tab/loginAgain');
          return;
        }
        SelectCompanys.setCompanys(resp.data);
        if (resp.data.length == 1) {
          $scope.select.company = resp.data[0].company;
          $scope.select.needHide = true;
        }
        $scope.companys = SelectCompanys.getCompanys();

      }, function (resp) {

      }).finally(function () {
        $ionicLoading.hide();
      })
    });

    $scope.$on('$ionicView.beforeLeave', function () {
      $ionicLoading.hide();
      $scope.select.needUpdate = true;
      $scope.select.companyid = SelectCompanys.getCompanyId($scope.select.company);
      SelectCompanys.setSelect($scope.select);
    })

    $scope.select = SelectCompanys.getSelect();

    var index = 0;
    var datePicker = {
      callback: function (val) {  //Mandatory
        console.log('Return value from the datepicker popup is : ' + val, new Date(val));
        if (index == 1) {
          $scope.select.start = $filter("date")(val, "yyyy-MM-dd");
        } else if (index == 2) {
          $scope.select.end = $filter("date")(val, "yyyy-MM-dd");
        }
        SelectCompanys.setSelect($scope.select);
      },
      disabledDates: [            //Optional
      ],
      setLabel: "设置",
      todayLabel: "今天",
      closeLabel: "关闭",
      weeksList: ["日", "一", "二", "三", "四", "五", "六"],
      monthsList: ["01月", "02月", "03月", "04月", "05月", "06月", "07月", "08月", "09月", "10月", "11月", "12月"],
      showTodayButton: false,
      from: new Date(2000, 1, 1), //Optional
      to: new Date(2099, 12, 31), //Optional
      dateFormat: 'yyyy-MM-dd',
      inputDate: new Date(),      //Optional
      mondayFirst: true,          //Optional
      disableWeekdays: [],       //Optional
      closeOnSelect: false,       //Optional
      templateType: 'popup'       //Optional
    };
    $scope.openDatePicker = function (num) {
      index = num;
      ionicDatePicker.openDatePicker(datePicker);
    };
  })

  .controller('PictureCtrl', function ($scope, $ionicHistory, Picture) {
    $scope.picture = Picture.getPicture();

    $scope.back = function () {
      $ionicHistory.goBack();
    }
  })

  .controller('UserCtrl', function ($scope, $ionicHistory, $ionicLoading, $timeout, $location, $ionicPopup, $http, Account, ionicToast) {
    $scope.userInfo = Account.getUserInfo();

    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.userInfo = Account.getUserInfo();
      if (Account.getLoginAgain()) {
        Account.setLoginAgain(false);
        ionicToast.show('请重新登录.', 'middle', false, 2000);
      }
    });

    $scope.quitLogin = function () {
      Account.setLoginAgain(false);
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
