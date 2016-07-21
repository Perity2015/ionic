angular.module('starter.services', [])

  .filter("jsonDate", function ($filter) {
    return function (input, format) {
      if (input == null) {
        return null;
      }

      //从字符串 /Date(1448864369815)/ 得到时间戳 1448864369815
      var timestamp = Number(input.replace(/\/Date\((\d+)\)\//, "$1"));

      //转成指定格式
      return $filter("date")(timestamp, format);
    };
  })

  .factory('Cards', function () {
    var cards = [{
      related: 'wl',
      img: "img/user.jpg",
      title: "物流",
      memo: "查询"
    }, {
      related: 'dzs',
      img: "img/user.jpg",
      title: "电子锁",
      memo: "查询"
    }, {
      related: 'll',
      img: "img/user.jpg",
      title: "冷链",
      memo: "查询"
    }];

    return {
      getWlRecords: function () {
        return cards;
      }
    }
  })

  .factory('WlRecords', function ($filter) {
    // 物流运输记录
    var wlRecord = {
      beginaddr: null,
      beginorgna_id: null,
      beginorgna_name: null,
      begintime: null,
      beginuser: null,
      beginusername: null,
      bok: true,
      bover: false,
      company: null,
      companyid: null,
      deskaddr: null,
      endaddr: null,
      endorgna_id: 0,
      endorgna_name: null,
      endtime: null,
      enduser: null,
      endusername: null,
      errormsg: null,
      flowid: 33,
      flowname: null,
      id: 16322,
      linkrfid: null,
      linkgoodname: null,
      overpaperpic: null,
      papermemo: null,
      beginlat: null,
      beginlng: null,
      endlat: null,
      endlng: null
    };
    //运输记录位置
    var wlPosition = {
      bok: null,
      lockpostion: null,
      rfid: null
    };

    var wlRecords = [];
    var wlPositions = [];
    var total = 0;
    //第一次进入时刷新
    var firstEnter = true;

    return {
      getWlRecords: function () {
        return wlRecords;
      },
      updateWlRecords: function (items) {
        wlRecords = [];
        var i;
        for (i in items) {
          items[i].begintime = $filter("jsonDate")(items[i].begintime, "yyyy-MM-dd HH:mm:ss");
          items[i].endtime = $filter("jsonDate")(items[i].endtime, "yyyy-MM-dd HH:mm:ss");
          wlRecords.push(items[i]);
        }
      },
      updateWlRecord: function (item) {
        wlRecord = item;
      },
      getWlRecord: function () {
        return wlRecord;
      },
      addWlRecords: function (items) {
        var i;
        for (i in items) {
          items[i].begintime = $filter("jsonDate")(items[i].begintime, "yyyy-MM-dd HH:mm:ss");
          items[i].endtime = $filter("jsonDate")(items[i].endtime, "yyyy-MM-dd HH:mm:ss");
          wlRecords.push(items[i]);
        }
      },
      updateTotal: function (tempTotal) {
        total = tempTotal;
      },
      canLoadMore: function () {
        return total > wlRecords.length;
      },
      length: function () {
        return wlRecords.length / 10;
      },
      getFirstEnter: function () {
        return firstEnter;
      },
      updateFirstEnter: function (flag) {
        firstEnter = flag;
      },
      getWlPositions: function () {
        return wlPositions;
      },
      updateWlPositions: function (items) {
        wlPositions = [];
        var i;
        for (i in items) {
          wlPositions.push(items[i]);
        }
      },
      getWlPosition: function (rfid) {

      }
    }
  })

  //本地存储数据
  .factory('locals', ['$window', function ($window) {
    return {
      //存储单个属性
      set: function (key, value) {
        $window.localStorage[key] = value;
      },
      //读取单个属性
      getWlRecord: function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      //存储对象，以JSON格式存储
      setObject: function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      //读取对象
      getObject: function (key) {
        return JSON.parse($window.localStorage[key] || null);
      }

    }
  }])

  .factory('Account', function (locals) {
    var user = {
      username: '',
      password: ''
    };
    var userInfo;
    return {
      instance: function () {
        return user;
      },

      updateWlRecords: function (tempUser) {
        user = tempUser;
      },

      instanceUserInfo: function () {
        userInfo = locals.getObject("userInfo");
        return userInfo;
      },

      updateUserInfo: function (tempUserInfo) {
        userInfo = tempUserInfo;
        locals.setObject("userInfo", userInfo);
      },

      clean: function () {
        // $ionicHistory.clearCache();
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        console.info(document.cookie);
        document.cookie = "sessionID=aaa;";
        // $location.path("/account/login");
        console.info(document.cookie);
      }
    };
  });
