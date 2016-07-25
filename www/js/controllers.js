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

  .controller('WlRecordsCtrl', function ($scope, $http, $location, $ionicScrollDelegate, $ionicLoading,WlRecords, Account, SelectCompanys) {
    $scope.wlRecords = WlRecords.getWlRecords();

    $scope.shouldShow = function () {
      var top = $ionicScrollDelegate.getScrollPosition().top;
      return top > 800;
    }

    $scope.scrollTop = function () {
      $ionicScrollDelegate.scrollTop(true);
    };

    $scope.goToSelect = function () {
      $location.path('/tab/records/wlselect');
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
        WlRecords.setWlRecords(resp.data.rows);
        $scope.wlRecords = WlRecords.getWlRecords();

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
        WlRecords.addWlRecords(resp.data.rows);
        $scope.wlRecords = WlRecords.getWlRecords();
      }, function (resp) {

      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    };

    $scope.$on('$ionicView.loaded', function () {
      var s = {};
      SelectCompanys.setSelect(s);
    });

    $scope.$on('$ionicView.beforeLeave',function () {
      $ionicLoading.hide();
      select.needUpdate = false;
      SelectCompanys.setSelect(select);
    });

    var select;
    $scope.$on('$ionicView.afterEnter', function () {
      select = SelectCompanys.getSelect();
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
        if (select.needUpdate){
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
      WlRecords.setWlRecord(wlRecord);
      $location.path("/tab/records/wl/detail");
    }
  })

  .controller('WlSelectCtrl', function ($scope, $location, $http, $filter, $ionicLoading, ionicDatePicker, SelectCompanys) {
    $scope.$on('$ionicView.beforeEnter', function () {
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

  .controller('WlRecordDetailCtrl', function ($scope, $http, $timeout, $location, $ionicPopup, $ionicLoading, WlRecords, Picture,Account) {
    var myPopup;
    $scope.wlRecord = WlRecords.getWlRecord();

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
          Account.setLoginAgain(true);
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

  .controller('WlRecordPositionCtrl', function ($scope, $http, $location, $ionicLoading, WlRecords, Picture,Account) {
    $scope.wlPosition = WlRecords.getWlPosition();

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
        data: {rfid: $scope.wlPosition.rfid, linkrfid: WlRecords.getWlRecord().linkrfid}
      });

      promise.then(function (resp) {
        if (resp.headers("sessionStatus") == "clear") {
          Account.setLoginAgain(true);
          $location.path('/tab/loginAgain');
          return;
        }
        var m_ReturnOBJ = resp.data.m_ReturnOBJ;
        var stepInfos = [m_ReturnOBJ.length];

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
          stepInfos[i] = stepInfo;
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

  .controller('PictureCtrl', function ($scope, $ionicHistory, Picture) {
    $scope.picture = Picture.getPicture();

    $scope.back = function () {
      $ionicHistory.goBack();
    }
  })

  .controller('UserCtrl', function ($scope, $ionicHistory, $ionicLoading, $timeout, $location, $ionicPopup, $http, Account,ionicToast) {
    $scope.userInfo = Account.getUserInfo();

    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.userInfo = Account.getUserInfo();
      if (Account.getLoginAgain()){
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
