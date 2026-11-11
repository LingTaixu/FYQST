/**
 * Created by Sara on 2015/11/12.
 */
var arenaDao = require("uw-arena").arenaDao;
var arenaBiz = require("uw-arena").arenaBiz;
var uwData= require("uw-data");
var c_prop = uwData.c_prop;
var uwClient = require("uw-db").uwClient;
var mainClient = require("uw-db").mainClient;
var async = require("async");
var exports = module.exports;

exports.refresh = function(cb){
    arenaDao.listCols(uwClient,"id,userId,rank", " 1=1 order by rank asc",[],function(err,arenaList) {
        if (err) return cb(err);
        var rankAdd = 0;
        var errArr = [];
        for(var i = 0;i<arenaList.length;i++){
            var locArena = arenaList[i];
            if(locArena.rank>0){
                rankAdd++;
                locArena.rank = rankAdd;
            }else{
                errArr.push(locArena);
            }
        }
        for(var i = 0;i<errArr.length;i++){
            var locArena = errArr[i];
            rankAdd++;
            locArena.rank = rankAdd;
        }

        for(var i = 0;i<arenaList.length;i++){
            var locArena = arenaList[i];
            locArena.fightRanks = arenaBiz.calRankRange(locArena.rank);
        }

        //var fightRanks = exports.calRankRange(arenaEntity.rank);
        //arenaEntity.fightRanks = fightRanks;

        async.map(arenaList,function(arenaData,cb1){
            arenaDao.update(uwClient,{rank:arenaData.rank,fightRanks:arenaData.fightRanks},{id: arenaData.id},cb1);
        },function(err,data){
            if (err) return console.log(err);
            console.log("执行完毕!");
            console.log("一共[%s]条数据!",arenaList.length);
        });
    });
};

exports.refresh();