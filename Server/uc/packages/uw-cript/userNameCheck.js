/**
 * Created by Administrator on 2016/2/16.
 */
/**
 * Created by Sara on 2015/11/12.
 */

var userDao = require("uw-user").userDao;

var async = require("async");
var exports = module.exports;var scriptUtils = require("./scriptUtils");

var check = function(serverData,sClient,cb){
    var bugNickName = "s" +serverData.indexId +".";
    userDao.listCols(sClient,"id, nickName ", " nickName = ? ",[bugNickName],function(err,dataList) {
        if (err) return cb(err);
        async.mapLimit(dataList,50,function(data,cb1){
            var updateData = {
                nickName:"s" +serverData.indexId +"."+ data.id
            }
            userDao.update(sClient,updateData,{id: data.id},cb1);
        },function(err,data){
            if (err) return cb(err);
            cb(null,dataList.length);
        });
    });
};

scriptUtils.runAllServers(check);
