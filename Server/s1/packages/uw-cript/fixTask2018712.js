var async = require("async"); 
var taskDao = require("uw-task").taskDao;
var userDao = require("uw-user").userDao;
var scriptUtils = require("./scriptUtils");

/*
*   修复成就任务数据(增加 taskId:1063001  taskType:106 ; taskId: 1064001 taskType: 107   )
*   每日任务删除 2100017  增加 2100022 2100023 2100024 
*/

var check = function(serverData, sClient, cb) { 
    userDao.list(sClient, " accountId > 0 and robotId = 0", [], function(err, userList) {
        if (err) return cb(err);
        async.map(userList, function(userData, cb1) {
        	var userId = userData.id;
            taskDao.select(sClient, { userId: userId }, function(err, taskData) {
            	if (err) return cb1(err);
            	if (!taskData) return cb1(null);

                var tasks = taskData.tasks || {};
                var tasksValue = taskData.tasksValue || {};
                if(!tasks[106]){
                    tasks[106] = 1063001;
                }
                if(!tasks[107]){
                    tasks[107] = 1064001;
                }
                if(!tasksValue[106]){
                    tasksValue[106] = 0;
                }
                if(!tasksValue[107]){
                    tasksValue[107] = 0;
                }

                // 每日任务
                var dailyTasks = taskData.dailyTasks || {};
                delete dailyTasks[2100017];
                dailyTasks[2100022] = [0,0];
                dailyTasks[2100023] = [0,0];
                dailyTasks[2100024] = [0,0];

                var updateData = {
                    tasks : tasks,
                    tasksValue : tasksValue,
                    dailyTasks : dailyTasks
                }
            
                taskDao.update(sClient, updateData, { id: taskData.id }, function(err, data) {
	            	if (err) return cb1(err);
	                return cb1(null);
	            });
                
            });
        }, function(err, data) {
            if (err) return cb(err);
            return cb(null);
        });

    });
};
 
scriptUtils.runByServerIds([1],check);
