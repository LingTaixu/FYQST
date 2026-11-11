/**
 * Created by Administrator on 2015/3/24.
 */
var mainClient = require("uw-db").mainClient;
var sdkUtils = require("./sdkUtils.js");
var loginClient = require('uw-db').loginClient;
var getMsg = require("uw-utils").msgFunc(__filename);
var c_msgCode = require("uw-data").c_msgCode;

var accountDao;
var rechargeRequestDao;
var channelBizDic; 
var channelNameDic;

var checkRequire = function(){
    accountDao = require('uw-account').accountDao;
    rechargeRequestDao = require('uw-recharge').rechargeRequestDao;

    if(!channelBizDic){
        channelBizDic = {
            "10001":require("../biz/egret/egretBiz"),
            "10002":require("../biz/wanba/wanbaBiz"),
            "10003":require("../biz/egret/egretBiz"),
            "10004":require("../biz/wanba/wanbaBiz"),
            "10005":require("../biz/hgame/hgameBiz"),
            "10006":require("../biz/soeasy/soeasyBiz"),
            "10007":require("../biz/ty/tyBiz"),
            "10008":require("../biz/kr/krBiz"),
            "10009":require("../biz/xy/xyBiz"),
            "10010":require("../biz/awy/awyBiz"), 
            "10011":require("../biz/limi/limiBiz"),
            "10012":require("../biz/huawei/huaweiBiz"),
            "10013":require("../biz/hoolai/hoolaiBiz"),
            "10014":require("../biz/hoolai_ios/hoolaiIosBiz"),
            "10015":require("../biz/qqtest/qqtestBiz"),
            "10016":require("../biz/shoumeng/shoumengBiz"),
            "10018":require("../biz/hoolai/hoolaiBiz"),
            "10019":require("../biz/sm_ios/smIosBiz"),
            "99999":require("../biz/egret/egretBiz")
        };
    }
};

var exports = module.exports;

/**
 * 渠道名称
 * @param channelId
 */
// exports.channelName = function(channelInfo){

