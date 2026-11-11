/*
 *	公会战数据管理
 */
const consts = require('./consts.js');
const logger = require('uw-log').getLogger("uw-logger", __filename);

class BattleMgr{
	constructor(){
		this.serverDate = null;//'2018-11-10 14:00:00.000';		// 开服时间,要手动改
		this.firstBattleTime = null;//'2018-11-13 14:00:00.000';	// 首次攻城战时间,要手动改

		this.resetAllTime();
		this.changeStatus(consts.eBattleStatus.init);
	}
	setServerDate(serverDate){
		logger.error("serverDate:", serverDate);
		this.serverDate = new Date(serverDate);
		//this.firstBattleTime = this.serverDate.clone().clearTime().addDays(2).addHours(consts.eCONST.BATTLE_START_HOUR);	// 第3天
		this.firstBattleTime = new Date().addSeconds(10);
		logger.error("firstBattleTime:", this.firstBattleTime);	

		// 测试时间 
		// console.log("2018-06-14 00:00:00 is ", new Date("2018-06-14 00:00:00").getDay());
		// console.log("2018-06-15 00:00:00 is ", new Date("2018-06-15 00:00:00").getDay());
		// console.log("2018-06-16 00:00:00 is ", new Date("2018-06-16 00:00:00").getDay());
		// console.log("2018-06-17 00:00:00 is ", new Date("2018-06-17 00:00:00").getDay());
		// console.log("2018-06-18 00:00:00 is ", new Date("2018-06-18 00:00:00").getDay());
	}
	getServerDate(){
		return this.serverDate;
	}  
	getBattleingTime(){	// 活动开始时间 
		return this.battleingTime;
	}
	getBattleCloseTime(){ 
		return this.battleCloseTime;
	}
	getEggactCloseTime(){ 
		return this.eggactCloseTime;
	}
	changeStatus(s){
		//console.log("BattleMgr changeStatus change ", this.status, " => ", s);
		this.status = s;
	}
	resetAllTime(){ 
		this.openTime = null;		// 公会战开启时间 
		this.createMapTime = null;
		this.battleingTime = null;
		this.battleCloseTime = null;
		this.eggactCloseTime = null; //彩蛋活动结束时间
		this.endTime = null;		// 地图回收时间 
	}
	checkOpenTime(){
		if(!this.getServerDate()){
			logger.error("no serverDate 1");
			this.resetAllTime();
			return;
		}
 
 		let tmNow = new Date();
 		//----egg for test-----------
 	// 	if(!this.openTime){
 	// 		this.openTime = tmNow.clone().addSeconds(-2);
		// 	this.createMapTime = this.openTime.clone().addMinutes(-2);
		// 	this.battleingTime = this.openTime.clone().addSeconds(10);
		// 	this.battleCloseTime = this.battleingTime.clone().addSeconds(10);
		// 	this.eggactCloseTime = this.battleCloseTime.clone().addDays(1);//彩蛋结束时间
		// 	this.endTime = this.eggactCloseTime.clone().addSeconds(60);
 	// 	}
		// return;
		//----egg for test end-----------
 		if (tmNow.isBefore(this.firstBattleTime.clone().addMinutes(-10))){
 			console.log("no serverDate 2");
 			this.resetAllTime();
 			return;
 		}
		// 公会战提前10分钟开启
		// 开服第3天

		if (tmNow.equalsDay(this.firstBattleTime)){

			if(!this.openTime){
				this.openTime = this.firstBattleTime.clone();	 
				this.createMapTime = this.openTime.clone().addMinutes(-2);
				this.battleingTime = this.openTime.clone().addSeconds(consts.eCONST.BATTLE_PRETIME);
				this.battleCloseTime = this.openTime.clone().addMinutes(consts.eCONST.BATTLE_INTERVAL).addSeconds(consts.eCONST.BATTLE_PRETIME);
				this.eggactCloseTime = this.battleCloseTime.clone().addMinutes(consts.eCONST.COLORFUL_EGG_INTERVAL);//彩蛋结束时间
				this.endTime = this.eggactCloseTime.clone().addSeconds(60);

				logger.info("BATTLE OPEN TIME:", this.openTime);
			}
			return;
		}else {
			let wday = tmNow.getDay();
			if (wday == 0){	// 周日
				if(!this.openTime){
					this.openTime = tmNow.clone().clearTime().addHours(consts.eCONST.BATTLE_START_HOUR);
					this.createMapTime = this.openTime.clone().addMinutes(-2);
					this.battleingTime = this.openTime.clone().addSeconds(consts.eCONST.BATTLE_PRETIME);
					this.battleCloseTime = this.openTime.clone().addMinutes(consts.eCONST.BATTLE_INTERVAL).addSeconds(consts.eCONST.BATTLE_PRETIME);
					this.eggactCloseTime = this.battleCloseTime.clone().addMinutes(consts.eCONST.COLORFUL_EGG_INTERVAL);//彩蛋结束时间
					this.endTime = this.eggactCloseTime.clone().addSeconds(60);

					logger.info("BATTLE OPEN TIME:", this.openTime);
				}
 			}else{
 				this.resetAllTime();
			}
			return;
		}
	} 
}

var battleMgr = new BattleMgr();
exports.battleMgr = battleMgr;
exports.init = function() { 
	//exports.battleMgr.init();
};