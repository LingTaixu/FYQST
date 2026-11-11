/**
 * Created by Administrator on 2016/2/16.
 */
var taskDao = require("uw-task").taskDao;
var userDao = require("uw-user").userDao;

var async = require("async");
var exports = module.exports;
var scriptUtils = require("./scriptUtils");

var check = function(serverData,sClient,cb){
    //if(serverData.status != 1)  return cb(null,0);
    taskDao.listCols(sClient,"id,userId,tasksValue", " 1=1",[],function(err,taskList) {
        if (err) return cb(err);
        async.mapLimit(taskList,50,function(taskData,cb1){
            var tasksValue = taskData.tasksValue||{};
            if(tasksValue["0"] && tasksValue["0"]>220){
                userDao.selectCols(sClient,"id,lvl", " id = ? ",[taskData.userId],function(err,userData){
                    if (err) return cb1(err);
                    if(!userData){
                        cb1(null);
                    }else{
                        taskData.tasksValue["0"] = userData.lvl;
                        taskDao.update(sClient,{tasksValue:taskData.tasksValue},{id: taskData.id},cb1);
                    }
                });
            }else{
                cb1(null);
            }
        },function(err,data){
            if (err) return cb(err);
            cb(null,taskList.length);
        });
    });
};

scriptUtils.runAllServers(check);
