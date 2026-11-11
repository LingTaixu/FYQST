/**
 * Created by Administrator on 2015/7/10.
 */
var md5Utils = require("uw-utils").md5Utils;
var httpUtils = require("uw-utils").httpUtils;
var logger = require('uw-log').getLogger("uw-logger",__filename);
var uwData = require("uw-data");
var c_channel = uwData.c_channel;
var c_payInfo = uwData.c_payInfo;
var c_recharge = uwData.c_recharge;
var querystring = require('querystring');
var hashesUtils = require("uw-utils").hashesUtils
var sha1 = new hashesUtils.SHA1();
var sha256 = new hashesUtils.SHA256();
var crypto = require('crypto');

var getMsg = require("uw-utils").msgFunc(__filename);
var c_msgCode = uwData.c_msgCode;

var exports = module.exports;

/**
 * md5加密
 * @param appKey
 * @param params
 * @returns {string}
 */
exports.getMd5Params = function(appKey,params){
    //按照key升序后，key1=value1key2=value2key3…拼接成的字符串+appkey,最后做md5
    var sign = "";
    var strPram = "";
    for (var key in params) {
        sign += key + "=" + params[key];
        strPram += "&" + key + "=" + params[key];
    }
    sign = md5Utils.md5(sign + appKey);
    params.sign = sign;
    strPram += "&sign=" + sign;
    strPram = strPram.substr(1, strPram.length - 1);
    return strPram;
};


/**
 * sha1加密
 * @param appKey
 * @param params
 * @returns {string}
 */
exports.getLimiSha1Params = function(method, path, appKey,params){
    //按照key升序后，key1=value1key2=value2key3…拼接成的字符串+appkey,最后做sha1, base64
    var sign = "";
    var strData = method;
    strData += "&" + querystring.escape(path);
    var strPram = "";
    var keyArr = Object.keys(params);
    keyArr.sort();
    for(var i = 0; i < keyArr.length; i++){
        var key = keyArr[i];
        strPram += "&" + key + "=" + params[key];
    }
    strPram = strPram.substr(1, strPram.length - 1);
    var strPram2 = querystring.escape(strPram);
    strData += "&" + strPram2;
    console.log("STRDATA:", strData);
    var sign = sha1.b64_hmac(appKey, strData);
   // strPram += "&sig=" + sign;
    return  sign;
};

exports.hex2bin = function(s) {
  //  discuss at: http://locutus.io/php/hex2bin/
  // original by: Dumitru Uzun (http://duzun.me)
  //   example 1: hex2bin('44696d61')
  //   returns 1: 'Dima'
  //   example 2: hex2bin('00')
  //   returns 2: '\x00'
  //   example 3: hex2bin('2f1q')
  //   returns 3: false

  var ret = [];
  var i = 0;
  var l;

  s += '';

  for (l = s.length; i < l; i += 2) {
    var c = parseInt(s.substr(i, 1), 16);
    var k = parseInt(s.substr(i + 1, 1), 16);
    if (isNaN(c) || isNaN(k)) return false;
    ret.push((c << 4) | k);
  }
  var buf = new Buffer(ret);
  return buf;
}

/**
 * sha1加密
 * @param appKey
 * @param params
 * @returns {string}
 */
exports.getSha1Params = function(appKey,params){
    //按照key升序后，key1=value1key2=value2key3…拼接成的字符串+appkey,最后做md5
    var sign = "";
    var strPram = "";
    for (var key in params) {
        strPram += "&" + key + "=" + params[key];
    }
    strPram = strPram.substr(1, strPram.length - 1);
    sign = sha1.hex(strPram+appKey);
    strPram += "&signature=" + sign;

    return strPram;
};

/**
 * 获取md5签名
 * @param appKey
 * @param signParams
 * @returns {string}
 */
exports.getMd5Sign = function(appKey,signParams){
    var sign = "";
    for (var key in signParams) {
        sign += key + "=" + signParams[key];
    }
    sign = md5Utils.md5(sign + appKey);
    return sign;
};

/**
 * 获取sha1签名
 * @param appKey
 * @param signParams
 * @returns {string}
 */
