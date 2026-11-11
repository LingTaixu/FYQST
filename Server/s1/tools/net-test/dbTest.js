var activityDao = require("uw-activity").activityDao;
var uwClient = require("uw-db").uwClient;
var ActivityEntity = require('uw-entity').ActivityEntity;
var PkOutEntity = require('uw-entity').PkOutEntity;
var async = require("async");
//var userDao = require("uw-user").userDao;
// var arguments = process.argv.splice(2);
// var indexData = arguments[0];
// var startIndex = 0;
// var endIndex = 300;
// if(indexData){
//     startIndex = parseInt(indexData.split(",")[0]) ||0;
//     endIndex = parseInt(indexData.split(",")[1])||300;
// }

var addActivity1 = function(cb){
	var actEntity = new ActivityEntity();
	actEntity.title = "首冲";
	actEntity.type = 1;	 
	actEntity.iconType = 1;
	actEntity.tiIconType = 1;
	actEntity.startTime = '2017-08-17 09:32:25';
	actEntity.endTime = '2019-08-17 09:32:25';
	//actEntity.randomHeroes = null;
	actEntity.items = [{"700005":1, "19":100,"56":3000,"32":300, "11110":1, "4":10}];
	actEntity.exValues = [];
	actEntity.exValues2 = [];
	actEntity.exValues3 = [];  
	actEntity.content = '首冲福利';
	actEntity.isOpen = 1;
	actEntity.sort = 1;
	actEntity.templateId = 70;
	activityDao.insert(uwClient, actEntity, function(err, data){
	    //data返回插入数据的id
	    var id = data.insertId;
	    console.log("new id", id);
	    cb(null);
	});
};

var updateActivity1 = function(cb){ 
	 var upActData = {
	 		// 物品id:[兑换积分数,可兑换数量]
            items: [{"700005":1, "19":100,"56":3000,"32":300, "11110":1, "4":10}] 
    };
	activityDao.update(uwClient, upActData, {type:1 }, function(err, data){
	    //data返回插入数据的id
  	    console.log(data);
	    cb(null);
	});
};
 
var addActivity40 = function(cb){
	var actEntity = new ActivityEntity();
	actEntity.title = "积分便利屋";
	actEntity.type = 40;	 
	actEntity.iconType = 0;
	actEntity.tiIconType = 0;
	actEntity.startTime = '2017-08-17 09:32:25';
	actEntity.endTime = '2018-08-17 09:32:25';
	//actEntity.randomHeroes = null;
	actEntity.items = [{"120000":[9800,9,10]},{"11220":[90000,1,10]},{"1000103":[50000,1,10]},{"10":[150,50,10]},{"13":[150,50,10]},{"3":[50,50,10]},{"4":[50,50,10]},{"5":[50,50,10]},{"6":[50,50,10]},{"1807":[900,30,10]},{"386":[150,30,10]}];
	actEntity.exValues = [30];
	actEntity.exValues2 = [];
	//actEntity.exValues2 = null;
	actEntity.exData = {"1":"jfbld"};
	actEntity.content = '积分便利屋【0元好物在这里】';
	actEntity.isOpen = 1;
	actEntity.sort = 130;
	//actEntity.templateId = 0;
	activityDao.insert(uwClient, actEntity, function(err, data){
	    //data返回插入数据的id
	    var id = data.insertId;
	    console.log("new id", id);
	    cb(null);
	});
};

var updateActivity40 = function(cb){ 
	 var upActData = {
	 		// 物品id:[兑换积分数,可兑换次数,物品数量]
	 		title:"积分便利屋",
            items: [{"18":[30,1,3000]},{"99":[60,1,500000]},{"1807":[150,1,1]},{"30":[300,1,60]},{"19":[600,1,120]},{"3":[1500,1,20]},{"114000":[3000,1,1]},{"1551":[6000,1,150]},{"56":[9000,1,9000]},{"1434":[12000,1,300]},{"120000":[15000,10,1]},{"1000105":[30000,1,1]},{"11220":[90000,1,1]}],
            exData: {"1":"jfbld","2":"积分便利屋"},
            exValues:[30],
            exValues2:[]
    };
	activityDao.update(uwClient, upActData, {type:40 }, function(err, data){
	    //data返回插入数据的id
  		console.log(data);
	    cb(null);
	});
};

