/**
 * Created by Sara on 2015/5/28.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var propUtils = require('uw-utils').propUtils;
var uwData = require("uw-data");
var consts = uwData.consts;
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var kingBiz = require("uw-king").kingBiz;
var uwClient = require("uw-db").uwClient;
var ds = require("uw-ds").ds;
var c_prop = uwData.c_prop;
var gameRecordBiz = require("uw-game-record").gameRecordBiz;
var gameRecordSerial = require("uw-serial").gameRecordSerial;

var proto = module.exports;

/**
 * 获取数据
 * @iface getInfo
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.King
 */
proto.a = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    var accountId = session.get(consts.session.accountId);

/*    var k = new ds.King();
    k.myGuildId = 1;//自己行会id
    k.myGuildName = "我的基佬会";//自己行会名
    k.myWorshipNum = 10;//自己膜拜次数
    k.myWelfare = 10;//领取福利次数
    k.kingGuildId = 10;//霸主行会id
    k.kingGuildName = "霸主基佬会";//霸主行会名
    k.kingGuildLvl = 20;//霸主行会等级
    k.kingId = 20;
    k.kingName = "霸主基佬老大";//霸主名字
    k.kingVip = 30;//霸主vip
    k.kingLvl = 200;//霸主等级
    k.kingHeroDisplay = [1,2,3,1];//霸主外观
    k.beWorshipNum = 50;//被膜拜的次数
    k.buffOpenNum = 52;//buff开启次数
    k.buffEndTime = (new Date()).addHours(24);//buff结束时间
    return next(null,wrapResult(null,k,dsNameConsts.King));*/
    //接口调用
    kingBiz.getInfo(uwClient,userId  ,function(err,data){
        if(err) return next(null,wrapResult(err));
        next(null,wrapResult(null,data,dsNameConsts.King));
    })
};

/**
 * 膜拜
 * @iface worship
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.ExKing
 */
proto.b = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    kingBiz.worship(uwClient,userId  ,function(err,data){
        if(err) return next(null,wrapResult(err));
        //[updateUser,bagItems,updateChallengeCup]
        var updateUser = data[0];
        var bagItems = data[1];
        var updateChallengeCup = data[2];

        var king = new ds.King();
        king.beWorshipNum = updateChallengeCup.worship;
        king.beWorshipCount = updateChallengeCup.worshipCount;
        var exKing = new ds.ExKing();
        exKing.king = king;
        exKing.userData = updateUser;
        exKing.bagItems = bagItems;
        next(null,wrapResult(null,exKing,dsNameConsts.ExKing));
    })
};

/**
 * 领取福利
 * @iface receiveWelfare
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.ExKing
 */
proto.c = function (args, session, next) {
    var userId = session.get(consts.session.userId); 
    //接口调用
    kingBiz.receiveWelfare(uwClient,userId  ,function(err,data){
        if(err) return next(null,wrapResult(err));
        //[updateUser,bagItems,getDiamond]
        var updateUser = data[0];
        var bagItems = data[1];
        var getDiamond = data[2];


        var exKing = new ds.ExKing();
        exKing.userData = updateUser;
        exKing.bagItems = bagItems;

        // if(getDiamond>0){
        //     gameRecordSerial.add(userId,function(cb1){
        //         gameRecordBiz.setDiamondRecord(uwClient,userId,c_prop.diamondGetTypeKey.kingWelfare,getDiamond, cb1);
        //     });
        // }
        next(null,wrapResult(null,exKing,dsNameConsts.ExKing));
    })
};


/**
 * 开启buff
 * @iface openBuff
 * @args
 * @param args
 * @param session
 * @param next
 * @returns ds.King
 */
proto.d = function (args, session, next) {
    var userId = session.get(consts.session.userId);
    //接口调用
    kingBiz.openBuff(uwClient,userId  ,function(err,data){
        if(err) return next(null,wrapResult(err));
        var k = new ds.King();
        k.buffOpenTime=data.buffOpenTime;
        k.buffOpenNum=data.buffOpenNum;
        k.buffEndTime=data.buffEndTime;
        k.beWorshipNum=data.worship;

        next(null,wrapResult(null,k,dsNameConsts.King));
    })
};
