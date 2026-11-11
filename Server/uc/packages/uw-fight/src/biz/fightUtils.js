/**
 * Created by Administrator on 2015/9/16.
 */

var uwData = require("uw-data");
var t_copy = uwData.t_copy;
var t_item = uwData.t_item;
var t_copyLoot = uwData.t_copyLoot;
var t_copyLootChild = uwData.t_copyLootChild;
var c_prop = uwData.c_prop;
var t_otherBuff = uwData.t_otherBuff;
var commonUtils = require("uw-utils").commonUtils;
var g_lootConfig = require("uw-global").g_lootConfig;
var g_buff = require("uw-global").g_buff;

/**
 * 获取得到掉落的物品
 * @param lootId
 * @returns {Array} [[物品id,数量],..]
 */
exports.getLootItems = function(lootId){
    var itemArr = [];
    var t_copyLootData = t_copyLoot[lootId];
    if(!t_copyLootData) return itemArr;
    //获取金币
    var gold = _calGold(t_copyLootData.moneyMin	,t_copyLootData.moneyMax,t_copyLootData.moneyProbability);
    if(gold){
        var locItem = [c_prop.spItemIdKey.gold,gold];
        itemArr.push(locItem);
    }

    //获取元宝
    var diamond = t_copyLootData.diamond;
    if(diamond){
        var locItem = [c_prop.spItemIdKey.diamond,diamond];
        itemArr.push(locItem);
    }

    //获取物品
    var lootCount = _calLootCounts(t_copyLootData.randCounts);
    for(var i = 0;i<lootCount;i++){
        var locLootChildId = _calLootId(t_copyLootData.lootChildIds);
        var locCopyLootChildData = t_copyLootChild[locLootChildId];
        if(!locCopyLootChildData) continue;
        var locItemsArr = _ignoreNotLootItems(locCopyLootChildData.items);
        var locItem1 = _calLootItem(locItemsArr,locCopyLootChildData.num);
        if(locItem1) _pushItem(itemArr,locItem1);

        //物品2是额外掉落不计算概率
        if(!locCopyLootChildData.items2) continue;
        for (var j = 0; j < locCopyLootChildData.items2.length; j++) {
            var loccItemId = locCopyLootChildData.items2[j];
            if(!g_lootConfig.isLoot(loccItemId)) continue;
            if(!loccItemId) continue;
            _pushItem(itemArr,[loccItemId, locCopyLootChildData.num2 || 0]);
        }
    }
    //计算额外掉落
    var exItems = t_copyLootData.exItems;

    if(exItems){
        for(var i = 0;i<exItems.length;i++){
            var locId = parseInt(exItems[i][0]) ;
            var locNum = parseInt(exItems[i][1]);
            var locRate = exItems[i][2];
            if(!g_lootConfig.isLoot(locId)) continue;
            if(!locId) continue;
            if(Math.random()*10000<locRate){
                var locItem = [locId,locNum];
                itemArr.push(locItem);
            }
        }
    }
    return itemArr;
};

//获取自身buff影响的经验
exports.getSelfBuffAddExpcRate = function(userData){
    var tmNow = (new Date()).getTime();
    var addExpcRate = 0;
    var buffList = userData.buff || {}
    for (var buffId in buffList) {
        // 判断是否在有效期
        if (buffList[buffId][1] < tmNow) continue;
        if (buffId == 4) {// 月卡
            addExpcRate += 0.1; // 0.1 月卡改成加成10%挂机经验
            //addExpcRate += t_otherBuff[buffId].addHurt/10000; // 0.3;
        }else if(t_otherBuff[buffId].type == 5){ // 经验类buff
            var locRate = t_otherBuff[buffId].addHurt/10000;
            addExpcRate += locRate;
        }
    }
 
    return addExpcRate;
};

