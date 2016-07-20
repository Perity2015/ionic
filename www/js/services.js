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

  .factory('Chats', function () {
    // Might use a resource here that returns a JSON array
    var chat = {
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
    // Some fake testing data
    var chats = [];
    var total = 0;

    return {
      all: function () {
        return chats;
      },
      remove: function (chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      update: function (items, $filter) {
        chats = new Array();
        var i;
        for (i in items) {
          items[i].begintime = $filter("jsonDate")(items[i].begintime, "yyyy-MM-dd HH:mm:ss");
          items[i].endtime = $filter("jsonDate")(items[i].endtime, "yyyy-MM-dd HH:mm:ss");
          chats.push(items[i]);
        }
      },
      get: function (chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      },
      add: function (items, $filter) {
        var i;
        for (i in items) {
          items[i].begintime = $filter("jsonDate")(items[i].begintime, "yyyy-MM-dd HH:mm:ss");
          items[i].endtime = $filter("jsonDate")(items[i].endtime, "yyyy-MM-dd HH:mm:ss");
          chats.push(items[i]);
        }
      },
      updateTotal: function (tempTotal) {
        total = tempTotal;
      },
      canLoadMore: function () {
        return total > chats.length;
      },
      length: function () {
        return chats.length / 10;
      }
    }
      ;
  })

  //本地存储数据===================================
  .factory('locals', ['$window', function ($window) {
    return {
      //存储单个属性
      set: function (key, value) {
        $window.localStorage[key] = value;
      },
      //读取单个属性
      get: function (key, defaultValue) {
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

  .factory('Account', function (locals,$ionicHistory,$location) {
    var user = {
      username: 'yc',
      password: '0'
    };

    var userInfo ;

    return {
      instance: function () {
        return user;
      },

      update: function (tempUser) {
        user = tempUser;
      },

      instanceUserInfo: function () {
        userInfo = locals.getObject("userInfo");
        return userInfo;
      },

      updateUserInfo: function (tempUserInfo) {
        userInfo = tempUserInfo;
        locals.setObject("userInfo",userInfo);
      },

      clean:function () {
        // $ionicHistory.clearCache();
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        console.info(document.cookie);
          document.cookie= "sessionID=aaa;";
        // $location.path("/account/login");
        console.info(document.cookie);
      }
    };
  });
