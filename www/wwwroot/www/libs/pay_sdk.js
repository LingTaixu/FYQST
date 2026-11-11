/*
	sdk 引用下列值：
	params_analysis.js 中的mZmEngine.mChannelParams.token
	URL.js 中的 mZmParams# zapid gameid

	

*/
$ZMLF.script("libs/acpay_single_1.0.1.min.js?r=" + new Date().getTime()).wait(
    function () {}
);

var ZmSdk = (function () {

    var instance;
    //这里实现逻辑
    function createInstance() {
        //这个根据具体的sp名称命名 由createacfun()方法进行实例化 TODO
        var acfun;

        var zmUtils;

        var frameDeep;
        var userJson = {};

        function isReady() {
                return userJson.userdata && userJson.userdata.uid;
            }
            /*
			向zmserver请求添加基本参数
		*/

        function addBaseParams(requestJsonData) {
            try {
                if (iplook.ret == 1) {
                    requestJsonData["ip"] = iplook.ip;
                    requestJsonData["city"] = (iplook.city);
                    requestJsonData["country"] = (iplook.country);
                    requestJsonData["province"] = (iplook.province);
                }
            } catch (er) {}
            requestJsonData["appid"] = mZmParams.zapid;
            requestJsonData["prover"] = mZmParams.prover;
            requestJsonData["channel"] = mZmParams.channel;
            requestJsonData["zmuid"] = userJson.userdata.uid;
            requestJsonData["sdkindx"] = mZmParams.sdkindx;
            requestJsonData["channlesdkver"] = mZmParams.channlesdkver;
            requestJsonData["includezmsdk"] = "0";
        }

        /*这里实现zmsdk相关业务 start*/
        //不支持
        function Base64Encode(s) {
                // var map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                var map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                if (!s) {
                    return;
                }
                s += '';
                if (s.length === 0) {
                    return s;
                }
                //这里排除中文编码
                // s = escape(s);

                var i, b, x = [],
                    padchar = map[64];
                var len = s.length - s.length % 3;

                for (i = 0; i < len; i += 3) {
                    b = (s.charCodeAt(i) << 16) | (s.charCodeAt(i + 1) << 8) | s.charCodeAt(i + 2);
                    x.push(map.charAt(b >> 18));
                    x.push(map.charAt((b >> 12) & 0x3f));
                    x.push(map.charAt((b >> 6) & 0x3f));
                    x.push(map.charAt(b & 0x3f));
                }

                switch (s.length - len) {
                case 1:
                    b = s.charCodeAt(i) << 16;
                    x.push(map.charAt(b >> 18) + map.charAt((b >> 12) & 0x3f) + padchar + padchar);
                    break;
                case 2:
                    b = (s.charCodeAt(i) << 16) | (s.charCodeAt(i + 1) << 8);
                    x.push(map.charAt(b >> 18) + map.charAt((b >> 12) & 0x3f) + map.charAt((b >> 6) & 0x3f) + padchar);
                    break;
                }
                return x.join('');
            }
            /* 这个接口不对外 */

        function reportUser() {
                var userinfojson = {
                    "username": userJson.userdata.name
                };

                addBaseParams(userinfojson);

                zmUtils.ajax(mZmEngine.zmRUSP,
                    JSON.stringify(userinfojson),
                    function (data) {
                        console.log("reportuser ret_code_:" + data.code);
                    });
            }
            /*这里实现zmsdk相关业务 end*/

        /*这里实现第三方sdk相关业务 start TODO*/
        function createacfun() {

                var supportMethods = "|init|pay|getUserInfo|reportRoleStatus|";
                return {
                    isSupportMethod: function (methodStr) {
                            return supportMethods.indexOf("|" + methodStr + "|") < 0 ? false : true;
                        },
                        init: function (callback) {
                            console.log("acfun init start...");
                            //用户认证
                            var getjsonCb = function (jsonobj) {
                                console.log("acfun ajax ret jsonobj_:", jsonobj);
                                if (jsonobj.status == "0") { //成功
                                    callback && callback.call(null, {
                                        "success": "ok",
                                        "userjson": jsonobj
                                    });
                                } else {
                                    sdk.showLoginWnd();
                                    console.error(jsonobj);
                                    console.error("acfun init fail");
                                    callback && callback.call(null, {
                                        "error": jsonobj.err
                                    });
                                }
                            };

                            window.sdk = new Acsdk(mZmParams.ukey, function (obj) {
                                console.log('token:', obj.token, 'uid:', obj.uid)

                                var authparam = {
                                    "app": {
                                        "appid": mZmParams.zapid,
                                        "appkey": mZmParams.zapkey,
                                        "sdkid": mZmParams.sdkindx
                                    },
                                    "sdk": {
                                        "token": obj.token,
                                        "uid": obj.uid
                                    }
                                };
                                var param = {
                                    "appid": mZmParams.zapid,
                                    "sdkindx": mZmParams.sdkindx,
                                    "authparam": Base64Encode(JSON.stringify(authparam)) //TODO
                                };
                                zmUtils.ajax(mZmEngine.zmUASP, JSON.stringify(param), getjsonCb);

                            }, function (reason) {
                                console.log('fail:', reason)
                            });

                            if (window.localStorage.getItem("acfunusertoken")) {
                                var authparam = {
                                    "app": {
                                        "appid": mZmParams.zapid,
                                        "appkey": mZmParams.zapkey,
                                        "sdkid": mZmParams.sdkindx
                                    },
                                    "sdk": {
                                        "token": window.localStorage.getItem("acfunusertoken")
                                    }
                                };
                                var param = {
                                    "appid": mZmParams.zapid,
                                    "sdkindx": mZmParams.sdkindx,
                                    "authparam": Base64Encode(JSON.stringify(authparam)) //TODO
                                };
                                zmUtils.ajax(mZmEngine.zmUASP, JSON.stringify(param), getjsonCb);
                            } else {
                                sdk.showLoginWnd();
                            }

                            console.log("acfun init end...");
                        },

                        pay: function (data) {
                            console.log("acfun pay start...");
                            sdk.makeOrder(data);
                            console.log("acfun pay end...");
                        }

                };

            }
            /*这里实现第三方sdk相关业务 end*/

        /////////////////////////////////////////////////////////////////////////////////////
        //这个对外方法
        ////////////////////////////////////////////////////////////////////////////////////
        return {
            //////////////////////////////////////////////////////////////////////////
            //下面方法是zm必须的
            ///////////////////////////////////////////////////////////////////////////
            /*
				sdk实例化的时候调用 做一些基本的实例化操作
			*/
            paramInit: function () {
                    //初始化gameacfun
                    if (!acfun) {
                        acfun = createacfun();
                    }
                    if (!zmUtils) {
                        zmUtils = new ZmSdkUtils();
                    }
                    userJson["common"] = {
                        "sdkindx": mZmParams.sdkindx,
                        "channel": mZmParams.channel,
                        "sdkname": "acfun"
                    };
                    userJson["userdata"] = {};
                },
                ////////////////////////////////////////
                //这里方法根据spsdk的情况进项统一 TODO
                ///////////////////////////////////////
                init: function (callback) {
                    console.log("ZmSdk init start...");

                    var zmcb_init = function (data) {

                        if (data.success) {
                            if (data.userjson) {
                                // var uid = data.userjson.userdata.uid;
                                userJson["userdata"] = data.userjson.userdata;
                                // userJson.userdata.uid = uid;
                            }
                            callback && callback.call(null, {
                                "retcode": "0"
                            });
                            //上报用户
                            reportUser();
                        } else {
                            callback && callback.call(null, {
                                "retcode": "1"
                            });
                        }
                        //处理自己的逻辑 TODO
                        console.log("cp call init and callback ret=succ_:" + data.success + " err_:" + data.error);
                    }
                    acfun.init(zmcb_init);

                    console.log("ZmSdk init end...");
                },
                /*
				payinfojson {"feeid":"","fee":金额 分,"feename":"商品名称","extradata":"透传参数"}
				orderid: "",			// 订单号
				money: 1,				// 订单金额（单位：分）
				product: "测试商品",	// 商品名称
				spid: "",				// 第三方 spid
				sign: "",				// 签名
				attach: "",				// 附加参数

				onpaycallback(ret):
					ret.retcode 0 succ 1 fail 2 cancel
					ret.msg "error message"
			*/
                pay: function (payinfojson, onPayCallback) {
					BTGameSDK.pay(payinfojson.feename, payinfojson.fee, payinfojson.extradata, payinfojson.check)
					onPayCallback && onPayCallback.call(null, {
						"retcode": "0",
						"msg": "ok"
					});
                },
                // 实际调用登录相关
                getUserInfo: function () {
                    // console.log("acfun getUserInfo start...");
                    // if(!isReady()){
                    // console.error("getUserInfo fail! call init() first...");
                    // return {};
                    // }
                    // console.log("acfun getUserInfo end...");
					var $_GET = (function(){
						var url = window.document.location.href.toString();
						var u = url.split("?");
						if(typeof(u[1]) == "string"){
							u = u[1].split("&");
							var get = {};
							for(var i in u){
								var j = u[i].split("=");
								get[j[0]] = j[1];
							}
							return get;
						} else {
							return {};
						}
					})();
                    var data = {
                        "common": {
                            "sdkindx": "10776",
                            "channel": "h5_acfun",
                            "sdkname": "acfun"
                        },
                        "userdata": {
                            "name": $_GET['account'],
                            "sign": $_GET['sign'],
                            "t": $_GET['time'],
                            "uid": $_GET['account']
                        }
                    };
                    return data;
                },

                reportRoleStatus: function (roleInfoJSON) {
                    if (!isReady()) {
                        console.error("reportRoleStatus fail! call init() first...");
                        return;
                    }
                    if (roleInfoJSON) {
                        try {
                            JSON.stringify(roleInfoJSON);
                            if (!roleInfoJSON["datatype"]) {
                                console.error("**not found datatype,and cancel this request...**");
                                return;
                            }
                        } catch (e) {
                            //入参有问题
                            console.error("**roleInfoJSON cannt be parsed to JSON**");
                            return;
                        }
                        addBaseParams(roleInfoJSON);
                        zmUtils.ajax(mZmEngine.zmRSSP,
                            JSON.stringify(roleInfoJSON),
                            function (data) {
                                console.log("reportRoleStatus ret_code_:" + data.code);
                            });
                    } else {
                        console.error("**roleInfoJSON is empty**");
                    }
                },
                isSupportMethod: function (methodStr) {
                    return acfun.isSupportMethod(methodStr);
                },
                /*
				设置cp游戏iframe层级
			*/
                setFrameDeep: function (mframeDeep) {
                    frameDeep = mframeDeep || 0;
                }
        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
                instance.paramInit();
            }
            return instance;
        },
    };
})();
console.log("zmsdk.js");