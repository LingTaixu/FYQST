/**
 * Created by Administrator on 2016/5/3.
 */

var redisHelper = require("uw-db").redisHelper;
var cfg = {
    name :"server1",
    host:"101.227.80.111",
    port:33333
};
//"121.43.191.194",10.0.0.6
var client = redisHelper.getClient(cfg);

var guiledynamic = '[5,5,4,40000,0,"{\\"0\\":[0,10000,32328,\\"s21.幽泉\\",3,null,null,null,0,null],\\"1\\":[1,10000,2479,\\"s21.鬼神\\",1,null,null,null,0,null],\\"2\\":[2,10000,5507,\\"s21.梁丘临\\",1,null,null,null,0,null],\\"3\\":[3,10000,2644,\\"s21.皇甫如雪\\",6,null,null,null,0,null]}"]';
var bigData = "";
for(var i = 0;i<8000;i++){
    bigData+=guiledynamic;
}

var checkBigData = function(){
    console.log("数据长度:",bigData.length);
    var date1 = Date.now();
    client.set("testBigData",bigData,function(err,data){
        client.get("testBigData",function(err,data){
            console.log("存储得到的长度:",bigData.length);
            var date2 = Date.now();
            console.log("总耗时:%s毫秒",date2-date1);
        });

    });
};

setInterval(function(){
    checkBigData();
},10);


