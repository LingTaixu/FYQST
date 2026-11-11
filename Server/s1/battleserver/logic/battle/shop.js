/*
 *	世界boss的商店
 */
const consts = require('./consts.js'); 
const logger = require('uw-log').getLogger("uw-logger", __filename);

class WBGoods {
	constructor(goodsId){
		this.goodsId = goodsId;
		this.num = 1;		//  剩余数量
	}
	buy(){
		this.num--;
	}
}

class WBShop {
	constructor(bossId){
		this.bossId = bossId; 
		this.status = consts.eShopStatus.init;
		this.statusTime = new Date();
		this.goodsList = [];
		this.userIdList = [];
	} 
	setGoodsList(goodsIdList){
		this.goodsList = [];
		for(let i = 0; i < goodsIdList.length; i++){
			this.goodsList.push(new WBGoods(goodsIdList[i]));
		}
	}
	setUserList(uList){
		//  可购买商品的玩家id列表
		this.userIdList = uList;
	}
	open(){
		this.changeStatus(consts.eShopStatus.limit);
	}
	canBuyGoods(goodsId, userId){
		let idx = this.userIdList.indexOf(userId);
		if(idx == -1){
			return false;
		}
		if (this.status == consts.eShopStatus.limit){	// 限制期间
			if(idx > 2){
				return false;
			}
			let goods = this.goodsList[idx];
			if (goods.goodsId != goodsId){
				return false;
			}
			if (goods.num <= 0){
				return false;
			}
			return true;
		}else if(this.status == consts.eShopStatus.all){	// 开放期间
			let goods = null;
			for(let i = 0; i < this.goodsList.length; i++){
				if(this.goodsList[i].goodsId == goodsId){
					goods = this.goodsList[i];
				}
			}
			if(!goods || goods.num <= 0){
				return false;
			}
			return true;
		}else{
			return false;
		}
	}
	buyGoods(goodsId, userId){
		// 调用者保证条件满足
		// if(!this.canBuyGoods(goodsId, userId)){
		// 	return;
		// }
		for(let i = 0; i < this.goodsList.length; i++){
			if(this.goodsList[i].goodsId == goodsId){
				let goods = this.goodsList[i];
				goods.buy();
			}
		}
	}
	getGoodsListByIdx(idx){
		if(idx < 0 || idx >= this.goodsList.length){
			return [];
		}
		let goods = this.goodsList[idx];
		if(goods && goods.num >= 1){
			return [goods.goodsId];
		}
		return []; 
	}
	getGoodsList(){
		let lst = [];
		for(let i = 0; i < this.goodsList.length; i++){
			if(this.goodsList[i].num >= 1){
				lst.push(this.goodsList[i].goodsId);
			}
		}
		return lst;
	}
	canbuyGoodsList(userId){
		let proto = {};
		proto.endTime = 0;
		let idx = this.userIdList.indexOf(userId);
		if(idx == -1){
			proto.goodslst = [];
			return proto;
		}
		if (this.status == consts.eShopStatus.limit){	// 限制期间
			if(idx > 2){
				proto.goodslst = [];
				return proto;
			}
			let goods = this.goodsList[idx];
			if (goods.num <= 0){
				proto.goodslst = [];
				return proto;
			}
			proto.goodslst = [goods.goodsId]; 
			let tmNow = new Date();
			let sec = this.statusTime.getSecondsBetween(tmNow);
			proto.endTime = consts.eCONST.SHOP_STAGE1_INTERVAL - sec;
			if(proto.endTime < 0) {
				proto.endTime = 0;
			}
			return proto;
		}else if(this.status == consts.eShopStatus.all){	// 开放期间

			let tmNow = new Date();
			let ret = [];
			for(let i = 0; i < this.goodsList.length; i++){
	 			if(this.goodsList[i].num > 0){
	 				ret.push(this.goodsList[i].goodsId);
	 			} 
			} 
			let sec = this.statusTime.getSecondsBetween(tmNow);
			proto.endTime = consts.eCONST.SHOP_STAGE2_INTERVAL - sec;
			if(proto.endTime < 0) {
				proto.endTime = 0;
			}
			proto.goodslst = ret; 
			return proto;
		}else{
			proto.goodslst = [];
			return proto;
		}
	}
	getStage2GoodsList(){
		let proto = {};
		proto.endTime = 0;
		let lst = [];
		for(let i = 0; i < this.goodsList.length; i++){
			if(this.goodsList[i].num >= 1){
				lst.push(this.goodsList[i].goodsId);
			}
		}
		proto.goodslst = lst; 
		let tmNow = new Date();
		let sec = this.statusTime.getSecondsBetween(tmNow);
		proto.endTime = consts.eCONST.SHOP_STAGE2_INTERVAL - sec;
		if(proto.endTime < 0) {
			proto.endTime = 0;
		}
		return proto;
	}
	changeStatus(s){
		this.status = s;
		this.statusTime = new Date();
	}
	close(){
		this.status = consts.eShopStatus.close;
		this.statusTime = new Date();
		this.goodsList = [];
		this.userIdList = [];		
	}
} 

module.exports.WBShop = WBShop; 