//     if (!channelNameDic){
//         channelNameDic = {
//             "10006" :"soeasy",
//             "10006_407":"yyb",
//             "10006_301":"lianwifi",   //H5_lianwifi（万能钥匙）
//             "10006_10220":"huawei",      //华为H5
//             "10006_10233":"zx",          //紫霞
//             "10006_10455":"ledong",      //乐动
//             "10006_10582":"lyy",         //天宇游
//             "10006_10454":"8090",           //8090
//             "10006_10726":"7723",        //7723
//             "10006_10260":"265g",        //265G
//             "10006_10636":"daka",        //福礼惠（大咖游戏）
//             "10006_10271":"cdsc",        //畅读书城
//             "10006_10263":"cczs",        //虫虫助手
//             "10006_10605":"xmly",        //喜马拉雅（新）
//             "10006_10449":"qk",          //趣酷
//             "10006_10386":"hjy",         //   欢聚游HJY（盛世游戏）
//             "10006_10358":"fh",          //    飞火
//             "10006_362":"hw",            //  火舞(阅玩)(欢趣)
//             "10006_10478":"lequ",    //  乐趣
//             "10006_10212":"xiao7",    //小七手游
//             "10006_10410":"07073",    //07073游戏网
//             "10006_352":"sdw",    //电魂（闪电玩）
//             "10006_10314":"5144",    //射阳形伊5144
//             "10006_10363":"7724",    //7724
//             "10006_381":"xmxx",    //厦门仙侠/45451
//             "10006_10382":"9g",    //9G_h5
//             "10006_10465":"lhh",    //乐嗨嗨
//             "10006_310":"iqiyi",    //爱奇艺
//             "10006_10531":"4399",    //4399
//             "10006_10209":"dangle",    //当乐
//             "10006_406":"xyw",    //X游网
//             "10006_320":"qhei",    //群黑游戏
//             "10006_328":"sina",    //新浪
//             "10006_10215":"4177",    //4177
//             "10006_10214":"333",    //333游戏
//             "10006_10308":"ywyx",    //阅文游戏中心
//             "10006_314":"budejie",    //百思不得姐(168)
//             "10006_303":"1758",    //1758
//             "10006_315":"zm",    //杭州掌盟
//             "10006_10535":"tt",    //TT游戏
//             "10006_10618":"87",    //87盒子
//             "10006_10729":"wf",     // 玩蜂
//             "10006_10724":"ymxk",     // 游民星空
//             "10006_10307":"7k7k",     // 7k7k
//             "10006_10733":"ziyun",     // 紫云
//             "10006_10730":"orange",     // 橙子游戏 
//             "10006_347":"hlr",     // 欢乐人
//             "10006_10225":"jyu",     // 鲸鱼游戏
//             "10006_10646":"gamefan",     // 游戏fan
//             "10006_10683":"zsyy",     // 中山优游
//             "10006_10734":"zhangyue",     // 掌阅
//             "10006_10739":"youxipa",     // 游戏葩
//             "10006_10602":"tcy",     // 同城游
//             "10006_10368":"haoy",     // 昊游互娱
//             "10006_10222":"gouzai",     // 狗仔游戏
//             "10006_10280":"gzyx",     // 果子游戏
//             "10006_10334":"g765",     // g765
//             "10006_10255":"511wan",     // 511wan
//             "10006_10660":"qimiao",     // 七淼互娱
//             "10006_10745":"ludashi",     // 鲁大师
//             "10006_10543":"263wan",     // 微游吧(263wan)
//             "10006_351" : "blw",        // 萝卜网络
//             "10006_316" : "xhb",        // 小伙伴
//             "10006_326" : "ximi",       // 小米
//             "10006_10380": "youwo",     // 上海游窝
//             "10006_10321": "niudao",     // 牛刀网络
//             "10006_348": "wyx",     // 微游戏
//             "10006_10748": "qwy",     // 趣微游 
//             "10006_345": "gamedog",     // 游戏狗
//             "10006_10347": "tsy",     // 淘手游
//             "10006_10590": "syj",       // 搜游记
//             "10006_386": "16you",       // 16游
//             "10006_10395": "3dm",       // 3DM
//             "10006_10728": "aotian",       // 傲天游戏
//             "10006_10656": "yyshouyou",       // yy手游
//             "10006_10654": "yyyeyou",       // yy页游
//             "10006_10603": "santang",       // 三唐游戏
//             "10006_10422": "yilewan",       // 易乐玩
//             "10006_10712": "tengqu",       // 腾趣

//             "10007":"tuyou",
//             "10008":"kr",
//             "10009":"xy",
//             "10010":"awy",
//             "10011":"limi",
//             "10012":"huawei",
//             "10013":"hoolai",
//             "10014":"hoolai_ios",
//             "99999":"local"
//         };
//     }

//     if (channelInfo.channelId == 99999){
//         return "local";
//     }
//      if(channelInfo.channelId == 10010){
//         return "tuyou";
//     }  
//     if(channelInfo.channelId == 10010){
//         return "awy";
//     }    
//     if(channelInfo.channelId == 10011){
//         return "limi";
//     }
//     if(channelInfo.channelId == 10012){
//         return "huawei";
//     }
//     if(channelInfo.channelId == 10013){
//         return "hoolai";
//     }
//     if(channelInfo.channelId == 10014){
//         return "hoolai_ios";
//     }
//     if(channelInfo.channelId == 10015){
//         return "qqtest";
//     }
//     if(channelInfo.channelId == 10016){
//         return "shoumeng";
//     }
//     if(channelInfo.channelId == 10018){
//         return "hoolaily";
//     }
//     var key = channelInfo.channelId;
//     if(channelInfo.sdkChannelId){
//         key = channelInfo.channelId + "_" + channelInfo.sdkChannelId;
//     } 
//     if (channelNameDic[key])
//         return channelNameDic[key];

//     return "unknown";    
// }

/**
 * 登陆获取数据
 * @param channelId
 * @param data [token]
 * @param cb
 */
exports.login = function(channelId,data,cb){
    _callFun(channelId,"login" ,data,cb);
};