var addActivity41 = function(cb){
	var actEntity = new ActivityEntity();
	actEntity.title = "史上最强升级礼包";
	actEntity.type = 41;	// dScoreShop
	actEntity.iconType = 0;
	actEntity.tiIconType = 0;
	actEntity.startTime = '2017-08-17 09:32:25';
	actEntity.endTime = '2018-08-17 09:32:25';
	//actEntity.randomHeroes = null;
	actEntity.exValues = [10];
	actEntity.items = [{"1680":1}];
	actEntity.exValues2 = [{"10":1680},{"20":1681},{"30":1682},{"40":1683},{"50":1684},{"60":1685},{"70":1686},{"80":1687},{"90":1688},{"100":1689},{"110":1690},{"120":1691},{"130":1692},{"140":1693},{"150":1694},{"160":1695},{"170":1696},{"180":1697},{"190":1698},{"200":1699}];
	//actEntity.exValues3 = null;
	actEntity.exData = {"1":"sjlb","2":"升级礼包"};
	actEntity.content = '每升10级可以获得一份超级大礼，共计20份\n升到200级累计获得50000钻的史上最强礼包';
	actEntity.isOpen = 1;
	actEntity.sort = 120;
	//actEntity.templateId = 0;
	activityDao.insert(uwClient, actEntity, function(err, data){
	    //data返回插入数据的id
	    var id = data.insertId;
	    console.log("new id", id);
	    cb(null);
	});
};
var updateActivity41 = function(cb){ 
	 var upActData = { 
	 		items : [{"1680":1}],
            exValues:[10], 
            exValues2:[{"10":1680},{"20":1681},{"30":1682},{"40":1683},{"50":1684},{"60":1685},{"70":1686},{"80":1687},{"90":1688},{"100":1689},{"110":1690},{"120":1691},{"130":1692},{"140":1693},{"150":1694},{"160":1695},{"170":1696},{"180":1697},{"190":1698},{"200":1699}],
            exData: {"1":"sjlb","2":"升级礼包"},
            isOpen : 1,
            sort : 120
    };
	activityDao.update(uwClient, upActData, {type:41 }, function(err, data){
	    //data返回插入数据的id
  	    console.log(data);
	    cb(null);
	});
};

var addActivity43 = function(cb){
	var actEntity = new ActivityEntity();
	actEntity.title = "打赏";
	actEntity.type = 43;	 
	actEntity.iconType = 0;
	actEntity.tiIconType = 0;
	actEntity.startTime = '2017-08-17 09:32:25';
	actEntity.endTime = '2018-08-17 09:32:25';
	actEntity.exValues = {
	 			"41":1,
	 			"42":3,
	 			"43":2,
	 			"44":4,
	 			"45":5
	 		};
	actEntity.items = [];
	actEntity.exValues2 = {'1':{ 
									"id":1,
									"title":"法师协会发来的入会礼包！",
									"content":"99%的新人法师的必买之选！",
									"lv" : 80,
									"nextlv":120,
									"job":2,
									"rechargeId": 41,
									"items": {"700009":1}
								},
							'2':{ 
									"id":2,
									"title":"射手学院发来的开学礼包！",
									"content":"99%的新人射手的必买之选！",
									"lv" : 80,
									"nextlv":120,
									"job":3,
									"rechargeId": 43,
									"items": {"700010":1}
								},
							'3':{ 
									"id":3,
									"title":"荣耀法神的宝藏！",
									"content":"法神泽瑞斯：唯强者之心，方不辜负来时之路！	",
									"lv" : 120,
									"nextlv":145,
									"job":2,
									"rechargeId": 42,
									"items": {"700014":1}
								},
							'4':{ 
									"id":4,
									"title":"黑暗游侠的宝藏！",
									"content":"黑暗游侠盖娅：最好，或者一无是处！",
									"lv" : 120,
									"nextlv":145,
									"job":3,
									"rechargeId": 44,
									"items": {"700015":1}
								},
							'5':{ 
									"id":5,
									"title":"震惊！！圣骑士的黄金套装。",
									"content":"圣骑士兰斯洛：荣耀、友谊与爱情！",
									"lv" : 145,
									"nextlv":300,
									"job":4,
									"rechargeId": 45,
									"items": {"700016":1}
								}};
	//actEntity.exValues3 = null;
	actEntity.exData = {"1":"dsshop"};
	actEntity.content = '打赏内容描述描述';
	actEntity.isOpen = 1;
	actEntity.sort = 130;
	//actEntity.templateId = 0;
	activityDao.insert(uwClient, actEntity, function(err, data){
	    //data返回插入数据的id
	    var id = data.insertId;
	    console.log("new id", id);
	    cb(null);
	});
};

