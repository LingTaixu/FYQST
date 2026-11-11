/**
游戏-任务表(TaskEntity)
任务表
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 用户id **/
    this.userId = null;/*用户id*/
    /** 日常任务 **/
    this.dailyTasks = null;/*日常任务。{&quot;任务id&quot;:[完成数量,是否完成],&quot;任务id&quot;:[完成数量,是否完成],.....}*/
    /** 活跃度 **/
    this.vitality = 0;/*活跃度*/
    /** 活跃度宝箱领取 **/
    this.vitalityChests = null;/*活跃度宝箱领取  【是否领取，是否领取，。。】 下标代表宝箱位置*/
    /** 日常数据最后修改时间 **/
    this.refreshTime = null;/*日常数据最后修改时间*/
    /** 成就任务 **/
    this.tasks = null;/*成就任务。{&quot;任务子类型&quot;:当前正在进行任务,&quot;任务子类型&quot;:当前正在进行任务,.....}*/
    /** 成就任务完成数据 **/
    this.tasksValue = null;/*成就任务完成数据  {&quot;子类型&quot;:数量,&quot;子类型&quot;:数量,...}*/
    /** 已领取的成就任务 **/
    this.doneTasks = null;/*已领取的成就任务。 格式为[taskId1, taskId2]*/
    /** 周任务 **/
    this.weekTasks = null;/*周任务。{&quot;任务id&quot;:[完成数量,需达成数量,是否完成],&quot;任务id&quot;:[完成数量,需达成数量,是否完成],.....}*/
    /** 周数据最后修改时间 **/
    this.weekRefreshTime = null;/*周任务数据最后修改时间*/
    /** 引导任务 **/
    this.guideDoneTasks = null;/*引导完成任务[引导任务id,引导任务id...]*/
    /** 周活跃度 **/
    this.wVitality = 0;/**/
    /** 周活跃度宝箱 **/
    this.wVitalityChests = null;/**/
    /** 周活跃度刷新 **/
    this.wVitalityRefreshTime = null;/**/
    /** 英雄传记 **/
    this.heroTasks = null;/*{heroId:[]}*/
    /** 紧急委托任务 **/
    this.entrustTasks = null;/**/

};
_Class.tableName = 'uw_task';