exports.getSha1Sign = function(appKey,signParams){
    //按照key升序后，key1=value1key2=value2key3…拼接成的字符串+appkey,最后做md5
    var sign = "";
    var strPram = "";
    for (var key in signParams) {
        strPram += "&" + key + "=" + signParams[key];
    }
    strPram = strPram.substr(1, strPram.length - 1);
    sign = sha1.hex(strPram+appKey);
    return sign;
};

//如果对不上则，按照价格来发钻石
exports.getRechargeIdByMoney = function(money,channelId){
    var rechargeId = 0;
    for(var key in c_recharge){
        var locData = c_recharge[key];
        var locMoney = locData.cost;
        if (parseInt(money) == parseInt(locMoney)) {
            rechargeId = key;
        }    
        if (rechargeId) break;
    }
    return rechargeId;
};

/**
 * 请求数据
 * @param options
 * @param cb
 */
exports.requestData = function(options,cb){
    logger.debug("login requestHttp options:",options);
    //console.log(options);
    httpUtils.requestHttp(options, "", function (err, result) {
        if (err){
            logger.error("request egret sdk error:%s result:%s options:%j",JSON.stringify(err),result,options);
            return cb(getMsg(c_msgCode.reqFail));//请求失败
        }
        logger.debug("login requestHttp result:",result);
        try {
            //console.log(result);
            if (typeof result == "string") {
                result = JSON.parse(result);
            }
        } catch (e) {
            logger.error("convert egret sdk data error:%s result:%s options:%j",JSON.stringify(e),result,options);
            return cb(getMsg(c_msgCode.reqFail));//请求失败
        }
        if (result.status == 0) {
            cb(null, result.data);
        } else {
            logger.error("request egret sdk error:%s result:%j options:%j",JSON.stringify(err),result,options);
            return cb(getMsg(c_msgCode.reqFail));//请求失败
        }
    });
};

/**
 * 请求数据方式2
 * @param options
 * @param cb
 */
exports.requestData2 = function(options,cb){
    logger.debug("login requestHttp options:",options);
    //console.log(options);
    httpUtils.requestHttp(options, "", function (err, result) {
        if (err){
            logger.error("request egret sdk error:%s result:%s options:%j",JSON.stringify(err),result,options);
            return cb(getMsg(c_msgCode.noPfData));//请求不到平台方数据，请稍后重试
        }
        logger.debug("login requestHttp result:",result);
        try {
            //console.log(result);
            if (typeof result == "string") {
                result = JSON.parse(result);
            }
        } catch (e) {
            logger.error("convert egret sdk data error:%s result:%s options:%j",JSON.stringify(e),result,options);
            return cb(getMsg(c_msgCode.pfDataReqError));//平台方请求数据格式错误，请稍后重试
        }
        if (result.code == 0) {
            cb(null, result.data);
        } else {
            logger.error("request egret sdk error:%s result:%j options:%j",JSON.stringify(err),result,options);
            return cb(getMsg(c_msgCode.pfDataAbnormal));//平台方请求状态异常，请稍后重试
        }
    });
};

// var params = {
//     playerId:"80086000152083548",
// appId:"H100319675",
// ts:"1530789241810",
// sign:"92A559875013B7389967DF3498A62CBF4737B856CDA54417EF6F6C5072AB69B70524D4907E559A05BD9A2B795A919B221815E4BAE6BB490ACF45D9A799989523CDC148C8592BF49E8D5AFBB6588E21F3D2F17B9EE44D90C4701BE6CDC267787198B076F7A7C16E1DB9DF336EEFC7BE99631F7A01D1B3541928F55999C8DD798AA2F52B5AA88666A9E7153FE55BCDE1766532F46F5B06CF520353B59A6C45A7CD4917E7612CF28D8A0DA601E83CF41C0C1015FAF8078D59AAE149D647522BB451FCC11C33491C0CA42AF8BE64A06A0AC79B5DE36CA2487DEC9EF47E1D42F5CBB553552B444C534C25716C24CC26A5FB29E091EA2B0B1892EA085CC7CCCB1FD0D7"};

// var loginKey = "";
// var fs = require("fs");
// var loginKey = fs.readFileSync("publicKey.pem","utf-8");
// console.log(loginKey);
//  var S = exports.checkHuaweiSha256(params, loginKey);
// console.log(S);

