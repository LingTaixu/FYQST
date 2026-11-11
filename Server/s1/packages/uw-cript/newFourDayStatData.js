/**
 * Created by Sara on 2016/6/22.
 */
var heroDao = require("uw-hero").heroDao;

var async = require("async");
var exports = module.exports;
var scriptUtils = require("./scriptUtils");

var check = function(serverData,sClient,cb){
    //if(serverData.status != 1)  return cb(null,0);
    heroDao.listCols(sClient,"id,wingArr,gemArr,realmLvl,realmArr,wingSumLvl,gemSumLvl,realmSumLvl"," 1=1 ",[],function(err,heroList){
        if(err) return console.log(err);
        for(var i = 0;i<heroList.length;i++){
            var heroData =  heroList[i];
            var wingArr = heroData.wingArr || [];       //翅膀[id,等级,星级,当前星经验]
            if(wingArr.length > 0){
                var wingLvl = wingArr[1] || 0;
                var star = wingArr[2] || 0;
                heroData.wingSumLvl = parseInt(wingLvl) * 100 + parseInt(star);       //翅膀等级*100+星数
            }
            var gemArr = heroData.gemArr || [];
            if(gemArr.length > 0){
                var gemSumLvl = 0;
                for(var j = 0;j<gemArr.length;j++){
                    var gemId = gemArr[j];
                    if(gemId){
                        if(gemId < 100){
                            gemSumLvl += parseInt(gemId);
                        }else{
                            gemSumLvl += parseInt((gemId.toString().substr(gemId.toString().length - 2)));
                        }
                    }
                }
                heroData.gemSumLvl = gemSumLvl;
            }
            var realmArr = heroData.realmArr || [];
            var realmCount = 0;
            if(realmArr.length > 0){
                for(var j = 0;j<realmArr.length;j++){
                    if(realmArr[j]) realmCount += 1;
                }
            }
            heroData.realmSumLvl = parseInt(heroData.realmLvl) * 100 + realmCount;         //境界等级 * 100 + 已装备个数

            //wingSumLvl,gemSumLvl,realmSumLvl
            if(heroData.wingSumLvl > 0 || heroData.gemSumLvl > 0 || heroData.realmSumLvl > 0) heroDao.update(sClient,{wingSumLvl:heroData.wingSumLvl,gemSumLvl:heroData.gemSumLvl,realmSumLvl:heroData.realmSumLvl},{id: heroData.id},function(){});
        }
        cb(null,1);
    });
};

scriptUtils.runAllServers(check);