//获取自身buff影响的金币获取
exports.getSelfBuffAddGoldRate = function(userData){
    var tmNow = (new Date()).getTime();
    var addExpcRate = 0;
    var buffList = userData.buff || {}
    for (var buffId in buffList) {
        // 判断是否在有效期
        if (buffList[buffId][1] < tmNow) continue;
        if (buffId == 4) {// 月卡
            addExpcRate += t_otherBuff[buffId].addHurt/10000; //0.3;
        }else if(t_otherBuff[buffId].type == 6){ // 金币类buff
            var locRate = t_otherBuff[buffId].addHurt/10000;
            addExpcRate += locRate;
        }
    }
 
    return addExpcRate;
};

//获取自身buff影响的金币获取
exports.getSelfBuffAddPrestigeRate = function(userData){
    var tmNow = (new Date()).getTime();
    var addExpcRate = 0;
    var buffList = userData.buff || {}
    for (var buffId in buffList) {
        // 判断是否在有效期
        if (buffList[buffId][1] < tmNow) continue;
        if (buffId == 4) {// 月卡
            addExpcRate += t_otherBuff[buffId].addHurt/10000; //0.3;
        }else if(t_otherBuff[buffId].type == 8){ // 荣誉类buff
            var locRate = t_otherBuff[buffId].addHurt/10000;
            addExpcRate += locRate;
        }
    }
 
    return addExpcRate;
};
 
//获取buff影响的经验
exports.getBuffExpcRate = function(){
    var buffArr = exports.getBuffArr();
    var expcRate = 1;
    for(var i = 0;i<buffArr.length;i++){
        var locBuffId = buffArr[i];
        var locRate = t_otherBuff[locBuffId].addHurt/10000;
        locRate = parseInt(locRate);
        if(locBuffId==c_prop.otherBuffIdKey.king){
            expcRate+=locRate;
        }
    }
    return expcRate;
};

//获取buff列表
exports.getBuffArr = function(){
    var allBuff = g_buff.getAllBuff();
    var buffArr = [];
    for(var key in allBuff){
        var locBuffId = parseInt(key);
        var buffData  = allBuff[key];
        if(buffData.endTime.isAfter(new Date())){
            buffArr.push(locBuffId);
        }
    }
    return buffArr;
};


var _pushItem = function(itemArr,itemData){
    var itemId = itemData[0];
    var itemNum = itemData[1];
    var itemData = t_item[itemId];
    if(!itemData) return;
    //装备分开
    if(itemData.type == c_prop.itemType.equip){
        for(var k =0;k<itemNum;k++){
            itemArr.push([itemId, 1]);
        }
    }else{
        itemArr.push([itemId, itemNum]);
    }
};


//计算金币
var _calGold = function(moneyMin, moneyMax, moneyProbability){
    var random = Math.random()*10000;
    if(random>moneyProbability) return 0;
    return commonUtils.getRandomNum(moneyMin	,moneyMax);
};

//计算掉落次数
var _calLootId = function(loots){
    var lootId = 0;
    if(!loots) return lootId;
    lootId = commonUtils.getLeft2RightRandomValue(loots);
    return lootId;
};

//计算掉落次数
var _calLootCounts = function(randCounts){
    var count = 0;
    if(!randCounts) return count;
    count = commonUtils.getWeightRandomValue(randCounts);
    return count;
};


var _ignoreNotLootItems = function(itemsArr){
    var tempArr = [];
    if(!itemsArr) return tempArr;
    for(var i = 0;i<itemsArr.length;i++){
        var locItems = itemsArr[i];
        var locItemId = locItems[0];
        var locItemNum = locItems[1];
        var locIsLoot = g_lootConfig.isLoot(locItemId);
        if(locIsLoot){
            tempArr.push([locItemId,locItemNum]);
        }
    }
    return tempArr;
};



//获取掉落的物品
var _calLootItem = function(items,num){
    if(!items) return null;
    if(items.length<=0) return null;
    //权重
    var itemId = commonUtils.getWeightRandomValue(items);
    if(!itemId) return null;
    return [itemId,num];
};
