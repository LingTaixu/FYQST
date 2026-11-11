/**
 * Created by Administrator on 2015/1/20.
 */
var path = require("path");
var cfg = require("../cfg.json");

var projectConfig = require(path.join(cfg.serverPath,"config/project.json"));
var processMgr =require("./processMgr.js");

var HANDLE_TYPE = {restart:1};
exports.handle = function(type,cb){
    if(type) parseInt(type);
    console.log("type",type,HANDLE_TYPE.restart);

    if(type == HANDLE_TYPE.restart){
        restart(cb);
    }else{
        cb("重启失败");
    }
};

var restart = function(cb){
    var masterPort = projectConfig.mainHttpPort;
    //重新生成配置文件
    reRequire(path.join(cfg.toolsPath,"src/genJsData.js"));
   /*
    reRequire(path.join(cfg.toolsPath,"src/xlsx/publishXlsx4Server.js"));
    reRequire(path.join(cfg.toolsPath,"src/xlsx/publishXlsx4Client.js"));
*/
    //编译egret
    processMgr.egretBuild(" --module g-base",function(){
        //停止服务
        processMgr.stopApp(cfg.mainHttpPort,function(){
            //停止服务
            processMgr.stopApp(cfg.serverHttpPort,function(){
                //启动服务器
                processMgr.startApp(cb);
            });
        });
    });

};

var reRequire = function(xlsxPath){
    delete require.cache[require.resolve(xlsxPath)];
    require(xlsxPath) ;
};
/*

restart(function(){
    console.log("启动成功");
});
*/
