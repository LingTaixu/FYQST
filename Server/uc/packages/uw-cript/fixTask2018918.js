var async = require("async");
var taskDao = require("uw-task").taskDao;
var userDao = require("uw-user").userDao;
var scriptUtils = require("./scriptUtils");
var userUtils = require("uw-user").userUtils;
/*
 *   新增成就任务数据(增加 taskId:14000001  taskType:109)
 */

var check = function(serverData, sClient, cb) {
    taskDao.list(sClient, " 1 = 1", [], function(err, taskListData) {
         async.map(taskListData, function(taskData, cb1) {

            if (!taskData) return cb1(null);
            var tasks = taskData.tasks || {};
            var tasksValue = taskData.tasksValue || {};
            var needUp = false;
            if (!tasks[109]) {
                tasks[109] = 14000001;
                needUp = true;
            }
            if (!tasksValue[109] && tasksValue[109] != 0) {
                tasksValue[109] = 0;
                needUp = true;
            }
            if (!needUp) { 
                console.error("=======taskId:",taskData.id,"不需要更新======="); 
                return cb1(null); 
            }
            var updateData = {
                tasks: tasks,
                tasksValue: tasksValue
            }

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

scriptUtils.runAllServers(check);
//scriptUtils.runByServerIds([2],check);