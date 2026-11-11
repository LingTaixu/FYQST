/**
 * Created by Administrator on 2017/11/30.
 */ 
var uwData = require("uw-data");
var consts = uwData.consts;
var client = require("uw-db").uwClient;
var dsNameConsts = uwData.dsNameConsts;
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var iface = uwData.iface;
var ds = require("uw-ds").ds; 
var achieveBiz =  require("uw-achieve").achieveBiz;
var cybBiz =  require("uw-achieve").cybBiz;
var jxBiz =  require("uw-achieve").jxBiz;
var proto = module.exports;


/**
 * 升级成就段位
 * @iface levelUp
 * @args
 * @param args
 * @param session
 * @param next
 * @return ds.Rebirth
 */
proto.a = function(args, session, next){
    var userId = session.get(consts.session.userId);
    achieveBiz.levelUp(client,userId,function(err,data){
        if(err) return next(null, wrapResult(err));
        var exData = new ds.Achieve();
        exData.userData = data[0];
        exData.heroList = data[1];
        next(null, wrapResult(null,exData,dsNameConsts.Achieve));
    });
}
 

 /**
 * 升级次元壁
 * @iface cybLevelUp
 * @args
 * @param args
 * @param session
 * @param next
 * @return ds.Rebirth
 */
proto.b = function(args, session, next){
    var userId = session.get(consts.session.userId);
    cybBiz.levelUp(client,userId,function(err,data){
        if(err) return next(null, wrapResult(err));
        var exData = new ds.Achieve();
        exData.userData = data[0];
        exData.heroList = data[1];
        next(null, wrapResult(null,exData,dsNameConsts.Achieve));
    });
}

/**
 * 升级军衔
 * @iface jxLevelUp
 * @args
 * @param args
 * @param session
 * @param next
 * @return ds.Rebirth
 */
proto.c = function(args, session, next){
    var userId = session.get(consts.session.userId);
    jxBiz.levelUp(client,userId,function(err,data){
        if(err) return next(null, wrapResult(err));
        var exData = new ds.Achieve();
        exData.userData = data[0];
        exData.heroList = data[1];
        next(null, wrapResult(null,exData,dsNameConsts.Achieve));
    });
}
 