/** 获取登录账户SDK数据
* @param accountId
* @param cb
*/
exports.getSdkData = function(accountId,cb){
    accountDao = require('uw-account').accountDao;
    accountDao.selectCols(loginClient,"id,sdkData",{id:accountId},function(err,accountData){
        if(err) return cb(err);
        cb(null,accountData);
    });
};

/**
 * 获取好友列表
 * @param channelId
 * @param data  [id]
 * @param cb
 */
exports.getFriendList = function(channelId,data,cb){
    _callFun(channelId,"getFriendList" ,data,cb);
};

/**
 * 获取vip信息
 * @param channelId
 * @param data  [id]
 * @param cb
 */
exports.getVip = function(channelId,data,cb){
    _callFun(channelId,"getVip" ,data,cb);
};

/**
 * 上报数据
 * @param channelId
 * @param data [id,score]
 * @param cb
 */
exports.setAchievement = function(channelId,data,cb){
    _callFun(channelId,"setAchievement" ,data,cb);
};

/**
 * 获取支付发送信息
 * @param channelId
 * @param data [rechargeId,openId,orderId,lvl]
 * @param cb
 */
exports.getPayData = function(channelId,data){
   return _callFun(channelId,"getPayData" ,data);
};

/**
 * 校验支付
 * @param orderData
 * @param cb
 */
exports.checkPay = function(orderData,cb){
    checkRequire();

    var reId = _getReId(orderData);
    rechargeRequestDao.select(mainClient,{orderNo:reId},function(err,rechargeRequestData){
        if(err) return cb(err);
        if(!rechargeRequestData) return cb(getMsg(c_msgCode.noPayNote, 'rechargeRequestData'));//cb("没有该记录rechargeRequestData");
        accountDao.select(loginClient,{id:rechargeRequestData.accountId},function(err,accountData){
            if(err) return cb(err);
            if(!accountData) return cb(getMsg(c_msgCode.noPayNote, 'accountData'));//cb("没有该记录accountData");
            
            orderData.rechargeRequestData = rechargeRequestData;
            //检验合法
            _callFun(accountData.channelId,"checkPay",orderData,function(err,data){
                if(err) return cb(err);
                //检验合法
                _callFun(accountData.channelId,"checkRechargeId",[rechargeRequestData,orderData,accountData.channelId],function(err,rechargeId){
                    if(err) return cb(err);

                    //console.log("checkPay:", rechargeRequestData.rechargeId, rechargeId);
                    rechargeRequestData.rechargeId = rechargeId;
                    rechargeRequestData.feeMoney = orderData.money || orderData.rmb;

                    //更新数据
                    if(rechargeRequestData.status>0) return cb(null);
                    rechargeRequestDao.update(mainClient,{status:1,transId: _getTransId(orderData),rechargeId:rechargeRequestData.rechargeId,feeMoney:rechargeRequestData.feeMoney},{id:rechargeRequestData.id},function(err,data){
                        if(err) return cb(err);
                        cb(null,accountData.channelId);
                    });
                });
            });
        });
    });
};

var _getReId = function(orderData){
    var reId = 0;
    if(orderData.requestId){
        reId = orderData.requestId;
    }else if(orderData.ext){
        reId = orderData.ext;
    }else if(orderData.game_orderno) {
        reId = orderData.game_orderno;
    }else if(orderData.extradata) {
        reId = orderData.extradata;
    }else if(orderData.other) {
        reId = orderData.other;
    }else if(orderData.txid){
        reId = orderData.txid;
    }
    return reId;
};

var _getTransId = function(orderData){
    var reId = "";
    if(orderData.orderid){
        reId = orderData.orderid;
    }else if(orderData.orderId) {
        reId = orderData.orderId;
    }else if(orderData.trans_id) {
        reId = orderData.trans_id;
    }else if(orderData.order_id) {
        reId = orderData.order_id;
    }
    return reId;
};

var _callFun = function(channelId,funName ,data,cb){
    checkRequire();
    var curBiz = channelBizDic[channelId];
    var fun = curBiz[funName];
    return fun.call(curBiz,data,cb);
};
