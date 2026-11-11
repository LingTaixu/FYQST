/**
 * Created by Administrator on 2014/5/6.
 */

var core4Test = require("uw-test").core4Test;
var dao = require("../../src/dao/serverInfoDao");
var cb = core4Test.cb4Test;
var trans = core4Test.trans;
var mainClient = core4Test.mainClient;

function insert(cb){
    dao.insert(mainClient,  {name:"TTF",area:"服",host:"127.0.0.1",port:"3014",isNew:0,status:3}, cb); 
};
//++++++++++++++++++++++++Run Test+++++++++++++++++++++++

insert(cb);
