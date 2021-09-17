"use strict";

/**
 * EZUIKitHd Player for npm
 */
(function (global, factory) {
  "use strict";

  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.document ? factory(global, true) : function (w) {
      if (!w.document) {
        throw new Error("EZUIPlayer requires a window with a document");
      }

      return factory(w);
    };
  } else {
    factory(global);
  } // Pass this if window is not defined yet

})(typeof window !== "undefined" ? window : void 0, function (window, noGlobal) {
  Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "h+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  };
  /** 获取url参数 */
  function getQueryString(name, url) { var r = new RegExp("(\\?|#|&)" + name + "=(.*?)(#|&|$)"); var m = (url || location.href).match(r); return decodeURIComponent(m ? m[2] : ''); }
  // 格式化回放时间
  function formatRecTime(time, defaultTime) {
    // 用户格式 无需更改 => 20182626T000000Z
    // return time
    // 用户格式需要更改
    //用户时间长度为 14 20181226000000  =》 20181226000000
    // 用户长度为12     201812260000    =》 201812260000 + defaultTime后面2位
    // 用户长度为10     2018122600      =》 201812260000 + defaultTime后面4位
    // 用户长度为8     20181226         =》 201812260000 + defaultTime后面6位
    // 结果 20181226000000 14位
    // 插入 TZ
    var reg = /^[0-9]{8}T[0-9]{6}Z$/;
    if (reg.test(time)) { // 用户格式 无需更改 => 20182626T000000Z
      return time;
    } else if (/[0-9]{8,14}/.test(time)) {
      var start = 6 - (14 - time.length);
      var end = defaultTime.length;
      var standardTime = time + defaultTime.substring(start, end);
      return standardTime.slice(0, 8) + 'T' + standardTime.slice(8) + 'Z';
    } else {
      throw new Error('回放时间格式有误，请确认');
    }
  }
  function reRormatRecTime(time) {
    var year = time.slice(0, 4);
    var month = time.slice(4, 6);
    var day = time.slice(6, 8);
    var hour = time.slice(9, 11);
    var minute = time.slice(11, 13);
    var second = time.slice(13, 15);
    var date = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    return new Date(date.replace(/-/g, '/')).getTime();
  }
  // 加载js
  function addJs(filepath, callback) {
    var headerScript = document.getElementsByTagName('head')[0].getElementsByTagName("script");
    var isReady = false;

    for (var i = 0; i < headerScript.length; i++) {
      if (headerScript[i].getAttribute("src") == filepath) {
        isReady = true;
        callback();
      }
    }

    if (!isReady) {
      var oJs = document.createElement("script");
      oJs.setAttribute("src", filepath);
      oJs.onload = callback;
      document.getElementsByTagName("head")[0].appendChild(oJs);
    }
  } // 加载css


  function addCss(filepath, callback) {
    var headerLink = document.getElementsByTagName('head')[0].getElementsByTagName("link");
    var isReady = false;

    for (var i = 0; i < headerLink.length; i++) {
      if (headerLink[i].getAttribute("href") == filepath) {
        isReady = true;
        callback();
      }
    }

    if (!isReady) {
      var oJs = document.createElement('link');
      oJs.rel = 'stylesheet';
      oJs.type = 'text/css';
      oJs.href = filepath;
      oJs.onload = callback;
      document.getElementsByTagName("head")[0].appendChild(oJs);
    }
  } // 通用请求方法


  function request(url, method, params, header, success, error) {
    var _url = url;
    var http_request = new XMLHttpRequest();

    http_request.onreadystatechange = function () {
      if (http_request.readyState == 4) {
        if (http_request.status == 200) {
          var _data = JSON.parse(http_request.responseText);

          success(_data);
        }
      }
    };

    http_request.open(method, _url, true); // http_request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    var data = new FormData();

    for (var i in params) {
      data.append(i, params[i]);
    }

    http_request.send(data);
  }

  function matchUrl(url) {
    var obj = {
      deviceSerial: '',
      channelNo: '1',
      hd: false,
      videoType: 0,
      validateCode: '',
      startTime: new Date().Format('yyyy-MM-dd') + ' 00:00:00',
      endTime: new Date().Format('yyyy-MM-dd') + ' 23:59:59',
    }
    if (/^ezopen:\/\//.test(url)) {
      obj.deviceSerial = url.split('/')[3];
      obj.channelNo = url.split('/')[4].split('.')[0];
    }
    if (url.indexOf('.hd') !== -1) {
      obj.hd = true;
    }
    if (url.indexOf('rec') !== -1) {
      obj.videoType = 1;
      if (getQueryString('begin', url)) {
        var formatStartTime = formatRecTime(getQueryString('begin', url), '000000');
        obj.startTime = new Date(reRormatRecTime(formatStartTime)).Format('yyyy-MM-dd hh:mm:ss');
      }
      if (getQueryString('end', url)) {
        var formatEndTime = formatRecTime(getQueryString('end', url), '235959');
        obj.endTime = new Date(reRormatRecTime(formatEndTime)).Format('yyyy-MM-dd hh:mm:ss');
      }
    }
    return obj;
  }

  var EZUIKitHd = function (params) {
    var jsWebControlJS = './jsWebControl-1.0.0.min.js';
    var _this = this;
    this.switchVideo = 0;
    addJs(jsWebControlJS, function () {
      // 全局变量
      _this.oWebControl = null;
      _this.accessToken = 'at.1cuih5uc7e6mqnxc646n0drydf8mnw22-41wt82dhya-0ozcba0-wayygtu4x';
      //_this.accessToken = 'at.7wkytjdr03p61td414qent7n48x26lgh-968hywjbri-12fpi1p-yjwnn4tzo';
      _this.accessToken = 'ar.5dpkerxs2a7m2ktz83evtkub3fpxx71s-5mmk99p2o9-03u5ywu-jigs9mszm';
      _this.layout = 1;
      _this.width = 600;
      _this.height = 400;
      var container = document.getElementById(params.id);
      if(container.offsetWidth) {
        _this.width = container.offsetWidth;
      }
      if(container.offsetHeight) {
        _this.height = container.offsetHeight;
      }

      // 初始化方法
      function WebControlInit(id, cbConnectSuccess, cbConnectError, cbConnectClose) {
        return new WebControl({
          szPluginContainer: id,
          iServicePortStart: 14510, // 对应 LocalServiceConfig.xml 中的ServicePortStart值
          iServicePortEnd: 14519, // 对应 LocalServiceConfig.xml 中的ServicePortEnd值
          cbConnectSuccess: cbConnectSuccess,
          cbConnectError: cbConnectError,
          cbConnectClose: cbConnectClose,
        });
      }
      // 监听视频控件的事件
      function cbIntegrationCallBack(oData) {
        console.log("oData", oData)
      }
      function cbConnectSuccess() {
        // 设置窗口控制回调
        _this.oWebControl.JS_SetWindowControlCallback({
          cbIntegrationCallBack: cbIntegrationCallBack,
        });
        //创建视频窗口
        _this.oWebControl
          .JS_StartService('window', {
            dllPath: './chain/cloudTransform.dll',
          })
          .then(function () {
            _this.oWebControl.JS_CreateWnd('playWnd', _this.width, _this.height).then(function () {
              console.log('JS_CreateWnd success');
            });
          });
      }

      function cbConnectError() {
        console.log('cbConnectError');
        _this.oWebControl = null;
        console.error('确认本地进程是否已安装并开启成功！');
        var container = document.getElementById(params.id);
        container.innerHTML = "插件启动失败，请检查插件是否安装！";
        container.style = "width:"+_this.width + "px;height:"+_this.height + 'px;color:#fff;background:#000000;text-align:center;line-height:' + _this.height + 'px'; 
        var download = document.createElement('a');
        download.setAttribute('href',"https://download2.ys7.com/openweb/web/CloudViewSetup.exe");
        download.style = "color:#1890ff";
        download.innerHTML="点击下载插件";
        document.getElementById(params.id).append(download)


      }

      function cbConnectClose(bNormalClose) {
        // 连接异常断开：bNormalClose = false
        // JS_Disconnect正常断开：bNormalClose = true
        console.log('cbConnectClose');
        oWebControl = null;
      }
      // 销毁视频控件
      function WebControlDistory() {
        // var bIE = !!window.ActiveXObject || 'ActiveXObject' in window // 是否为IE浏览器
        if (oWebControl != null) {
          _this.oWebControl.JS_DestroyWnd().then(
            function () {
              console.log('JS_DestroyWnd');
            },
            function () { }
          );
          _this.oWebControl.JS_StopService('window').then(function () {
            _this.oWebControl.JS_Disconnect().then(
              function () {
                console.log('JS_Disconnect');
              },
              function () { }
            );
          });
        }
      }
      // 初始化
      _this.oWebControl = WebControlInit(
        'playWnd',
        cbConnectSuccess,
        cbConnectError,
        cbConnectClose
      );

      // 一些窗口事件
      window.onscroll = function () {
        if (_this.oWebControl != null) {
          _this.oWebControl.JS_Resize(_this.width, _this.height);
        }
      };
      window.onresize = function () {
        if (_this.oWebControl != null) {
          _this.oWebControl.JS_Resize(_this.width, _this.height);
        }
      };
      window.onunload = function () {
        try {
          _this.oWebControl.JS_HideWnd();
          WebControlDistory();
        } catch (error) {
          console.error(error);
        }
      };
      window.onpagehide = function () {
        try {
          _this.oWebControl.JS_HideWnd();
        } catch (error) {
          console.error(error);
        }
      };

    })
  }
  EZUIKitHd.prototype.init = function (params) {
    var self = this;
    if (!params.accessToken) {
      //if (!self.appKey || !self.ezvizToken) {
      alert("请输入accessToken")
      console.log("accessToken")
      return;
    }
    // 初始化入参
    var argumentsPram = {
      layout: params.layout,
      userName: "",
      waterMark: "",
      waterMark: "0",
      iWndType: params.videoType,
      intelligenceEnable: 0,
      isRecord: 1,
      playMode: 1,
      isSetPos: 0,
      motionDetectEnable: 0,
      playBackAlarmOverlyingEnable: 0,
      response: {
        code: 0,
        message: null,
        data: {
          appKey: '',
          ezvizToken: params.accessToken,
          videoLevel: 0, // 0-标清 1-均衡 2-高清
          showMainTool: 1,
          showSubTool: 1,
          waterMark: "1",
          userName: "",
          platformId: self.platformId,
        },
      },
    };
    console.log('初始化入参', argumentsPram);
    // 调用视频控件初始化方法
    self.oWebControl
      .JS_RequestInterface({
        funcName: 'Init',
        arguments: encodeURI(JSON.stringify(argumentsPram)),
      })
      .then(function (oData) {
        // self.showCBInfo(oData.responseMsg);
        // self.showTips(true, '视频初始化成功！');
        console.log("视频初始化成功！")
      });
  }
  EZUIKitHd.prototype.play = function (url) {
    var playParams = matchUrl(url);
    console.log("matchUrl result",playParams)
    var self = this;
    // 预览入参
    var argumentsPram = {
      response: {
        code: 0,
        message: null,
        data: {
          deviceSerial: playParams.deviceSerial,
          channelCode: 1,
          channelNo: 1,
          codeIsEncrypt: 1,
          validateCode: playParams.validateCode,
          deviceClass: 0,
          deviceType: "10222",
          //deviceType:"10240",
          channelId: url,
          channelName: "",
          storeName: playParams.deviceSerial,
          storeId: "",
          startTime: playParams.startTime,
          endTime: playParams.endTime,
          //Limited_start:limitStart,
          //Limited_end:limitEnd,
        },
      },
    };
    if (self.deviceClass === '1') { // 国标协议对应的两个字段
      argumentsPram.response.data.channelCode = self.channelNo
      argumentsPram.response.data.platformId = self.platformId
    } else { // 海康协议对应的一个字段
      argumentsPram.response.data.channelNo = 1
    }
    argumentsPram.response.data.channelNo = 1;
    console.log('预览/回放入参', argumentsPram);
    // 调用视频控件预览方法
    self.oWebControl
      .JS_RequestInterface({
        funcName: playParams.videoType === 0 ? 'StartPreview' : 'StartPlayback',
        arguments: encodeURI(JSON.stringify(argumentsPram)),
      })
      .then(function (oData) {
        console.log(oData.responseMsg)
        // self.showCBInfo(oData.responseMsg);
        // self.showTips(true, '预览/回放成功！');
      });
  }
  EZUIKitHd.prototype.switchVideoType = function (num) {
    var self = this;
    this.switchVideo = num;
    if (self.oWebControl) {
      self.oWebControl
        .JS_RequestInterface({
          funcName: 'ChangeModel',
          arguments: encodeURI(
            JSON.stringify({
              model: num,
            })
          ),
        })
        .then(function (oData) {
          //self.play("ezopen://open.ys7.com/C69594192/1.rec");
        });
    }
  }
  EZUIKitHd.prototype.openSound = function () {
  }
  window.EZUIKitHd = EZUIKitHd;

  if (!noGlobal) {
    window.EZUIKitHd = EZUIKitHd;
  }
  return EZUIKitHd;
})