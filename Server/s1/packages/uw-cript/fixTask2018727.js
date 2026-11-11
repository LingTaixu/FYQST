var async = require("async"); 
var taskDao = require("uw-task").taskDao;
var userDao = require("uw-user").userDao;
var scriptUtils = require("./scriptUtils");
var userUtils = require("uw-user").userUtils;
/*
*   新增成就任务数据(增加 taskId:1065001  taskType:108)
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
                if(!tasks[108]){
                    tasks[108] = 1065001;
                }
                if(!tasksValue[108]){
                    var nobleData = userData.noble;
                    var nobleLevel = userUtils.getNobleLevel(nobleData) || 0;
                    tasksValue[108] = nobleLevel;
                    console.log('更新玩家',userData.id,userData.nickName,'贵族等级成就任务值',nobleLevel);
                }

                var updateData = {
                    tasks : tasks,
                    tasksValue : tasksValue
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