var updateActivity43 = function(cb){ 
	 var upActData = { 
	 		exValues : {
	 			"41":1,
	 			"42":3,
	 			"43":2,
	 			"44":4,
	 			"45":5
	 		},
	 		exValues2 : {'1':{ 
									"id":1,
									"title":"法师协会发来的入会礼包！",
									"content":"99%的新人法师的必买之选！",
									"lv" : 80,
									"nextlv":120,
									"job":2,
									"ico":1,
									"rechargeId": 41,
									"items": {"700009":1}
								},
							'2':{ 
									"id":2,
									"title":"射手学院发来的开学礼包！",
									"content":"99%的新人射手的必买之选！",
									"lv" : 80,
									"nextlv":120,
									"job":3,
									"ico":1,
									"rechargeId": 43,
									"items": {"700010":1}
								},
							'3':{ 
									"id":3,
									"title":"荣耀法神的宝藏！",
									"content":"法神泽瑞斯：唯强者之心，方不辜负来时之路！	",
									"lv" : 120,
									"nextlv":145,
									"job":2,
									"ico":2,
									"rechargeId": 42,
									"items": {"700014":1}
								},
							'4':{ 
									"id":4,
									"title":"黑暗游侠的宝藏！",
									"content":"黑暗游侠盖娅：最好，或者一无是处！",
									"lv" : 120,
									"nextlv":145,
									"job":3,
									"ico":2,
									"rechargeId": 44,
									"items": {"700015":1}
								},
							'5':{ 
									"id":5,
									"title":"震惊！！圣骑士的黄金套装。",
									"content":"圣骑士兰斯洛：荣耀、友谊与爱情！",
									"lv" : 145,
									"nextlv":300,
									"job":4,
									"ico":1,
									"rechargeId": 45,
									"items": {"700016":1}
								}} 	  
    };
	activityDao.update(uwClient, upActData, {type:43 }, function(err, data){
	    //data返回插入数据的id
  	    console.log(data);
	    cb(null);
	});
};

// 佣兵系统
var addActivity44 = function(cb){
	var actEntity = new ActivityEntity();
	actEntity.title = "佣兵系统";
	actEntity.type = 44;	 
	actEntity.iconType = 0;
	actEntity.tiIconType = 0;
	actEntity.startTime = '2017-08-17 09:32:25';
	actEntity.endTime = '2021-08-17 09:32:25';
	//actEntity.randomHeroes = null;
	actEntity.exValues = [];
	actEntity.items = [];
	actEntity.exValues2 = [];
	//actEntity.exValues3 = null;
	actEntity.exData = {"1":"ybxt","2":"佣兵系统"};
	actEntity.content = '';
	actEntity.isOpen = 1;
	actEntity.sort = 140;
	//actEntity.templateId = 0;
	activityDao.insert(uwClient, actEntity, function(err, data){
	    //data返回插入数据的id
	    var id = data.insertId;
	    console.log("new id", id);
	    cb(null);
	});
};

