var uwData = require("uw-data");
var fs = require("fs"); 
// 查询策划表里的数据的接口

var getItemInfo = function(id,cb){
	var t_item = require("uw-data").t_item;
	return t_item[id]; 
};
var getItemInfoByName = function(name,cb){
	var t_item = require("uw-data").t_item;
	var ret = []
	for  ( k in t_item ){
		var it = t_item[k];
		if (it.name && it.name == name){
			ret.push(it);

		}
	} 	
	return ret;
};
var getItemInfoByNames = function(name,cb){
	var t_item = require("uw-data").t_item;
	var ret = []
	for  ( k in t_item ){
		var it = t_item[k];
		if (it.name && it.name.toString().indexOf(name) != -1){
			ret.push(it);

		}
	} 			
	return ret;
};

var TaliData = function(cb){
	var t_talismanRes = require("uw-data").t_talismanRes; 
	console.log(t_talismanRes);
	var ret = {}
	for (var i in t_talismanRes){ 
		for (var j in t_talismanRes[i].resonance){
			var id = t_talismanRes[i].resonance[j];
			if (ret[id]){
				ret[id].push(t_talismanRes[i].id);
			}else{
				ret[id] = [];
				ret[id].push(t_talismanRes[i].id);
			}
		}
	}
	console.log(ret);
}

var itemJson = function(cb, resJsonPath){
	var t_item = require("uw-data").t_item;
	var ret = {}
	var data = [];
	for  ( k in t_item ){
		var it = t_item[k];
		var obj = {}
		obj.id = it.id;
		obj.name = it.name; 
		data.push(obj);
	} 			
	ret.data = data;
	//fs.writeFileSync(resJsonPath, JSON.stringify(ret, null, '\t'));
	fs.writeFileSync(resJsonPath, JSON.stringify(ret, null));
	return ret;
};

var mailJson = function(cb, resJsonPath){
	var c_mail = require("uw-data").c_mail;
	fs.writeFileSync(resJsonPath, JSON.stringify(c_mail, null));
}

// var itemJson = function(cb, resJsonPath){
// 	var t_item = require("uw-data").t_item;
// 	fs.writeFileSync(resJsonPath, JSON.stringify(t_item, null));
// }

var cbExit =  function(err,data){
    if(err){
        console.error("执行失败");
        console.error(err);
    }else{
        console.log("执行成功");
    }
    process.exit(0);
};

//var t = getItemInfo(1468, cbExit); 
//console.log(t);
// var t = {};
// t = getItemInfoByNames("经验药水", cbExit);
// console.log(t);
var copyJson = function(cb, resJsonPath){
	var t_copy = require("uw-data").t_copy;
	var ret = {};
	 
	for  ( k in t_copy ){
		var it = t_copy[k];
		var obj = {};
		obj.id = it.id;
		obj.name = it.name;
		obj.type = it.type;
		if(ret[it.type] == null) ret[it.type] = {};
		 ret[it.type][it.id] = obj;
		// ret[k] = obj;
	} 			
	//fs.writeFileSync(resJsonPath, JSON.stringify(ret, null, '\t'));
	fs.writeFileSync(resJsonPath, JSON.stringify(ret, null));
	return ret;
};

//TaliData(cbExit);
// var t = itemJson(cbExit, "t_item.json");
var t = copyJson(cbExit, "t_copy.json");
//console.log(t);