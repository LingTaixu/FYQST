var async = require("async");
var taskDao = require("uw-task").taskDao;
var userDao = require("uw-user").userDao;
var scriptUtils = require("./scriptUtils");
var userUtils = require("uw-user").userUtils;
var uwData = require("uw-data");
var c_task = uwData.c_task;
/*
 *   修复推图挂机关卡任务数据    改成了第一关ID是 100001
 */

var check = function(serverData, sClient, cb) {
    taskDao.list(sClient, " 1 = 1", [], function(err, taskListData) {
        async.map(taskListData, function(taskData, cb1) {
            if (!taskData) return cb1(null);
            var tasks = taskData.tasks || {};
            var needUp = false;
            var updateData = {};
            //修复成就任务的 推图类型任务数据
            var tasksValue = taskData.tasksValue || {};
            if (tasksValue[4] && tasksValue[4] != 0) {
                var copyId = tasksValue[4];
                var newId = _toNewCopyId(copyId);
                if(newId != copyId){
                    tasksValue[4] = newId;
                    needUp = true;
                    updateData.tasksValue = tasksValue;
                }
            }
            //修复委托任务的 推图类型任务数据
            var entrustTasks = taskData.entrustTasks || [];
            if (entrustTasks && entrustTasks.length > 0) {
                // [
                //     {"tasks":[[12000001,5,1],[12000002,48,1],[12000003,8,1],[12000004,68,1],[12000005,1,1],[12000006,8,1],[12000008,1,1],[12000009,48,1],[12000010,3002,1],[12000011,73,1],[12000013,1,1]],"isDone":1},
                //     {"tasks":[[12000101,3003,1],[12000102,2,1],[12000103,77,1],[12000104,316191,1],[12000105,3004,1],[12000107,8018,1],[12000108,4,1],[12000109,93,1],[12000110,367782,1],[12000111,3005,1],[12000112,109,1],[12000113,96,1],[12000114,109,1]],"isDone":1},
                // ]
                entrustTasks.forEach(function(item){
                    //console.error('=====>',item);
                    if(item.tasks && item.tasks.length > 0){
                        item.tasks.forEach(function(item2){
                            var taskId = item2[0];
                            var taskValue = item2[1];
                            if(c_task[taskId] && c_task[taskId].taskType == 12 && c_task[taskId].cTaskType == 1){
                                var newId = _toNewCopyId(taskValue);
                                if(newId != taskValue){
                                    item2[1] = newId;
                                    needUp = true;
                                }
                            }
                        }); 
                    }
                });
                updateData.entrustTasks = entrustTasks;
            }
            if (!needUp) return cb1(null);

            taskDao.update(sClient, updateData, { id: taskData.id }, function(err, data) {
                if (err) return cb1(err);
                return cb1(null);
            });
        }, function(err, data) {
            if (err) return cb(err);
            return cb(null);
        });
    });
};

var _toNewCopyId = function(oldId) {
    oldId = oldId*1;
    var newId = oldId;
    if (oldId >= 1 && oldId <= 999) {
        newId = oldId + 100000;
    } else if (oldId >= 10001 && oldId <= 14402) {
        newId = oldId - 9001 + 100000;
    }
    return newId;
}
scriptUtils.runAllServers(check);
//scriptUtils.runByServerIds([2],check);