// 佣兵周任务
var addActivity45 = function(cb){
	var actEntity = new ActivityEntity();
	actEntity.title = "佣兵福利";
	actEntity.type = 45;	 
	actEntity.iconType = 0;
	actEntity.tiIconType = 0;
	actEntity.startTime = '2017-08-17 09:32:25';
	actEntity.endTime = '2021-08-17 09:32:25';
	//actEntity.randomHeroes = null;
	actEntity.exValues = [];
	actEntity.items = [];
	actEntity.exValues2 = [];
	//actEntity.exValues3 = null;
	actEntity.exData = {"1":"ybzrw","2":"佣兵福利"};
	actEntity.content = '';
	actEntity.isOpen = 1;
	actEntity.sort = 150;
	//actEntity.templateId = 0;
	activityDao.insert(uwClient, actEntity, function(err, data){
	    //data返回插入数据的id
	    var id = data.insertId;
	    console.log("new id", id);
	    cb(null);
	});
};

var updateActivity45 = function(cb){ 
	 var upActData = { 
	 		title : "佣兵福利",
            sort : 150,
            exData : {"1":"ybzrw","2":"佣兵福利","8":70}
    };
	activityDao.update(uwClient, upActData, {type:45 }, function(err, data){
	    //data返回插入数据的id
  	    console.log(data);
	    cb(null);
	});
};

// 天命基金
var addActivity42 = function(cb){
	var actEntity = new ActivityEntity();
	actEntity.title = "天命基金";
	actEntity.type = 42;	 
	actEntity.iconType = 0;
	actEntity.tiIconType = 0;
	actEntity.startTime = '2017-08-17 09:32:25';
	actEntity.endTime = '2021-08-17 09:32:25';
	//actEntity.randomHeroes = null;
	actEntity.exValues = [88];
	actEntity.items = [{"1657":1},{"1658":1},{"1659":1},{"1660":1},{"1661":1},{"1662":1}];
	actEntity.exValues2 = []; 
	actEntity.exData = {"1":"tmjj","2":"天命基金"};
	actEntity.content = '';
	actEntity.isOpen = 1;
	actEntity.sort = 160;
	//actEntity.templateId = 0;
	activityDao.insert(uwClient, actEntity, function(err, data){
	    //data返回插入数据的id
	    var id = data.insertId;
	    console.log("new id", id);
	    cb(null);
	});
};
var updateActivity42 = function(cb){ 
	 var upActData = { 
	 		items : [{"1657":1},{"1658":1},{"1659":1},{"1660":1},{"1661":1},{"1662":1}],
	 		exValues : [88],
	 		exValues2 : [103], 	// 商品ID
	 		exData :{"1":"tmjj","2":"天命基金","8":60},
            sort : 160
    };
	activityDao.update(uwClient, upActData, {type:42 }, function(err, data){
	    //data返回插入数据的id
  	    console.log(data);
	    cb(null);
	});
};

// 每日优选
var addActivity46 = function(cb){
	var actEntity = new ActivityEntity();
	actEntity.title = "每日优选";
	actEntity.type = 46;	 
	actEntity.iconType = 0;
	actEntity.tiIconType = 0;
	actEntity.startTime = '2017-08-17 09:32:25';
	actEntity.endTime = '2021-08-17 09:32:25';
	actEntity.exValues = [2];	// 每日购买次数
	actEntity.items = [61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80];
	actEntity.exValues2 = [61,62,63,64,65,66,67,68,69,70];	// 低价商品列表
	//actEntity.exValues3 = null;
	actEntity.exData = {"1":"mryx","2":"每日优选"};
	actEntity.content = '';
	actEntity.isOpen = 1;
	actEntity.sort = 160;
	//actEntity.templateId = 0;
	activityDao.insert(uwClient, actEntity, function(err, data){
	    //data返回插入数据的id
	    var id = data.insertId;
	    console.log("new id", id);
	    cb(null);
	});
};

var updateActivity46 = function(cb){ 
	var upActData = {  
			items : [61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80],
	 		exValues : [2], 	// 每日购买次数
	 		exValues2 : [61,62,63,64,65,66,67,68,69,70], // 低价商品列表
	 		exData : {"1":"mryx","2":"每日优选","8":50},
            sort : 160
    };
	activityDao.update(uwClient, upActData, {type:46}, function(err, data){
	    //data返回插入数据的id
  	    console.log(data);
	    cb(null);
	});
};

