/**
 * Created by Administrator on 2015/1/20.
 */
var child_process = require('child_process');
var path = require("path");
var cfg = require("../cfg.json");

exports.stopApp = function(port,cb){
    var queryCmd = 'netstat -nao | findstr ' + port;
    child_process.exec(queryCmd, function(error, stdout, stderr) {
        if(error) {
            console.error(error);
            return cb();
        }
        if(!stdout){
            console.error("数据");
            return cb();
        }
        var tempArr = stdout.replace(/[\r\n]/g,",").split(",");
        var temp = tempArr[0];
        if(!temp){
            console.error("没有列表");
            return cb();
        }
        temp = temp.trim().replace(/\s+/g,",").split(",");
        var pid = temp[4];

        if(!pid){
            console.error("获取pid报错");
            return cb();
        }

        var stopCmd = "taskkill /f  /pid " +pid;
        child_process.exec(stopCmd, function(error, stdout, stderr) {
            if(error) {
                console.error("pid:%d stop报错",pid);
                console.error(error);
                return cb();
            }
            console.log("停止pid:%d成功",pid);
            return cb();
        });
    });
};
//exports.stop(3005,function(){});

exports.startApp  =function(cb){
    var child = child_process.spawn("node",["mainApp.js"],{cwd:cfg.serverPath});
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
        console.log(data);
    });
    child.stderr.on('data', function(data) {
        console.error(data);
    });
    setTimeout(function(){
        var child = child_process.spawn("node",["serverApp.js"],{cwd:cfg.serverPath});
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', function(data) {
            console.log(data);
        });
        child.stderr.on('data', function(data) {
            console.error(data);
        });

    },1000);
    setTimeout(function(){
        cb();
    },2000);
};

exports.runNodeFile = function(filePath,cb){
    var startCmd = "node "+ filePath;

    child_process.exec(startCmd, function(error, stdout, stderr) {
        if(error) {
            //console.error("pid:%d stop报错",pid);
            console.error("runNodeFile",error);
        }
    });
    cb();
};

exports.egretBuild = function(string, cb){
    var startCmd = "egret build "+ string;
    var bPath = path.join(cfg.clientPath,"");
    var oldCwd = process.cwd();
    var ePath = bPath.replace(/\\/g,'/');
    process.chdir(ePath);
    child_process.exec(startCmd, function(error, stdout, stderr){
        process.chdir(oldCwd);
        if(error) {
            console.error("egret build报错");
            console.error(error);
            return cb();
        }
        console.log("egret build成功");
        return cb();
    });

};

/*
exports.startApp(function(){
    console.log("启动成功2");
});*/
