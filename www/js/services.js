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
        return JSON.parse($window.localStorage[key] || '{}');
      }

    }
  }])

  .factory('Cards', function () {
    var cards = [{
      related: 'wl',
      img: "img/user.png",
      title: "物流",
      memo: "查询"
    }, {
      related: 'dzs',
      img: "img/user.png",
      title: "电子锁",
      memo: "查询"
    }, {
      related: 'll',
      img: "img/user.png",
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
    var wlRecord;
    //运输记录位置
    var wlPosition;

    var wlRecords = [];
    var wlPositions = [];
    var total = 0;

    return {
      getWlRecords: function () {
        return wlRecords;
      },
      setWlRecords: function (items) {
        wlRecords = [];
        var i;
        for (i in items) {
          items[i].begintime = $filter("jsonDate")(items[i].begintime, "yyyy-MM-dd HH:mm:ss");
          items[i].endtime = $filter("jsonDate")(items[i].endtime, "yyyy-MM-dd HH:mm:ss");
          wlRecords.push(items[i]);
        }
      },
      setWlRecord: function (item) {
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
      setTotal: function (tempTotal) {
        total = tempTotal;
      },
      canLoadMore: function () {
        return total > wlRecords.length;
      },
      length: function () {
        return wlRecords.length / 10;
      },
      getWlPositions: function () {
        return wlPositions;
      },
      setWlPositions: function (items) {
        wlPositions = [];
        var i;
        for (i in items) {
          wlPositions.push(items[i]);
        }
      },
      getWlPosition: function () {
        return wlPosition;
      },
      setWlPosition: function (item) {
        wlPosition = item;
      },
      formatDate:function (date) {
        return $filter("jsonDate")(date, "yyyy-MM-dd HH:mm:ss");
      }
    }
  })

  .factory('Picture', function () {
    var picture = {};
    return {
      getPicture:function () {
        return  picture;
      },
      setPicture: function (imageUrl, memo,title) {
        picture.imageUrl = imageUrl;
        picture.memo = memo;
        picture.title = title;
      }
    }
  })

  .factory('Account', function (locals) {
    var userInfo;
    //第一次进入时刷新
    var firstEnter = true;
    return {
      getUserInfo: function () {
        userInfo = locals.getObject("userInfo");
        return userInfo;
      },
      setUserInfo: function (tempUserInfo) {
        userInfo = tempUserInfo;
        locals.setObject("userInfo", userInfo);
      },
      getFirstEnter: function () {
        return firstEnter;
      },
      setFirstEnter: function (flag) {
        firstEnter = flag;
      }
    };
  });