// 女神的祝福
var addActivity47 = function(cb){
	var actEntity = new ActivityEntity();
	actEntity.title = "女神的祝福";
	actEntity.type = 47;	 
	actEntity.iconType = 0;
	actEntity.tiIconType = 0;
	actEntity.startTime = '2017-08-17 09:32:25';
	actEntity.endTime = '2021-08-17 09:32:25';
	//actEntity.randomHeroes = null;
	actEntity.exValues = [];
	actEntity.items = [];
	actEntity.exValues2 = [];
	//actEntity.exValues3 = null;
	actEntity.exData = {"1":"ykzf","2":"瓦尔基里的祝福"};
	actEntity.content = '';
	actEntity.isOpen = 1;
	actEntity.sort = 170;
	//actEntity.templateId = 0;
	activityDao.insert(uwClient, actEntity, function(err, data){
	    //data返回插入数据的id
	    var id = data.insertId;
	    console.log("new id", id);
	    cb(null);
	});
};

var updateActivity47 = function(cb){ 
	var upActData = {   
	 		exData : {"1":"ykzf","2":"瓦尔基里的祝福"}
    };
	activityDao.update(uwClient, upActData, {type:47}, function(err, data){
	    //data返回插入数据的id
  	    console.log(data);
	    cb(null);
	});
};

// 阿尔忒弥斯
var addActivity48 = function(cb){
	var actEntity = new ActivityEntity();
	actEntity.title = "阿尔忒弥斯的祝福";
	actEntity.type = 48;	 
	actEntity.iconType = 0;
	actEntity.tiIconType = 0;
	actEntity.startTime = '2017-08-17 09:32:25';
	actEntity.endTime = '2021-08-17 09:32:25';
	//actEntity.randomHeroes = null;
	actEntity.exValues = [];
	actEntity.items = [];
	actEntity.exValues2 = [];
	//actEntity.exValues3 = null;
	actEntity.exData = {"1":"zkzf","2":"阿尔忒弥斯的祝福"};
	actEntity.content = '';
	actEntity.isOpen = 1;
	actEntity.sort = 180;
	//actEntity.templateId = 0;
	activityDao.insert(uwClient, actEntity, function(err, data){
	    //data返回插入数据的id
	    var id = data.insertId;
	    console.log("new id", id);
	    cb(null);
	});
};
var cbExit =  function(err,data){
    if(err){
        console.error("执行失败");
        console.error(err);
    }else{
        console.log("执行成功");
    }
    process.exit(0);
};

var testRank = function (cb){
	var rankBiz = require("uw-rank").rankBiz;
	rankBiz.getUserIdList(uwClient, function(err, data){
		console.log(data);
		cbExit(null);
	});
}

var  insertPkOut = function(userId,cb){
	var pkOutDao = require("uw-pkOut").pkOutDao;
	var pkOutEntity = new PkOutEntity();
    pkOutEntity.userId = userId;
    //随即3个对手
    pkOutEntity.enemyIds = [];
    /*对手组*/
    pkOutEntity.freshTime = (new Date()).addDays(-1);
    /*上一次刷新对手时间*/
    pkOutEntity.pkValueTime = new Date();
    pkOutDao.insert(uwClient, pkOutEntity, cb);
}

var testPKOut = function(cb){
	var mapUser = {};
	for (var i = 68500; i < 68622; i++){
		mapUser[i] = i;
		//insertPkOut(i);
	}
	async.map(mapUser,function(userId,cb1){
        insertPkOut(userId,cb1);
        },function(err,data){
            if(err) return cb("出错啦",err);
            cb(null);
        });
}
 
//新服竞赛 七日 8天
var addActivity49 = function(cb){
	var actEntity = new ActivityEntity();
	actEntity.title = "新服竞赛";
	actEntity.type = 49;	 
	actEntity.iconType = 0;
	actEntity.tiIconType = 0;
	actEntity.startTime = '2017-12-28 00:00:01';
	actEntity.endTime = '2018-01-04 23:59:59';
	//actEntity.randomHeroes = null;
	actEntity.items = [];
	actEntity.exValues = [];
	actEntity.exValues2 = [];
	//actEntity.exValues2 = null;
	actEntity.exData = null;
	actEntity.content = '新服竞赛';
	actEntity.isOpen = 1;
	actEntity.sort = 5;
	//actEntity.templateId = 0;
	activityDao.insert(uwClient, actEntity, function(err, data){
	    //data返回插入数据的id
	    var id = data.insertId;
	    console.log("new id", id);
	    cb(null);
	});
};

var updateActivity49 = function(cb){ 
	 var upActData = {
	 		// 物品id:[兑换积分数,可兑换次数,物品数量]
	 		title:"新服竞赛",
	 		startTime:'2018-01-20 00:00:01',
	 		endTime:'2018-01-27 23:59:59',
	 		content:"新服竞赛"
    };
	activityDao.update(uwClient, upActData, {type:49 }, function(err, data){
	    //data返回插入数据的id
  		console.log(data);
	    cb(null);
	});
};


//七日消费钻石返利
var addActivity6 = function(cb){
	var actEntity = new ActivityEntity();
	actEntity.title = "每日消费返利";
	actEntity.type = 6;	 
	actEntity.iconType = 0;
	actEntity.tiIconType = 0;
	actEntity.startTime = '2017-12-28 00:00:01';
	actEntity.endTime = '2018-01-03 23:59:59';
	//actEntity.randomHeroes = null;
	actEntity.items = [];
	actEntity.exValues = [];
	actEntity.exValues2 = [];
	//actEntity.exValues2 = null;
	actEntity.exData = null;
	actEntity.content = '每日消费返利';
	actEntity.isOpen = 1;
	actEntity.sort = 0;
	//actEntity.templateId = 0;
	activityDao.insert(uwClient, actEntity, function(err, data){
	    //data返回插入数据的id
	    var id = data.insertId;
	    console.log("new id", id);
	    cb(null);
	});
};

var updateActivity6 = function(cb){ 
	var upActData = {
	 		title:"每日消费返利",
	 		startTime:'2018-01-18 00:00:01',
	 		endTime:'2018-01-24 23:59:59'
    };
	activityDao.update(uwClient, upActData, {type:6 }, function(err, data){
	    //data返回插入数据的id
  		console.log(data);
	    cb(null);
	});
};

//天天乐透 暂时永久
var updateActivity14 = function(cb){ 
	var upActData = {
	 		title:"天天乐透",
	 		startTime:'2017-01-18 00:00:01',
	 		endTime:'2099-01-24 23:59:59',
	 		sort:10,
	 		content:"天天乐透"
    };
	activityDao.update(uwClient, upActData, {type:14 }, function(err, data){
	    //data返回插入数据的id
  		console.log(data);
	    cb(null);
	});
};

var updateAwyData =function(cb){
	var userDao = require("uw-user").userDao;
	var userId = 1002860;
	var exData = {"1":"10019_10000","8":0,"22":1,"23":[300001],"24":"5","25":{"2000":1,"3000":1},"26":"202.121.132.10","27":"browser_name:Mobile Safari UI/WKWebView;os_name:iPhone_0.0.0_iOS_10.3.3;brower_version:10.3.3","28":{"0":4},"29":{"everEquiped":1,"everLaba":1,"everFuwen":1,"hasSmelting":1,"everRoleWing":1,"everHuanjing":1,"eqpChged":1,"everFuwenJueX":1,"popBindAfterPay":1},"37":{"focus":[1,1],"verify":[1,1],"share":[1,"2018-05-18T07:11:17.967Z","2018-05-18T07:11:17.967Z",[1,0,0]]}};
	userDao.update(uwClient, {exData:exData}, {id:userId}, cb);
};
//testPKOut(cbExit);
//testRank();
//addActivity48(cbExit);
//updateActivity47(cbExit);
//addActivity47(cbExit);
updateActivity40(cbExit);
//addActivity43(cbExit);
//updateActivity1(cbExit);
//updateActivity46(cbExit);
//updateActivity41(cbExit);
//addActivity41(cbExit);
// addActivity50(cbExit);//添加七日新服竞赛
 // addActivity51(cbExit);//添加七日消费钻石返利
//updateActivity49(cbExit); 
// updateActivity6(cbExit); 
// updateActivity14(cbExit);
