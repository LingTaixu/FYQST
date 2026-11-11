module.exports = {
/**
 * 神秘商店购买礼包
 * @args {activityId:"活动id",index:"栏目项"}
 * @isWorker 1
 * @returns [ds.ExActivity]
 */
a_activity_buyMysterShop : "a.ac.a"
,a_activity_buyMysterShop_args : {
    activityId : "_0"//活动id
    ,index : "_1"//栏目项
}
,/**
 * 获取活动列表
 * @args
 * @isWorker 1
 * @returns [ds.ExActivity]
 */
a_activity_getList : "a.ac.e"
,/**
 * 领取精彩活动
 * @args {activityId:"活动id",index:"栏目项"}
 * @returns [ds.UserEntity]
 */
a_activity_receive : "a.ac.f"
,a_activity_receive_args : {
    activityId : "_0"//活动id
    ,index : "_1"//栏目项
}
,/**
 * 获取是否需要操作，即前端所谓的红点，注意：外面的大红点的id为-1
 * @args
 * @isWorker 1
 * @returns {"活动id":"是否需要操作(0|1)",.....}
 */
a_activity_getIsNeedOperate : "a.ac.h"
,/**
 * 补签
 * @args {activityId:"活动id"}
 * @isWorker 1
 * @returns [ds.UserEntity]
 */
a_activity_patchSign : "a.ac.i"
,a_activity_patchSign_args : {
    activityId : "_0"//活动id
}
,/**
 * 刷新每日特惠商店
 * @args {activityId:"活动id", type:"刷新方式"}
 * @isWorker 1
 * @returns [ds.UserEntity]
 */
a_activity_refreshDayShop : "a.ac.k"
,a_activity_refreshDayShop_args : {
    activityId : "_0"//活动id
    ,type : "_1"//刷新方式
}
,/**
 * 初始化转盘数据
 * @args {activityId:"活动id"}
 */
a_activity_getLotteryInfo : "a.ac.l"
,a_activity_getLotteryInfo_args : {
    activityId : "_0"//活动id
}
,/**
 * 领取乐透宝箱
 * @args {activityId:"活动id",index:"宝箱下标"}
 */
a_activity_getLotteryChest : "a.ac.m"
,a_activity_getLotteryChest_args : {
    activityId : "_0"//活动id
    ,index : "_1"//宝箱下标
}
,/**
 * 获取某类活动数据配置 (如签到)
 * @args  {actType:"活动类型"}
 * @returns [ds.ExActivity]
 */
a_activity_getActivityByType : "a.ac.n"
,a_activity_getActivityByType_args : {
    actType : "_0"//活动类型
}
,/**
 * 升级成就段位
 * @args
 * @return ds.Rebirth
 */
a_achieve_levelUp : "a.am.a"
,/**
 * 升级次元壁
 * @args
 * @return ds.Rebirth
 */
a_achieve_cybLevelUp : "a.am.b"
,/**
 * 升级军衔
 * @args
 * @return ds.Rebirth
 */
a_achieve_jxLevelUp : "a.am.c"
,/**
 * 获取竞技场信息
 * @args
 * @returns ds.ArenaRecordEntity
 */
a_arena_getInfo : "a.ar.a"
,/**
 * 重置竞技场挑战对手
 * @args
 * @returns ds.ArenaRecordEntity
 */
a_arena_resetFightRanks : "a.ar.d"
,/**
 * 挑战开始
 * @args {rank:"挑战排行"}
 * @returns ds.ExArena
 */
a_arena_fightStart : "a.ar.h1"
,a_arena_fightStart_args : {
    rank : "_0"//挑战排行
}
,/**
 * 挑战结束
 * @args {rank:"挑战排行",isWin:"是否胜利",fightData:"战斗数据"}
 * @returns ds.FightResult
 */
a_arena_fightEnd : "a.ar.h2"
,a_arena_fightEnd_args : {
    rank : "_0"//挑战排行
    ,isWin : "_1"//是否胜利
    ,fightData : "_2"//战斗数据
}
,/**
 * 获取对手列表
 * @args
 * @returns ds.PKUserData
 */
a_arena_getFightUserList : "a.ar.l"
,/**
 * 购买挑战次数
 * @args
 * @isWorker 1
 * @returns ds.ExUserData
 */
a_arena_buyPKNum : "a.ar.m"
,/**
 * 获取巅峰赛记录实例
 * @args {index:"索引id",count:"总数"}
 * @isWorker 1
 * @returns [ArenaRecordEntity]
 */
a_arena_getRecordList : "a.ar.n"
,a_arena_getRecordList_args : {
    index : "_0"//索引id
    ,count : "_1"//总数
}
,/**
 * 设置阅读
 * @args
 * @isWorker 1
 */
a_arena_setRead : "a.ar.o"
,/**
 * 领取排行奖励
 * @args
 * @returns ds.ExUserData
 */
a_arena_pickRankAward : "a.ar.p"
,/**
 * 购买挑战次数
 * @args
 * @isWorker 1
 * @returns ds.ExUserData
 */
a_arena_refreshCD : "a.ar.q"
,/**
 * 获取排行榜列表
 * @args
 * @isWorker 1
 * @returns [ds.Rank]
 */
a_arena_getRankList : "a.ar.r"
,/**
 * 获取下次刷新剩余时间
 * @args
 * @isWorker 1
 */
a_arena_getRefreshRemainTime : "a.ar.rt"
,/**
 * 获取跨服boss的服务器地址
 * @args
 * @returns ds.BossEntity
 */
a_csBoss_getCSBossServer : "a.b.a"
,/**
 * 获取分红信息
 * @args {lastId:"分页id"}
 * @returns
 */
a_bonus_getInfo : "a.bs.a"
,a_bonus_getInfo_args : {
    lastId : "_0"//分页id
}
,/**
 * 解散关系
 * @args {inviteeUserId:"解散的用户ID"}
 * @returns
 */
a_bonus_breakRelation : "a.bs.b"
,a_bonus_breakRelation_args : {
    inviteeUserId : "_0"//解散的用户ID
}
,/**
 * 上家分享
 * @args {serverIndexId:"服务器ID"}
 * @returns
 */
a_bonus_share : "a.bs.c"
,a_bonus_share_args : {
    serverIndexId : "_0"//服务器ID
}
,/**
 * 上家提取返利
 * @args
 * @returns
 */
a_bonus_draw : "a.bs.d"
,/**
 * 上家首次分享发奖
 * @args
 * @returns
 */
a_bonus_sendShareGift : "a.bs.e"
,/**
 * 获取行会boss列表
 * @args
 * @returns ds.BossEntity
 */
a_boss_getGuildBossList : "a.bo.a"
,/**
 * 获取世界boss列表
 * @args
 * @returns ds.BossEntity
 */
a_boss_getWorldBossList : "a.bo.a1"
,/**
 * 获取组队boss列表
 * @args
 * @returns ds.BossEntity
 */
a_boss_getTeamBossList : "a.bo.a2"
,/**
 * 开启boss
 * @args {bossId:"bossId",isLock:"是否上锁"}
 */
a_boss_openBoss : "a.bo.b1"
,a_boss_openBoss_args : {
    bossId : "_0"//bossId
    ,isLock : "_1"//是否上锁
}
,/**
 * 进入boss系统
 * @args {bossId:"bossId"}
 * @returns ds.BossData
 */
a_boss_enter : "a.bo.b"
,a_boss_enter_args : {
    bossId : "_0"//bossId
}
,/**
 * 开始战斗
 * @args {bossId:"bossId",manyNum:"全民boss多倍进入次数"}
 * @returns ds.ExBossData
 */
a_boss_startFight : "a.bo.c"
,a_boss_startFight_args : {
    bossId : "_0"//bossId
    ,manyNum : "_1"//全民boss多倍进入次数
}
,/**
 * 是否可开始战斗(之前进去过)
 * @args {bossId:"bossId"}
 * @returns ds.CommonRespData
 */
a_boss_canEnter : "a.bo.c1"
,a_boss_canEnter_args : {
    bossId : "_0"//bossId
}
,/**
 * 造成伤害
 * @args {bossId:"bossId",hurtDic:"{英雄id：伤害}",isEnd:"是否最后",mData:"加密",hurtArr:"伤害长度，用于验证"}
 * @returns ds.ExTreasureBossData
 */
a_boss_hurt : "a.bo.d"
,a_boss_hurt_args : {
    bossId : "_0"//bossId
    ,hurtDic : "_1"//{英雄id：伤害}
    ,isEnd : "_2"//是否最后
    ,mData : "_3"//加密
    ,hurtArr : "_4"//伤害长度，用于验证
}
,/**
 * 退出战斗
 * @args {bossId:"bossId"}
 * @returns ds.ExUserData
 */
a_boss_exitFight : "a.bo.e"
,a_boss_exitFight_args : {
    bossId : "_0"//bossId
}
,/**
 * 清除退出cd
 * @args
 * @returns ds.UserEntity
 */
a_boss_clearFightCd : "a.bo.e1"
,/**
 * 鼓舞
 * @args {bossId:"bossId"}
 * @returns ds.ExBossData
 */
a_boss_inspire : "a.bo.f"
,a_boss_inspire_args : {
    bossId : "_0"//bossId
}
,/**
 * 获取鼓舞记录列表
 * @args {bossId:"bossId"}
 * @returns [名字,....]
 */
a_boss_getInspireRecordArr : "a.bo.g"
,a_boss_getInspireRecordArr_args : {
    bossId : "_0"//bossId
}
,/**
 * 同步鼓舞
 * @args {bossId:"bossId"}
 * @returns ds.BossData
 */
a_boss_syncInspire : "a.bo.h"
,a_boss_syncInspire_args : {
    bossId : "_0"//bossId
}
,/**
 * 获取前20伤害排名
 * @args {bossId:"bossId"}
 */
a_boss_getHurtRankList : "a.bo.i"
,a_boss_getHurtRankList_args : {
    bossId : "_0"//bossId
}
,/**
 * 获取第一名
 * @args {bossId:"bossId"}
 */
a_boss_getFirstHurtRank : "a.bo.i1"
,a_boss_getFirstHurtRank_args : {
    bossId : "_0"//bossId
}
,/**
 * 获取boss战斗结果
 * @args {bossId:"bossId",originBossId:"originBossId"}
 */
a_boss_getBossResult : "a.bo.j"
,a_boss_getBossResult_args : {
    bossId : "_0"//bossId
    ,originBossId : "_1"//originBossId
}
,/**
 * 获取boss结果
 * @args {originBossId:"originBossId"}
 */
a_boss_getResultData : "a.bo.j1"
,a_boss_getResultData_args : {
    originBossId : "_0"//originBossId
}
,/**
 * 获得boss记录
 * @args  {type:"boss类型",id:"bossId"}
 */
a_boss_getBossRecord : "a.bo.k"
,a_boss_getBossRecord_args : {
    type : "_0"//boss类型
    ,id : "_1"//bossId
}
,/**
 * 获得世界boss的开启时间
 * @args  
 */
a_boss_getWbInfo : "a.bo.l"
,/**
 * 获得各类系统开启时间
 * @args  
 * @returns [ds.OpenTimeData]
 */
a_boss_getVariousOpenDate : "a.bo.m"
,/**
 * 领取boss伤害奖励
 * @args   {idx:"刻度索引值，从0开始"}
 * @returns [ds.ExUserData]
 */
a_boss_getWBHurtAward : "a.bo.n"
,a_boss_getWBHurtAward_args : {
    idx : "_0"//刻度索引值，从0开始
}
,/**
 * 获得跨服世界boss结果记录
 * @args  
 * @returns [ds.WorldBossRecordEntity]
 */
a_boss_getWBResult : "a.bo.o"
,/**
 * 获取聚灵妖莲数据
 * @args
 */
a_demonLotus_getInfo : "a.de.a"
,/**
 * 升级聚灵妖莲
 * @args
 */
a_demonLotus_upLotus : "a.de.b"
,/**
 * 领取收益
 * @args
 */
a_demonLotus_getRevenue : "a.de.c"
,/**
 * 开光
 * @args
 * @return ds.Opening
 */
a_demonLotus_opening : "a.de.d"
,/**
 * 妖莲进阶
 * @args
 */
a_demonLotus_lotusAdvance : "a.de.e"
,/**
 * 妖莲进阶
 * @args
 */
a_demonLotus_treasureTrain : "a.de.f"
,/**
 * 获取邮件列表
 * @args
 * @isWorker 1
 * @returns MailEntity
 */
a_mail_getList : "a.em.a"
,/**
 * 提取邮件物品
 * @args {mailId:"邮件id"}
 * @return ds.ExUserData
 */
a_mail_pickItems : "a.em.b"
,a_mail_pickItems_args : {
    mailId : "_0"//邮件id
}
,/**
 * 一键领取
 * @args
 * @return ds.ExUserData
 */
a_mail_pickAllItems : "a.em.d"
,/**
 * 设置阅读邮件
 * @args {mailId:"邮件id"}
 * @isWorker 1
 */
a_mail_setRead : "a.em.c"
,a_mail_setRead_args : {
    mailId : "_0"//邮件id
}
,/**
 * 获取是否存在需要阅读或者提取物品的邮件
 * @args {mailId:"邮件id"}
 * @isWorker 1
 * @returns 1|0
 */
a_mail_getIsNeedOperate : "a.em.e"
,a_mail_getIsNeedOperate_args : {
    mailId : "_0"//邮件id
}
,/**.
 * 随机事件购买
 * @args {eventId:"随机事件id"}
 * @returns ds.UserEntity
 */
a_event_eventBuy : "a.ev.a"
,a_event_eventBuy_args : {
    eventId : "_0"//随机事件id
}
,/**
 * 装备
 * @args    {tempId:"英雄id",index:"装备位置",equipId:"装备id"}
 * @returns ds.ExUserData
 */
a_equip_changeEquip : "a.eq.a"
,a_equip_changeEquip_args : {
    tempId : "_0"//英雄id
    ,index : "_1"//装备位置
    ,equipId : "_2"//装备id
}
,/**
 * 传承装备
 * @args    {equipId:"装备id",tempId:"英雄id"}
 * @returns ds.ExUserData
 */
a_equip_inheritedEquip : "a.eq.b"
,a_equip_inheritedEquip_args : {
    equipId : "_0"//装备id
    ,tempId : "_1"//英雄id
}
,/**
 * 定制武器
 * @args    {certificate:"凭证id",job:"职业",name:"装备名",lvl:"装备等级",abilityIndex:"属性下标数组",equipType:"部位"}
 * @returns ds.ExUserData
 */
a_equip_customization : "a.eq.c"
,a_equip_customization_args : {
    certificate : "_0"//凭证id
    ,job : "_1"//职业
    ,name : "_2"//装备名
    ,lvl : "_3"//装备等级
    ,abilityIndex : "_4"//属性下标数组
    ,equipType : "_5"//部位
}
,/**
 * 定制武器升级
 * @args    {equipId:"装备id"}
 * @returns ds.ExUserData
 */
a_equip_upCustomization : "a.eq.d"
,a_equip_upCustomization_args : {
    equipId : "_0"//装备id
}
,/**
 * 锁定装备
 * @args    {equipId:"装备id",isLocked:"1"}
 * @returns ds.ExUserData
 */
a_equip_updateEquipItemLockStatus : "a.eq.e"
,a_equip_updateEquipItemLockStatus_args : {
    equipId : "_0"//装备id
    ,isLocked : "_1"//1
}
,/**
 * 出售装备
 * @args  {equipIdArr:"id,id,id"}
 * @returns ds.ExUserData
 */
a_equip_sellEquipItems : "a.eq.f"
,a_equip_sellEquipItems_args : {
    equipIdArr : "_0"//id,id,id
}
,/**
 * 合成传承装备
 * @args    {itemId:"装备物品id",tempId:"英雄id",part:"装备位置"}
 * @returns ds.ExUserData
 */
a_equip_compoundEquip : "a.eq.i"
,a_equip_compoundEquip_args : {
    itemId : "_0"//装备物品id
    ,tempId : "_1"//英雄id
    ,part : "_2"//装备位置
}
,/**
 * 分解传承装备
 * @args    {equipId:"装备id"}
 * @returns ds.ExUserData
 */
a_equip_decompoundEquip : "a.eq.j"
,a_equip_decompoundEquip_args : {
    equipId : "_0"//装备id
}
,/**
 * 合成神圣装备
 * @args    {tempId:"英雄id",part:"装备位置"}
 * @returns ds.ExUserData
 */
a_equip_compoundHolyEquip : "a.eq.k"
,a_equip_compoundHolyEquip_args : {
    tempId : "_0"//英雄id
    ,part : "_1"//装备位置
}
,/**
 *  神圣装备升级
 * @args    {tempId:"英雄id",part:"装备位置"}
 * @returns ds.ExUserData
 */
a_equip_holyEquipLevelUp : "a.eq.l"
,a_equip_holyEquipLevelUp_args : {
    tempId : "_0"//英雄id
    ,part : "_1"//装备位置
}
,/**
 * 分解神圣装备
 * @args    {equipId:"装备id"}
 * @returns ds.ExUserData
 */
a_equip_decompoundHolyEquip : "a.eq.m"
,a_equip_decompoundHolyEquip_args : {
    equipId : "_0"//装备id
}
,/**
 *  天使恶魔装备升级/升星
 * @args    {tempId:"英雄id",part:"装备位置",haveInitEquipIds:"拥有的初始小天使小恶魔装备背包ID数组"}
 * @returns ds.ExUserData
 */
a_equip_angelDemonEquipLevelUp : "a.eq.n"
,a_equip_angelDemonEquipLevelUp_args : {
    tempId : "_0"//英雄id
    ,part : "_1"//装备位置
    ,haveInitEquipIds : "_2"//拥有的初始小天使小恶魔装备背包ID数组
}
,/**
 * 分解天使恶魔装备
 * @args    {equipId:"装备id"}
 * @returns ds.ExUserData
 */
a_equip_decompoundAngelDemonEquip : "a.eq.o"
,a_equip_decompoundAngelDemonEquip_args : {
    equipId : "_0"//装备id
}
,/**
 * 获取用户信息
 * @args
 */
a_user_getInfo : "a.u.a"
,/**
 * 改名
 * @args {name:"名字"}
 * @returns ds.ExUserData
 */
a_user_changeName : "a.u.b"
,a_user_changeName_args : {
    name : "_0"//名字
}
,/**
 * 同步信息
 * @args {sendData:"战斗数据是数组[最新聊天id]"}
 * @returns ds.AsyncData
 */
a_user_syncData : "a.u.f"
,a_user_syncData_args : {
    sendData : "_0"//战斗数据是数组[最新聊天id]
}
,/**
 * 同步信息2
 * @args
 * @isWorker 1
 * @returns ds.AsyncData2
 */
a_user_syncData2 : "a.u.f1"
,/**
 * 心跳消息
 * @args
 */
a_user_beat : "a.u.f2"
,/**
 * 打开背包宝箱
 * @args {chestId:"宝箱id",count:"宝箱数量",index:"选择物品的下标"}
 * @isWorker 1
 */
a_user_getBagChest : "a.u.g"
,a_user_getBagChest_args : {
    chestId : "_0"//宝箱id
    ,count : "_1"//宝箱数量
    ,index : "_2"//选择物品的下标
}
,/**
 * 购买金币
 * @args
 * @isWorker 1
 * @returns ds.ExUserData
 */
a_user_buyGold : "a.u.d"
,/**
 * 购买凌云石
 * @args
 * @isWorker 1
 * @returns ds.ExUserData
 */
a_user_buyLingyun : "a.u.d1"
,/**
 * 红点提示
 * @args
 */
a_user_getRedPoint : "a.u.h"
,/**
 * 更新引导
 * @args  {guideId:"引导id"}
 * @isWorker 1
 */
a_user_updateGuide : "a.u.i"
,a_user_updateGuide_args : {
    guideId : "_0"//引导id
}
,/**
 * 更新引导状态数据 (曾经做过的状态记录)
 * @args  {k:"引导id串",v:"对应数据"}
 * @isWorker 1
 */
a_user_updateGuideExt : "a.u.i1"
,a_user_updateGuideExt_args : {
    k : "_0"//引导id串
    ,v : "_1"//对应数据
}
,/**
 * 获取掠夺小弟记录
 * @args
 * @returns [ds.HeroChangeRecord]
 */
a_user_getWinRecord : "a.u.j"
,/**
 * 获取被抢小弟记录
 * @args
 * @returns [ds.HeroChangeRecord]
 */
a_user_getLoseRecord : "a.u.k"
,/**
 * 保存桌面成功
 * @args {type:"c_prop.userRecordTypeKey"}
 * @isWorker 1
 */
a_user_saveDeskSuccess : "a.u.o"
,a_user_saveDeskSuccess_args : {
    type : "_0"//c_prop.userRecordTypeKey
}
,/**
 * 设置布阵
 * @args {heroEmbattle:"布阵信息"}
 */
a_user_setHeroEmbattle : "a.u.p"
,a_user_setHeroEmbattle_args : {
    heroEmbattle : "_0"//布阵信息
}
,/**
 * 购买背包格子
 * @args
 * @isWorker 1
 */
a_user_buyBagGrid : "a.u.q"
,/**
 * 更新战斗力
 * @args
 */
a_user_updateCombat : "a.u.q1"
,/**
 * 设置自动战斗
 * @args {isAuto:"是否自动"}
 * @isWorker 1
 */
a_user_setAutoFight : "a.u.q2"
,a_user_setAutoFight_args : {
    isAuto : "_0"//是否自动
}
,/**
 * 设置报错次数
 * @args {errorNum:"异常次数"}
 * @isWorker 1
 */
a_user_setTimeError : "a.u.q3"
,a_user_setTimeError_args : {
    errorNum : "_0"//异常次数
}
,/**
 * 设置杀戮排名挑战
 * @args {eid:"对手userId"}
 * @isWorker 1
 */
a_user_setTodayRankWin : "a.u.q4"
,a_user_setTodayRankWin_args : {
    eid : "_0"//对手userId
}
,/**
 * 获取战印榜
 * @args
 */
a_user_getWarPrintedList : "a.u.q5"
,/**
 * 战印强化
 * @args {warPrintedId:"战印id"}
 */
a_user_warPrintedStrength : "a.u.q6"
,a_user_warPrintedStrength_args : {
    warPrintedId : "_0"//战印id
}
,/**
 * 修改战印榜
 * @args {warPrintedId:"战印id"}
 */
a_user_setMedalTitle : "a.u.q7"
,a_user_setMedalTitle_args : {
    warPrintedId : "_0"//战印id
}
,/**
 * 获取真气数据
 * @args
 */
a_user_getGenuineQi : "a.u.q8"
,/**
 * 激活战印
 * @args {warPrintedId:"战印id"}
 */
a_user_activeMedal : "a.u.q9"
,a_user_activeMedal_args : {
    warPrintedId : "_0"//战印id
}
,/**
 * 更新taptap值
 * @args {num:"tap值"}
 */
a_user_updateTap : "a.u.q10"
,a_user_updateTap_args : {
    num : "_0"//tap值
}
,/**
 * 更新新手弹窗数据
 * @args {popUp:"popUp数值"}
 */
a_user_updatePopUp : "a.u.q11"
,a_user_updatePopUp_args : {
    popUp : "_0"//popUp数值
}
,/**
 * 设置用户icon
 * @args {id:"英雄id"}
 */
a_user_setIcon : "a.u.q12"
,a_user_setIcon_args : {
    id : "_0"//英雄id
}
,/**
 * 爱微游实名认证成功 (客户端通知)
 * @args
 */
a_user_setAwyVerify : "a.u.q13"
,/**
 * 领取爱微游实名认证奖励
 * @args
 */
a_user_getAwyVerifyReward : "a.u.q14"
,/**
 * 爱微游分享成功
 * @args
 */
a_user_awyShare : "a.u.q15"
,/**
 * 领取爱微游分享奖励
 * @args  {idx:'下标索引'}
 */
a_user_getAwyShareReward : "a.u.q16"
,a_user_getAwyShareReward_args : {
    idx : "_0"//下标索引
}
,/**
 * 获取邀请信息
 * @args
 */
a_user_getInviteInfo : "a.u.q17"
,/**
 * 领取邀请奖励
 * @args  {idx:'下标索引'}
 */
a_user_getInviteReward : "a.u.q18"
,a_user_getInviteReward_args : {
    idx : "_0"//下标索引
}
,/**
 * 获取邀请奖励记录表
 * @args
 */
a_user_getInviteRewardRecord : "a.u.q19"
,/**
 * 通知关注结果
 * @args {ret:'0'}
 */
a_user_setFocus : "a.u.q20"
,a_user_setFocus_args : {
    ret : "_0"//0
}
,/**
 * 获取绑定手机url
 * @args
 * @return string url
 */
a_user_getBindPhoneUrl : "a.u.r"
,/**
 * 领取玩吧礼包
 * @args {os:"ios", giftId:"901"}
 */
a_user_getWanbagift : "a.u.s"
,a_user_getWanbagift_args : {
    os : "_0"//ios
    ,giftId : "_1"//901
}
,/**
 * 更新设置数据
 * @args {catNoVipChat:"true", autoBuyLittleHorn:"true", hideChatSys:"false", hideChatWorld:"false", hideChatGuild:"false", hideDanmu:"false"}
 */
a_user_updateSetting : "a.u.t"
,a_user_updateSetting_args : {
    catNoVipChat : "_0"//true
    ,autoBuyLittleHorn : "_1"//true
    ,hideChatSys : "_2"//false
    ,hideChatWorld : "_3"//false
    ,hideChatGuild : "_4"//false
    ,hideDanmu : "_5"//false
}
,/**
 * 更新背包某样物品
 * @args {itemId:"itemId"}
 */
a_user_updateItems4Bag : "a.u.u"
,a_user_updateItems4Bag_args : {
    itemId : "_0"//itemId
}
,/**
 * 更新背包物品 (客户端请求最新背包)
 * @args
 * @isWorker 1
 */
a_user_syncUserInfo : "a.u.u2"
,/**
 * 购买组队副本次数
 * @args
 */
a_user_buyTeamBossNum : "a.u.v"
,/**
 * 关注组队副本
 * @args {id:"组队副本id"}
 */
a_user_followTeamBoss : "a.u.v1"
,a_user_followTeamBoss_args : {
    id : "_0"//组队副本id
}
,/**
 * 取消关注组队副本
 * @args {id:"组队副本id"}
 */
a_user_unfollowTeamBoss : "a.u.v2"
,a_user_unfollowTeamBoss_args : {
    id : "_0"//组队副本id
}
,/**
 * 关注中立boss
 * @args {id:"中立Bossid"}
 */
a_user_followZhongLiBoss : "a.u.v3"
,a_user_followZhongLiBoss_args : {
    id : "_0"//中立Bossid
}
,/**
 * 取消关注中立boss
 * @args {id:"中立Bossid"}
 */
a_user_unfollowZhongLiBoss : "a.u.v4"
,a_user_unfollowZhongLiBoss_args : {
    id : "_0"//中立Bossid
}
,/**
 * 玩家主城假用户数据
 * @args
 * @isWorker 1
 */
a_user_getFakeWSUserList : "a.u.x"
,/**
 * 玩家请求复活
 * @args {type:"类型"}
 * @isWorker 1
 */
a_user_relive : "a.u.y"
,a_user_relive_args : {
    type : "_0"//类型
}
,/**
 * 奖杯升级
 * @args
 */
a_user_upgradeCup : "a.u.c"
,/**
 * 奖杯胶囊使用
 * @args {capsuleId:"胶囊id"}
 */
a_user_useCapsule : "a.u.c1"
,a_user_useCapsule_args : {
    capsuleId : "_0"//胶囊id
}
,/**
 * 英雄任务奖励领取
 * @args {taskId:"任务id"}
 */
a_user_receiveHeroEntranceTask : "a.u.c2"
,a_user_receiveHeroEntranceTask_args : {
    taskId : "_0"//任务id
}
,/**
 * 获取扩展字段信息
 * @args
 */
a_user_getExData : "a.u.c3"
,/**
 * 购买月卡和周卡
 * @args {cardId:"卡id，21为周卡，22为月卡"}
 */
a_user_buyMonthlyOrWeekCard : "a.u.c4"
,a_user_buyMonthlyOrWeekCard_args : {
    cardId : "_0"//卡id，21为周卡，22为月卡
}
,/**
 * 激活贵族
 * @args {}
 */
a_user_activeNoble : "a.u.z"
,/**
 * 贵族奖励领取
 * @args {type:"0为日常, 1为VIP购买",nobleLevel:"要领取的贵族等级"}
 */
a_user_nobleReceive : "a.u.z1"
,a_user_nobleReceive_args : {
    type : "_0"//0为日常, 1为VIP购买
    ,nobleLevel : "_1"//要领取的贵族等级
}
,/**
 * 精灵觉醒 精灵觉醒激活
 * @args  {elfId:"精灵id"}
 */
a_user_elfWakingActivate : "a.u.w"
,a_user_elfWakingActivate_args : {
    elfId : "_0"//精灵id
}
,/**
 * 精灵觉醒 精灵觉醒升级
 * @args  {elfId:"精灵id"}
 */
a_user_elfWakingUpgrade : "a.u.w1"
,a_user_elfWakingUpgrade_args : {
    elfId : "_0"//精灵id
}
,/**
 * 精灵觉醒 精灵觉醒现身
 * @args  {elfId:"精灵id", isAppear:"是否现身"}
 */
a_user_elfWakingAppear : "a.u.w2"
,a_user_elfWakingAppear_args : {
    elfId : "_0"//精灵id
    ,isAppear : "_1"//是否现身
}
,/**
 * 无限迷宫 初始化数据
 * @args  {}
 */
a_user_initInfiniteMazeData : "a.u.m"
,/**
 * 无限迷宫 开门
 * @args  {doorId:"门id"}
 */
a_user_openMazeDoor : "a.u.m1"
,a_user_openMazeDoor_args : {
    doorId : "_0"//门id
}
,/**
 * 无限迷宫 获取排名 请求rankServer
 * @args  {}
 */
a_user_getMazeRankList : "a.u.m2"
,/**
 * 获取用户好友信息
 * @args
 */
a_friend_getInfo : "a.f.a"
,/**
 * 请求添加好友
 * @args {requestedId:"被请求用户id"}
 */
a_friend_requestFriend : "a.f.b"
,a_friend_requestFriend_args : {
    requestedId : "_0"//被请求用户id
}
,/**
 * 处理好友请求
 * @args {requestId:"请求用户id",isTake:"是否接受请求  0：不接受  1：接受"}
 */
a_friend_disposeFriendRequest : "a.f.c"
,a_friend_disposeFriendRequest_args : {
    requestId : "_0"//请求用户id
    ,isTake : "_1"//是否接受请求  0：不接受  1：接受
}
,/**
 * 随机获取助阵好友/陌生人
 * @args
 */
a_friend_eventCheer : "a.f.d"
,/**
 * 获取请求列表
 * @args
 */
a_friend_getRequestInfo : "a.f.e"
,/**
 * 捡取掉落，得到金币，装备
 * @args {copyId:"副本id",uidArr:"掉落唯一id组",fightData:"战斗数据"}
 * @isWorker 1
 * @returns ds.ExUserData
 */
a_fight_pickLoot : "a.fi.a"
,a_fight_pickLoot_args : {
    copyId : "_0"//副本id
    ,uidArr : "_1"//掉落唯一id组
    ,fightData : "_2"//战斗数据
}
,/**
 * 复活
 * @args
 * @returns ds.UserEntity
 */
a_fight_revive : "a.fi.b"
,/**
 * 获取和预掉落数据
 * @args {copyId:"副本id",isBoss:"是否boss关卡",lvl:"用户等级"}
 * @isWorker 1
 * @returns {"唯一id":[[物品id,物品数量],..]}
 */
a_fight_getAndInitNextLoot : "a.fi.c"
,a_fight_getAndInitNextLoot_args : {
    copyId : "_0"//副本id
    ,isBoss : "_1"//是否boss关卡
    ,lvl : "_2"//用户等级
}
,/**
 * 五日目标请求
 * @args
 * @isWorker 1
 * @returns [ds.FiveDaysTaret]
 */
a_fiveDaysTarget_getInfo : "a.ft.e"
,/**
 * 新四日目标请求
 * @args
 * @isWorker 1
 * @returns [ds.FiveDaysTaret]
 */
a_fiveDaysTarget_getInfo1 : "a.ft.a"
,/**
 * 七日目标请求
 * @args
 * @isWorker 1
 * @returns [ds.FiveDaysTaret]
 */
a_fiveDaysTarget_getInfo2 : "a.ft.b"
,/**
 * 获取公会数据
 * @args
 */
a_guild_getInfo : "a.g.a"
,/**
 * 创建公会
 * @args {name:"公会名称"}
 */
a_guild_establishGuild : "a.g.b"
,a_guild_establishGuild_args : {
    name : "_0"//公会名称
}
,/**
 * 搜索公会
 * @args {guildId:"公会id"}
 */
a_guild_seekGuild : "a.g.c"
,a_guild_seekGuild_args : {
    guildId : "_0"//公会id
}
,/**
 * 申请加入公会
 * @args {guildId:"公会id"}
 */
a_guild_joinGuild : "a.g.d"
,a_guild_joinGuild_args : {
    guildId : "_0"//公会id
}
,/**
 * 获取申请列表
 * @args
 */
a_guild_getAppliedMembers : "a.g.e"
,/**
 * 申请列表管理
 * @args {tUserId:"要设置用户id",isConsent:"是否同意"}
 */
a_guild_appliedMembersSet : "a.g.f"
,a_guild_appliedMembersSet_args : {
    tUserId : "_0"//要设置用户id
    ,isConsent : "_1"//是否同意
}
,/**
 * 工会设置
 * @args {joinCon:"加入条件",joinLvl:"加入最低等级"}
 */
a_guild_guildSetting : "a.g.g"
,a_guild_guildSetting_args : {
    joinCon : "_0"//加入条件
    ,joinLvl : "_1"//加入最低等级
}
,/**
 * 退会
 * @args
 */
a_guild_exitGuild : "a.g.h"
,/**
 * 修改公告
 * @args {notice:"公告"}
 */
a_guild_setNotice : "a.g.i"
,a_guild_setNotice_args : {
    notice : "_0"//公告
}
,/**
 * 抽奖
 * @args {count:"次数"}
 */
a_guild_lottery : "a.g.j"
,a_guild_lottery_args : {
    count : "_0"//次数
}
,/**
 * 爵位
 * @args {targetUserId:"成员id",ennobleType:"爵位类型"}
 */
a_guild_setEnnoble : "a.g.k"
,a_guild_setEnnoble_args : {
    targetUserId : "_0"//成员id
    ,ennobleType : "_1"//爵位类型
}
,/**
 * 公会礼盒列表
 * @args 
 */
a_guild_getGitfBoxList : "a.g.l"
,/**
 * 领取公会礼盒
 * @args {id:"礼盒id"}
 */
a_guild_getGitfBox : "a.g.m"
,a_guild_getGitfBox_args : {
    id : "_0"//礼盒id
}
,/**
 * 请求公会仓库
 * @args 
 */
a_guild_getWareHouse : "a.g.n"
,/**
 * 请求分配仓库物品
 * @args {idx:"物品下标",targetUserId:"目标玩家ID",targetUserName:"目标玩家名"}
 */
a_guild_dealWareHouse : "a.g.o"
,a_guild_dealWareHouse_args : {
    idx : "_0"//物品下标
    ,targetUserId : "_1"//目标玩家ID
    ,targetUserName : "_2"//目标玩家名
}
,/**
 * 行会战上届排行
 * @args {type:"排行类型"}
 */
a_guild_getScoreRankListByType : "a.g.p"
,a_guild_getScoreRankListByType_args : {
    type : "_0"//排行类型
}
,/**
 * 行会战每日探索抽奖
 * @args {index:"索引号"}
 * @returns [ds.ExUserData]
 */
a_guild_explore : "a.g.q"
,a_guild_explore_args : {
    index : "_0"//索引号
}
,/**
 * 行会战每日探索生成奖库
 * @args
 * @returns [ds.ExUserData]
 */
a_guild_refreshExplore : "a.g.r"
,/**
 * 贡献
 * @args {actId:"贡献id"}
 * @returns ds.ExGuildData
 */
a_guildPerson_pickAct : "a.gp.a"
,a_guildPerson_pickAct_args : {
    actId : "_0"//贡献id
}
,/**
 * 获取成员列表
 * @args
 * @isWorker 1
 * @returns ds.GuildMember
 */
a_guildPerson_getMemberList : "a.gp.b"
,/**
 * 操作会员
 * @args {targetUserId:"对方userId",op:"操作类型"}
 * @returns ds.ExGuildData
 */
a_guildPerson_opMember : "a.gp.c"
,a_guildPerson_opMember_args : {
    targetUserId : "_0"//对方userId
    ,op : "_1"//操作类型
}
,/**
 * 领取公会日活跃度宝箱
 * @args {index:"宝箱下标"}
 */
a_guildPerson_getGTVitalityChest : "a.gp.d"
,a_guildPerson_getGTVitalityChest_args : {
    index : "_0"//宝箱下标
}
,/**
 * 领取公会周活跃度宝箱
 * @args {index:"宝箱下标"}
 */
a_guildPerson_getGWVitalityChest : "a.gp.e"
,a_guildPerson_getGWVitalityChest_args : {
    index : "_0"//宝箱下标
}
,/**
 * 领取公会礼包
 * @args {id:"礼包id"}
 */
a_guildPerson_getGift : "a.gp.f"
,a_guildPerson_getGift_args : {
    id : "_0"//礼包id
}
,/**
 * 领取公会日捐献宝箱
 * @args {index:"宝箱索引"}
 */
a_guildPerson_getFuliChest : "a.gp.g"
,a_guildPerson_getFuliChest_args : {
    index : "_0"//宝箱索引
}
,/**
 * 获取个人数据
 * @args
 * @returns ds.MyGuildWarData
 */
a_guildWar_getInfo : "a.gw.a"
,/**
 * 获取心法神功数据
 * @args
 */
a_heartStunt_getInfo : "a.hs.a"
,/**
 * 选择心法
 * @args  {index:"槽位下标",heartStuntId:"选择心法id"}
 */
a_heartStunt_choMenCulMethods : "a.hs.b"
,a_heartStunt_choMenCulMethods_args : {
    index : "_0"//槽位下标
    ,heartStuntId : "_1"//选择心法id
}
,/**
 * 心法加点
 * @args  {index:"槽位下标"}
 */
a_heartStunt_stuMenCulMethods : "a.hs.c"
,a_heartStunt_stuMenCulMethods_args : {
    index : "_0"//槽位下标
}
,/**
 *更换心法
 * @args  {index:"槽位下标",heartStuntId:"选择心法id"}
 */
a_heartStunt_chaMenCulMethods : "a.hs.d"
,a_heartStunt_chaMenCulMethods_args : {
    index : "_0"//槽位下标
    ,heartStuntId : "_1"//选择心法id
}
,/**
 * 激活星盘(初始化数据)
 * @args {index:"契约槽位下标"}
 */
a_heartStunt_activateStarPlate : "a.hs.e"
,a_heartStunt_activateStarPlate_args : {
    index : "_0"//契约槽位下标
}
,/**
 * 解锁星盘槽位
 * @args {index:"契约槽位下标",slotIndex:"星盘位置下标"}
 */
a_heartStunt_openSlot : "a.hs.f"
,a_heartStunt_openSlot_args : {
    index : "_0"//契约槽位下标
    ,slotIndex : "_1"//星盘位置下标
}
,/**
 * 穿戴星魂
 * @args {index:"契约槽位下标",slotIndex:"星盘位置下标",starSoulId:"要穿的星魂ID"}
 */
a_heartStunt_wearStarSoul : "a.hs.g"
,a_heartStunt_wearStarSoul_args : {
    index : "_0"//契约槽位下标
    ,slotIndex : "_1"//星盘位置下标
    ,starSoulId : "_2"//要穿的星魂ID
}
,/**
 * 脱下星魂
 * @args {index:"契约槽位下标",slotIndex:"星盘位置下标"}
 */
a_heartStunt_takeOffStarSoul : "a.hs.h"
,a_heartStunt_takeOffStarSoul_args : {
    index : "_0"//契约槽位下标
    ,slotIndex : "_1"//星盘位置下标
}
,/**
 * 升级星魂
 * @args {starSoulId:"要升到的星魂ID"}
 */
a_heartStunt_levelUpStarSoul : "a.hs.i"
,a_heartStunt_levelUpStarSoul_args : {
    starSoulId : "_0"//要升到的星魂ID
}
,/**
 * 召唤英雄
 * @args {tempId:"英雄模板id",sex:"性别"}
 * @returns ds.ExUserData
 */
a_hero_callHero : "a.he.a"
,a_hero_callHero_args : {
    tempId : "_0"//英雄模板id
    ,sex : "_1"//性别
}
,/**
 * 技能升级
 * @args {tempId:"英雄模板id",index:"技能下标"}
 * @returns ds.ExUserData
 */
a_hero_upSkill : "a.he.b"
,a_hero_upSkill_args : {
    tempId : "_0"//英雄模板id
    ,index : "_1"//技能下标
}
,/**
 * 一键技能升级
 * @args {tempId:"英雄模板id",skill:{_desc:"升级参数","技能下标":"对应升到等级"}}
 * @returns ds.ExUserData
 */
a_hero_upSkill2 : "a.he.b2"
,a_hero_upSkill2_args : {
    tempId : "_0"//英雄模板id
    ,skill : "_1"//升级参数
}
,/**
 * 清除技能CD
 * @args
 */
a_hero_clearSkillCd : "a.he.c"
,/**
 * 装备符文块
 * @args {tempId:"英雄模板id",index:"技能下标"}
 * @returns ds.ExUserData
 */
a_hero_wearRune : "a.he.d"
,a_hero_wearRune_args : {
    tempId : "_0"//英雄模板id
    ,index : "_1"//技能下标
}
,/**
 * 升级境界
 * @args {tempId:"英雄模板id"}
 */
a_hero_upRealm : "a.he.e"
,a_hero_upRealm_args : {
    tempId : "_0"//英雄模板id
}
,/**
 * 强化
 * @args {tempId:"英雄模板id",index:"对应装备位置下标"}
 */
a_hero_strength : "a.he.f"
,a_hero_strength_args : {
    tempId : "_0"//英雄模板id
    ,index : "_1"//对应装备位置下标
}
,/**
 * 强化精炼
 * @args {tempId:"英雄模板id",index:"装备下标"}
 */
a_hero_equipRefine : "a.he.f1"
,a_hero_equipRefine_args : {
    tempId : "_0"//英雄模板id
    ,index : "_1"//装备下标
}
,/**
 * 一键强化
 * @args {tempId:"英雄模板id",equip:{_desc:"升级参数","装备位置下标":"对应强化到等级"}}
 */
a_hero_strength2 : "a.he.f2"
,a_hero_strength2_args : {
    tempId : "_0"//英雄模板id
    ,equip : "_1"//升级参数
}
,/**
 * 升星
 * @args {tempId:"英雄模板id",index:"对应装备位置下标"}
 */
a_hero_upStar : "a.he.g"
,a_hero_upStar_args : {
    tempId : "_0"//英雄模板id
    ,index : "_1"//对应装备位置下标
}
,/**
 * 升星突破
 * @args {tempId:"英雄模板id",index:"对应装备位置下标"}
 */
a_hero_starTop : "a.he.g1"
,a_hero_starTop_args : {
    tempId : "_0"//英雄模板id
    ,index : "_1"//对应装备位置下标
}
,/**
 * 宝石升级
 * @args {tempId:"英雄模板id",index:"对应装备位置下标"}
 */
a_hero_upGem : "a.he.h"
,a_hero_upGem_args : {
    tempId : "_0"//英雄模板id
    ,index : "_1"//对应装备位置下标
}
,/**
 * 翅膀培养
 * @args {tempId:"英雄模板id",fosType:"培养类型"}
 */
a_hero_wingFos : "a.he.z"
,a_hero_wingFos_args : {
    tempId : "_0"//英雄模板id
    ,fosType : "_1"//培养类型
}
,/**
 * 翅膀强化
 * @args {tempId:"英雄模板id",part:"部位",isReplace:"是否元宝替代"}
 */
a_hero_wingStrength : "a.he.z1"
,a_hero_wingStrength_args : {
    tempId : "_0"//英雄模板id
    ,part : "_1"//部位
    ,isReplace : "_2"//是否元宝替代
}
,/**
 * 翅膀一键培养
 * @args {tempId:"英雄模板id",fosType:"培养类型",isUseDiamond:"是否使用元宝"}
 */
a_hero_wingFos2Top : "a.he.z2"
,a_hero_wingFos2Top_args : {
    tempId : "_0"//英雄模板id
    ,fosType : "_1"//培养类型
    ,isUseDiamond : "_2"//是否使用元宝
}
,/**
 * 翅膀升级
 * @args {tempId:"英雄模板id"}
 */
a_hero_upWing : "a.he.k"
,a_hero_upWing_args : {
    tempId : "_0"//英雄模板id
}
,/**
 * 翅膀激活
 * @args {tempId:"英雄模板id"}
 */
a_hero_wingActivate : "a.he.l"
,a_hero_wingActivate_args : {
    tempId : "_0"//英雄模板id
}
,/**
 * 重新计算属性和战力
 * @args
 */
a_hero_calPropAndCombat : "a.he.m"
,/**
 * 获取主英雄外观数据
 * @args {userId:"用户id"}
 * @returns [装备显示id,武器显示id,翅膀id,性别]
 */
a_hero_getMainHeroDisplay : "a.he.n"
,a_hero_getMainHeroDisplay_args : {
    userId : "_0"//用户id
}
,/**
 * 获取主英雄外观数据
 * @args {userId:"用户id",tempId:"英雄模板id"}
 * @returns [装备显示id,武器显示id,翅膀id,性别]
 */
a_hero_getHeroDisplayByTempId : "a.he.o"
,a_hero_getHeroDisplayByTempId_args : {
    userId : "_0"//用户id
    ,tempId : "_1"//英雄模板id
}
,/**
 * 获取要显示的英雄数据
 * @args  {userId:"用户id"}
 */
a_hero_getShowHeroData : "a.he.o1"
,a_hero_getShowHeroData_args : {
    userId : "_0"//用户id
}
,/**
 * 装备符文块
 * @args {tempId:"英雄模板id"}
 * @returns ds.ExUserData
 */
a_hero_wearAllRune : "a.he.p"
,a_hero_wearAllRune_args : {
    tempId : "_0"//英雄模板id
}
,/**
 * 开启自动注入
 * @args {isOpenIn:"是否开启"}
 * @returns ds.ExUserData
 */
a_hero_autoInfuseSwitch : "a.he.q"
,a_hero_autoInfuseSwitch_args : {
    isOpenIn : "_0"//是否开启
}
,/**
 * 额外注入
 * @args {type:"类型"}
 * @returns ds.ExUserData
 */
a_hero_extraInfuse : "a.he.q1"
,a_hero_extraInfuse_args : {
    type : "_0"//类型
}
,/**
 * 保存出战列表
 * @args {fightArr:"顺序数组"}
 * @returns
 */
a_hero_saveFightList : "a.he.q2"
,a_hero_saveFightList_args : {
    fightArr : "_0"//顺序数组
}
,/**
 * 保存英雄皮肤
 * @args {hid:"英雄id",tid:"新皮肤id"}
 * @returns
 */
a_hero_saveHeroTmpId : "a.he.q3"
,a_hero_saveHeroTmpId_args : {
    hid : "_0"//英雄id
    ,tid : "_1"//新皮肤id
}
,/**
 *  激活神圣徽章或宝典
 * @args    {tempId:"英雄id",index:"0 激活徽章 1 激活宝典"}
 * @returns ds.ExUserData
 */
a_hero_holyActivate : "a.he.r"
,a_hero_holyActivate_args : {
    tempId : "_0"//英雄id
    ,index : "_1"//0 激活徽章 1 激活宝典
}
,/**
 *   神圣徽章或宝典升级
 * @args    {tempId:"英雄id",index:"0 徽章升级 1 宝典升级", items:"消耗物品 k:v"}
 * @returns ds.ExUserData
 */
a_hero_holyFos : "a.he.s"
,a_hero_holyFos_args : {
    tempId : "_0"//英雄id
    ,index : "_1"//0 徽章升级 1 宝典升级
    ,items : "_2"//消耗物品 k:v
}
,/**
 * 领取英雄传记奖励
 * @args    {tempId:"英雄id",index:"第几个任务"}
 * @returns ds.ExUserData
 */
a_hero_receiveHeroTask : "a.he.t"
,a_hero_receiveHeroTask_args : {
    tempId : "_0"//英雄id
    ,index : "_1"//第几个任务
}
,/**
 * 更新伙伴总战力
 * @args  {heroId:"英雄id", combat:"伙伴总战力"}
 */
a_hero_updatePartnerCombat : "a.he.u"
,a_hero_updatePartnerCombat_args : {
    heroId : "_0"//英雄id
    ,combat : "_1"//伙伴总战力
}
,/**
 * 更新深渊装备总战力
 * @args  {heroId:"英雄id", combat:"深渊装备总战力"}
 */
a_hero_updateHolyCombat : "a.he.u1"
,a_hero_updateHolyCombat_args : {
    heroId : "_0"//英雄id
    ,combat : "_1"//深渊装备总战力
}
,/**
 * 激活深渊共鸣
 * @args  {heroId:"英雄id"}
 */
a_hero_actHolyRes : "a.he.a1"
,a_hero_actHolyRes_args : {
    heroId : "_0"//英雄id
}
,/**
 * 魔法学院魔书研究加点
 * @args  {heroId:"英雄id", bookType:"魔书类型"}
 */
a_hero_addMagicPoint : "a.he.v"
,a_hero_addMagicPoint_args : {
    heroId : "_0"//英雄id
    ,bookType : "_1"//魔书类型
}
,/**
 * 魔法学院 重置魔灵点数
 * @args  {heroId:"英雄id"}
 */
a_hero_resetMagicPoint : "a.he.v1"
,a_hero_resetMagicPoint_args : {
    heroId : "_0"//英雄id
}
,/**
 * 魔法学院 增加额外魔灵点数
 * @args  {heroId:"英雄id", count:"道具数量"}
 */
a_hero_addMagicExtraPoint : "a.he.v2"
,a_hero_addMagicExtraPoint_args : {
    heroId : "_0"//英雄id
    ,count : "_1"//道具数量
}
,/**
 * 装备附魔
 * @args {heroId:"英雄id",index:"对应装备位置下标","isAvertDrop":"是否勾选防掉级"}
 */
a_hero_enchant : "a.he.e1"
,a_hero_enchant_args : {
    heroId : "_0"//英雄id
    ,index : "_1"//对应装备位置下标
    ,isAvertDrop : "_2"//是否勾选防掉级
}
,/**
 * 抽奖
 * @args {type:"抽奖类型",count:"抽奖次数"}
 */
a_lottery_lottery : "a.l.a"
,a_lottery_lottery_args : {
    type : "_0"//抽奖类型
    ,count : "_1"//抽奖次数
}
,/**
 * 领取探宝值宝箱
 * @args
 */
a_lottery_getTreasureChest : "a.l.b"
,/**
 * 初始化数据
 * @args
 */
a_lottery_getInfo : "a.l.c"
,/**
 * 初始化数据
 * @args
 * @isWorker 1
 */
a_task_getInfo : "a.t.a"
,/**
 * 任务奖励领取
 * @args {taskId:"任务id"}
 * @isWorker 1
 */
a_task_taskAward : "a.t.b"
,a_task_taskAward_args : {
    taskId : "_0"//任务id
}
,/**
 * 成就任务一键领取
 * @args {}
 * @isWorker 1
 */
a_task_achieveTaskAwardAll : "a.t.b1"
,/**
 * 领取活跃度宝箱
 * @args {index:"宝箱下标"}
 * @isWorker 1
 */
a_task_getVitalityChest : "a.t.c"
,a_task_getVitalityChest_args : {
    index : "_0"//宝箱下标
}
,/**
 * 领取周活跃度宝箱
 * @args {index:"宝箱下标"}
 * @isWorker 1
 */
a_task_getWeekVitalityChest : "a.t.d"
,a_task_getWeekVitalityChest_args : {
    index : "_0"//宝箱下标
}
,/**
 * 批准委托
 * @args {index:"委托下标"}
 * @isWorker 1
 */
a_task_ratifyEntrust : "a.t.e"
,a_task_ratifyEntrust_args : {
    index : "_0"//委托下标
}
,/**
 * 领取委托奖励
 * @args {index:"委托下标"}
 * @isWorker 1
 */
a_task_receiveEntrustAward : "a.t.f"
,a_task_receiveEntrustAward_args : {
    index : "_0"//委托下标
}
,/**
 * 购买挑战次数
 * @args
 * @returns ds.UserEntity
 */
a_pk_buyPKNum : "a.p.a"
,/**
 * 获取对手列表
 * @args
 * @returns  [ds.PKUserData]
 */
a_pk_getPKUserList : "a.p.b"
,/**
 * 获取对手信息
 * @args {userId:"用户id"}
 * @returns  ds.PKUserData
 */
a_pk_getPKUserData : "a.p.c"
,a_pk_getPKUserData_args : {
    userId : "_0"//用户id
}
,/**
 * 战斗
 * @args {enemyId:"对手id",isNPC:"是否npc 0|1",fightType:"1、排位赛 2、仇人榜"}
 * @returns  ds.FightResult
 */
a_pk_fight : "a.p.d"
,a_pk_fight_args : {
    enemyId : "_0"//对手id
    ,isNPC : "_1"//是否npc 0|1
    ,fightType : "_2"//1、排位赛 2、仇人榜
}
,/**
 * 获取仇人列表
 * @args
 * @returns  [ds.PKUserData]
 */
a_pk_getEnemyList : "a.p.e"
,/**
 * 获取排行榜
 * @args
 * @returns [ds.PKUserData]
 */
a_pk_getUserRanks : "a.p.f"
,/**
 * 获取自己的排名
 * @args
 * @returns 排名
 */
a_pk_getRank : "a.p.g"
,/**
 * 改签名
 * @args {sign:"签名"}
 * @returns ds.UserEntity
 */
a_pk_changeSign : "a.p.h"
,a_pk_changeSign_args : {
    sign : "_0"//签名
}
,/**
 * 设置阅读
 * @args
 */
a_pk_setRead : "a.p.i"
,/**
 * 跳过战斗
 * @args
 */
a_pk_skip : "a.p.j"
,/**
 * 领取排行奖励
 * @args
 */
a_pk_pickRankAward : "a.p.k"
,/**
 * 获取仇人pk记录
 * @args {enemyId:"敌人id"}
 * @returns [ds.HeroChangeRecord]
 */
a_pk_getEnemyRecord : "a.p.l"
,a_pk_getEnemyRecord_args : {
    enemyId : "_0"//敌人id
}
,/**
 * 获取野外仇人列表
 * @args
 * @returns  [ds.PKUserData]
 */
a_pk_getList : "a.p.m"
,/**
 * 开启pk
 * @args
 * @returns ds.PkOutEntity
 */
a_pkOut_open : "a.po.a"
,/**
 * 获取对手列表
 * @args
 * @returns ds.ExPkOut
 */
a_pkOut_getEnemyList : "a.po.b"
,/**
 * 获取未报仇仇人列表
 * @args
 * @returns [ds.PkOutUserData]
 */
a_pkOut_getRevengeEnemyList : "a.po.b1"
,/**
 * 刷新对手
 * @args
 * @returns [ds.PkOutUserData]
 */
a_pkOut_refreshEnemy : "a.po.c"
,/**
 * 请求开始战斗
 * @args {enemyId:"对手id",fightType:"战斗类型 c_prop.fightTypeKey",isRevenge:"是否复仇"}
 * @returns ds.ExPkOut
 */
a_pkOut_start : "a.po.d"
,a_pkOut_start_args : {
    enemyId : "_0"//对手id
    ,fightType : "_1"//战斗类型 c_prop.fightTypeKey
    ,isRevenge : "_2"//是否复仇
}
,/**
 * 结束战斗
 * @args {isWin:"是否胜利", enemyId:"对手的userId",fightData:"战斗数据",fightType:"战斗类型 c_prop.fightTypeKey",isRevenge:"是否复仇"}
 * @returns ds.FightResult
 */
a_pkOut_end : "a.po.e"
,a_pkOut_end_args : {
    isWin : "_0"//是否胜利
    ,enemyId : "_1"//对手的userId
    ,fightData : "_2"//战斗数据
    ,fightType : "_3"//战斗类型 c_prop.fightTypeKey
    ,isRevenge : "_4"//是否复仇
}
,/**
 * 获取排行列表，返回50名数据
 * @args
 * @returns [ds.Rank]
 */
a_pkOut_getRankList : "a.po.f"
,/**
 * 获取个人排名
 * @args
 * @returns 排名
 */
a_pkOut_getMyRank : "a.po.g"
,/**
 * 获取个人战斗记录，最多20条
 * @args
 * @returns ds.ArenaRecordEntity
 */
a_pkOut_getPkRecordList : "a.po.h"
,/**
 * 获取个人战斗记录，最多20条
 * @args
 * @returns ds.ArenaRecordEntity
 */
a_pkOut_getRankPkRecordList : "a.po.h1"
,/**
 * 设置阅读
 * @args
 */
a_pkOut_setPkRecordRead : "a.po.i"
,/**
 * 处理被抢
 * @args {fightType:"战斗类型 c_prop.fightTypeKey"}
 */
a_pkOut_dealRecord : "a.po.j"
,a_pkOut_dealRecord_args : {
    fightType : "_0"//战斗类型 c_prop.fightTypeKey
}
,/**
 * 清除pk值
 * @args
 */
a_pkOut_clearPkValue : "a.po.k"
,/**
 * 设置去掉红点
 * @args
 */
a_pkOut_resetBePkKill : "a.po.l"
,/**
 * 隐姓埋名
 * @args
 */
a_pkOut_incognito : "a.po.m"
,/**
 * 获取个人战斗记录，最多20条
 * @args
 * @returns ds.TreasureRecordEntity
 */
a_pkOut_getTreasurePkRecordList : "a.po.n"
,/**
 * 获取商店数据
 * @args {type:"商店类型c_prop.shopTypeKey.normal"}
 * @isWorker 1
 */
a_shop_getInfo : "a.s.a"
,a_shop_getInfo_args : {
    type : "_0"//商店类型c_prop.shopTypeKey.normal
}
,/**
 * 刷新商店
 * @args {type:"类型",lvlRefresh:"是否等级刷新"}
 */
a_shop_refreshExShop : "a.s.b"
,a_shop_refreshExShop_args : {
    type : "_0"//类型
    ,lvlRefresh : "_1"//是否等级刷新
}
,/**
 * 商店购买
 * @args {index:"用户选择的items下标",type:"商店类型c_prop.shopTypeKey.normal",num:"购买数量"}
 * @returns ds.ExUserData
 */
a_shop_buy : "a.s.c"
,a_shop_buy_args : {
    index : "_0"//用户选择的items下标
    ,type : "_1"//商店类型c_prop.shopTypeKey.normal
    ,num : "_2"//购买数量
}
,/**
 * 购买所有（装备商店）
 * @args {type:"商店类型c_prop.shopTypeKey.normal"}
 * @returns ds.ExUserData
 */
a_shop_buyAll : "a.s.d"
,a_shop_buyAll_args : {
    type : "_0"//商店类型c_prop.shopTypeKey.normal
}
,/**
 * 拉霸（宠物商店）
 * @args {type:"操作类型 0 使用猫粮 1 使用钻石",guide:"1 表示引导拉霸 0 普通拉霸",num:"拉霸次数"}
 * @returns ds.LabaData
 */
a_shop_laba : "a.s.e"
,a_shop_laba_args : {
    type : "_0"//操作类型 0 使用猫粮 1 使用钻石
    ,guide : "_1"//1 表示引导拉霸 0 普通拉霸
    ,num : "_2"//拉霸次数
}
,/**
 * 获取副本列表
 * @args {type:"副本类型"}
 * @isWorker 1
 */
a_copy_getInfo : "a.c.a"
,a_copy_getInfo_args : {
    type : "_0"//副本类型
}
,/**
 * 购买挑战次数
 * @args {type:"副本类型",copyId:"副本id"}
 */
a_copy_buyCopyCount : "a.c.b"
,a_copy_buyCopyCount_args : {
    type : "_0"//副本类型
    ,copyId : "_1"//副本id
}
,/**
 * 购买装备入场卷
 * @args
 */
a_copy_buyEquipTessera : "a.c.c"
,/**
 * 购买境界入场卷
 * @args
 */
a_copy_buyRealmTessera : "a.c.d"
,/**
 * 扫荡
 * @args {copyId:"副本id",num:"扫荡次数"}
 * @returns [ds.FightResult]
 */
a_copy_copyWipe : "a.c.e"
,a_copy_copyWipe_args : {
    copyId : "_0"//副本id
    ,num : "_1"//扫荡次数
}
,/**
 * 副本开始
 * @args {copyId:"副本id",biCost:"消耗log",manyNum:"深渊多次进入次数"}
 * @returns [ds.ExCopyProgress]
 */
a_copy_start : "a.c.f"
,a_copy_start_args : {
    copyId : "_0"//副本id
    ,biCost : "_1"//消耗log
    ,manyNum : "_2"//深渊多次进入次数
}
,/**
 * 副本结束
 * @args {copyId:"副本id",fightData:"战斗验证数据",isWin:"是否胜利"}
 * @returns [ds.ExCopyProgress]
 */
a_copy_end : "a.c.g"
,a_copy_end_args : {
    copyId : "_0"//副本id
    ,fightData : "_1"//战斗验证数据
    ,isWin : "_2"//是否胜利
}
,/**
 * 更新连胜
 * @args {copyId:"副本id"}
 * @isWorker 1
 * @returns [ds.FightResult]
 */
a_copy_updateWinningStreak : "a.c.h"
,a_copy_updateWinningStreak_args : {
    copyId : "_0"//副本id
}
,/**
 * 查看
 * @args {copyId:"副本id"}
 * @isWorker 1
 * @returns [ds.CopyProgressEntity]
 */
a_copy_setRead : "a.c.i"
,a_copy_setRead_args : {
    copyId : "_0"//副本id
}
,/**
 * 行会副本开始
 * @args {copyId:"章节id",bossId:"bossid"}
 * @returns []
 */
a_copy_guildStart : "a.c.j"
,a_copy_guildStart_args : {
    copyId : "_0"//章节id
    ,bossId : "_1"//bossid
}
,/**
 * 行会副本结束
 * @args {copyId:"章节id",bossId:"bossid",isWin:"结果"}
 * @returns [ds.ExCopyProgress]
 */
a_copy_guildEnd : "a.c.k"
,a_copy_guildEnd_args : {
    copyId : "_0"//章节id
    ,bossId : "_1"//bossid
    ,isWin : "_2"//结果
}
,/**
 * 行会副本领取奖励
 * @args {type:"boss或章节",typeId:"bossId或章节id"}
 * @returns [ds.ExCopyProgress]
 */
a_copy_guildCopyAward : "a.c.l"
,a_copy_guildCopyAward_args : {
    type : "_0"//boss或章节
    ,typeId : "_1"//bossId或章节id
}
,/**
 * 行会副本重置
 * @args
 * @returns []
 */
a_copy_guildCopyReset : "a.c.m"
,/**
 * 公会副本清除CD
 * @args {bossId:"bossID"}
 */
a_copy_clearGuildCopy : "a.c.n"
,a_copy_clearGuildCopy_args : {
    bossId : "_0"//bossID
}
,/**
 * 爬塔领取奖励
 * @args {copyId:"副本id"}
 * @returns [ds.ExCopyProgress]
 */
a_copy_paTaAward : "a.c.o"
,a_copy_paTaAward_args : {
    copyId : "_0"//副本id
}
,/**
 * 爬塔宝库抽奖
 * @args {free:"是否为免费，免费为1，付费为0"}
 * @returns [ds.ExCopyProgress]
 */
a_copy_paTaTreasury : "a.c.o1"
,a_copy_paTaTreasury_args : {
    free : "_0"//是否为免费，免费为1，付费为0
}
,/**
 * 推图副本领取奖励
 * @args {copyId:"副本id"}
 * @returns [ds.ExCopyProgress]
 */
a_copy_normalAward : "a.c.p"
,a_copy_normalAward_args : {
    copyId : "_0"//副本id
}
,/**
 * 深渊副本抽奖
 * @args {index:"索引号"}
 * @returns [ds.ExUserData]
 */
a_copy_syCopyLottery : "a.c.q"
,a_copy_syCopyLottery_args : {
    index : "_0"//索引号
}
,/**
 * 掉落记录
 * @args
 * @returns [ds.ExUserData]
 */
a_copy_getCopyLootRecordList : "a.c.r"
,/**
 * 购买探险秘境的体力
 * @args
 * @returns [UserEntity]
 */
a_copy_buyPataPower : "a.c.s"
,/**
 * 获取排行榜
 * @args {rankType:"排行类型"}
 * @isWorker 1
 * @returns ds.UserRankEntity
 */
a_rank_getRankList : "a.r.a"
,a_rank_getRankList_args : {
    rankType : "_0"//排行类型
}
,/**
 * 获取个人排行榜
 * @args {rankType:"排行类型"}
 * @returns ds.ExUserRankData
 */
a_rank_getUserRank : "a.r.b"
,a_rank_getUserRank_args : {
    rankType : "_0"//排行类型
}
,/**
 * 获取排行榜数据
 * @args {rankType:"排行类型"}
 * @returns 【个人排名，个人排行数据，所有排行数据】
 */
a_rank_allRankArr : "a.r.c"
,a_rank_allRankArr_args : {
    rankType : "_0"//排行类型
}
,/**
 * 获取公会相关排行榜数据
 * @args {rankType:"排行类型"}
 * @returns 【所有排行数据,公会名称{}】
 */
a_rank_getGuildRank : "a.r.d"
,a_rank_getGuildRank_args : {
    rankType : "_0"//排行类型
}
,/**
 * 转生
 * @args
 * @return ds.Rebirth
 */
a_rebirth_rebirth : "a.rb.a"
,/**
 * 购买转生丹
 * @args {index:"转生丹index",num:"转生丹数量"}
 * @return ds.ExUserData
 */
a_rebirth_buyRebirth : "a.rb.b"
,a_rebirth_buyRebirth_args : {
    index : "_0"//转生丹index
    ,num : "_1"//转生丹数量
}
,/**
 * 获取充值记录信息
 * @args
 * @isWorker 1
 */
a_recharge_getInfo : "a.rc.a"
,/**
 * 充值
 * @args {rechargeId:"充值项ID",channelId:"渠道号",receiptData:"苹果验证数据"}
 */
a_recharge_recharge : "a.rc.b"
,a_recharge_recharge_args : {
    rechargeId : "_0"//充值项ID
    ,channelId : "_1"//渠道号
    ,receiptData : "_2"//苹果验证数据
}
,/**
 * 获取今天累计充值
 * @args
 * @isWorker 1
 */
a_recharge_getTodayCount : "a.rc.c"
,/**
 * 获取所有累计充值
 * @args
 * @isWorker 1
 */
a_recharge_getAllCount : "a.rc.d"
,/**
 * 请求充值
 * @args {rechargeId:"充值项ID",goodsId:"渠道物品id"}
 * @returns [请求id,服务器id,支付数据]
 */
a_recharge_getRequest : "a.rc.e"
,a_recharge_getRequest_args : {
    rechargeId : "_0"//充值项ID
    ,goodsId : "_1"//渠道物品id
}
,/**
 * 处理支付请求
 * @args
 * returns  ["是否处理完","获得钻石","充值项"]
 */
a_recharge_handleRequest : "a.rc.g"
,/**
 * 活动服务器里充值的fakeData
 * @args
 * returns  fakeData
 */
a_recharge_getFake : "a.rc.h"
,/**
 * 通知充值结果 (厘米秀)
 * @args {orderNo:"充值订单", payData:"支付数据"}
 */
a_recharge_checkPayResult : "a.rc.i"
,a_recharge_checkPayResult_args : {
    orderNo : "_0"//充值订单
    ,payData : "_1"//支付数据
}
,/**
 * 获取最新的聊天记录
 * @args {lastId:"最后一条的唯一id",guildId:"公会id",guildLastId:"最后一条公会的唯一id"}
 * @returns ds.ChatData
 */
a_chat_getNewList : "a.ch.a"
,a_chat_getNewList_args : {
    lastId : "_0"//最后一条的唯一id
    ,guildId : "_1"//公会id
    ,guildLastId : "_2"//最后一条公会的唯一id
}
,/**
 * 获取最新的系统消息记录
 * @args {lastId:"最后一条的唯一id"}
 * @returns ds.ChatData
 */
a_chat_getNewSysMsgList : "a.ch.hda"
,a_chat_getNewSysMsgList_args : {
    lastId : "_0"//最后一条的唯一id
}
,/**
 * 发送聊天
 * @args {content:"聊天内容",lastId:"最后一条的唯一id",type:"聊天类型",guildId:"公会id",guildLastId:"公会最后一条的唯一id",isLittleHorn:"true",shareFightType:"",shareBossId:""}
 * @returns ds.ChatData
 */
a_chat_sendData : "a.ch.b"
,a_chat_sendData_args : {
    content : "_0"//聊天内容
    ,lastId : "_1"//最后一条的唯一id
    ,type : "_2"//聊天类型
    ,guildId : "_3"//公会id
    ,guildLastId : "_4"//公会最后一条的唯一id
    ,isLittleHorn : "_5"//true
    ,shareFightType : "_6"//
    ,shareBossId : "_7"//
}
,/**
 * 使用兑换码
 * @args {code:"兑换码"}
 * @returns ds.ExUserData
 */
a_coupon_use : "a.co.a"
,a_coupon_use_args : {
    code : "_0"//兑换码
}
,/**
 * 获取vip
 * @args
 * @isWorker 1
 * @returns ds.SdkVipData
 */
a_sdk_getVip : "a.sd.a"
,/**
 * 装备熔炼
 * @args {equipArr:"所要熔炼的装备id数组",choColor:"质量"}
 */
a_smelt_smelt : "a.sm.a"
,a_smelt_smelt_args : {
    equipArr : "_0"//所要熔炼的装备id数组
    ,choColor : "_1"//质量
}
,/**
 * 装备合成
 * @args {compoundId:"所要合成物品的Id",compoundNum:"所要合成物品的数量"}
 * @isWorker 1
 */
a_smelt_compound : "a.sm.b"
,a_smelt_compound_args : {
    compoundId : "_0"//所要合成物品的Id
    ,compoundNum : "_1"//所要合成物品的数量
}
,/**
 * 装备特戒
 * @args {tempId:"英雄id",breakId:"所要装备特戒的Id"}
 */
a_smelt_wearParRing : "a.sm.c"
,a_smelt_wearParRing_args : {
    tempId : "_0"//英雄id
    ,breakId : "_1"//所要装备特戒的Id
}
,/**
 * 特戒突破
 * @args {tempId:"英雄id",breakId:"所要装备特戒的Id"}
 */
a_smelt_ringBreak : "a.sm.d"
,a_smelt_ringBreak_args : {
    tempId : "_0"//英雄id
    ,breakId : "_1"//所要装备特戒的Id
}
,/**
 * 出售物品
 * @args    {itemId:"id",itemNum:"num"}
 * @returns ds.ExUserData
 */
a_item_sellItems : "a.it.a"
,a_item_sellItems_args : {
    itemId : "_0"//id
    ,itemNum : "_1"//num
}
,/**
 * 江湖探秘
 * @args
 * @returns [ds.PkOutUserData]
 */
a_treasure_spies : "a.tr.a"
,/**
 * 获取新pk额外信息
 * @args
 * @returns ds.ExPkOutInfo
 */
a_treasure_getExPkOutInfo : "a.tr.b"
,/**
 * 开启秘宝
 * @args {id:"id"}
 * @returns ds.TreasureInfo
 */
a_treasure_open : "a.tr.c"
,a_treasure_open_args : {
    id : "_0"//id
}
,/**
 * 开启秘宝
 * @args {itemId:"id"}
 * @returns ds.ComposeInfo
 */
a_treasure_compose : "a.tr.d"
,a_treasure_compose_args : {
    itemId : "_0"//id
}
,/**
 * 使用法宝道具
 * @args    {itemId:"法宝id"}
 * @returns ds.ExUserData
 */
a_talisman_useTrumpItem : "a.tm.a"
,a_talisman_useTrumpItem_args : {
    itemId : "_0"//法宝id
}
,/**
 * 穿戴装备
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @returns ds.ExUserData
 */
a_talisman_wearTrump : "a.tm.b"
,a_talisman_wearTrump_args : {
    tempId : "_0"//英雄id
    ,trumpId : "_1"//法宝id
}
,/**
 * 法宝升级
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @returns ds.ExUserData
 */
a_talisman_upTrumpLvl : "a.tm.c"
,a_talisman_upTrumpLvl_args : {
    tempId : "_0"//英雄id
    ,trumpId : "_1"//法宝id
}
,/**
 * 法宝升星
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @returns ds.ExUserData
 */
a_talisman_upTrumpStar : "a.tm.d"
,a_talisman_upTrumpStar_args : {
    tempId : "_0"//英雄id
    ,trumpId : "_1"//法宝id
}
,/**
 * 英雄升星(英雄皮肤)
 * @args    {tempId:"英雄id"}
 * @returns ds.ExUserData
 */
a_talisman_upHeroStar : "a.tm.d1"
,a_talisman_upHeroStar_args : {
    tempId : "_0"//英雄id
}
,/**
 * 重铸法宝
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @returns ds.ExUserData
 */
a_talisman_recastTrump : "a.tm.e"
,a_talisman_recastTrump_args : {
    tempId : "_0"//英雄id
    ,trumpId : "_1"//法宝id
}
,/**
 * 法宝合成
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @returns ds.ExUserData
 */
a_talisman_compoundTrump : "a.tm.f"
,a_talisman_compoundTrump_args : {
    tempId : "_0"//英雄id
    ,trumpId : "_1"//法宝id
}
,/**
 * 法宝洗炼
 * @args    {tempId:"英雄id",trumpId:"法宝id",isCheck:"是否开启保险",baptizeNum:"次数"}
 * @returns ds.ExUserData
 */
a_talisman_baptizeTrump : "a.tm.g"
,a_talisman_baptizeTrump_args : {
    tempId : "_0"//英雄id
    ,trumpId : "_1"//法宝id
    ,isCheck : "_2"//是否开启保险
    ,baptizeNum : "_3"//次数
}
,/**
 * 确认洗炼 已废弃
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @returns ds.ExUserData
 */
a_talisman_confirmBaptizeTrump : "a.tm.h"
,a_talisman_confirmBaptizeTrump_args : {
    tempId : "_0"//英雄id
    ,trumpId : "_1"//法宝id
}
,/**
 * 取消洗炼 已废弃
 * @args    {tempId:"英雄id",trumpId:"法宝id"}
 * @returns ds.ExUserData
 */
a_talisman_cancelBaptizeTrump : "a.tm.i"
,a_talisman_cancelBaptizeTrump_args : {
    tempId : "_0"//英雄id
    ,trumpId : "_1"//法宝id
}
,/**
 * 更新法宝总战力
 * @args    {tempId:"英雄id", combat:"法宝总战力"}
 */
a_talisman_updateCombat : "a.tm.j"
,a_talisman_updateCombat_args : {
    tempId : "_0"//英雄id
    ,combat : "_1"//法宝总战力
}
,/**
 * 亲密升级
 * @args  {tempId:"英雄配置文件id"}
 * @return ds.ExUserData()
 */
a_talisman_giveGiftToHero : "a.tm.k"
,a_talisman_giveGiftToHero_args : {
    tempId : "_0"//英雄配置文件id
}
,/**
 * 激活永恒羁绊
 * @args  {tempId:"英雄配置文件id"}
 * @return ds.ExUserData()
 */
a_talisman_activeForever : "a.tm.l"
,a_talisman_activeForever_args : {
    tempId : "_0"//英雄配置文件id
}
,/**
 * 宠物合成
 * @args  {trumpId1:"消耗宠物1",trumpId2:"消耗宠物2"}
 * @return ds.ExUserData()
 */
a_talisman_talismanConpound : "a.tm.m"
,a_talisman_talismanConpound_args : {
    trumpId1 : "_0"//消耗宠物1
    ,trumpId2 : "_1"//消耗宠物2
}
,/**
 * 获得雇佣数据
 * @args
 */
a_employ_getInfo : "a.ep.a"
,/**
 * 雇佣
 * @args {idx:"雇佣位置"}
 */
a_employ_employ : "a.ep.b"
,a_employ_employ_args : {
    idx : "_0"//雇佣位置
}
,/**
 * 刷新雇佣列表
 * @args 
 */
a_employ_refresh : "a.ep.c"
,/**
 * 减少探索时间
 * @args 
 */
a_employ_reduceCD : "a.ep.d"
,/**
 * 点击领取奖励信息
 * @args {idx:"奖励索引"}
 */
a_employ_reward : "a.ep.e"
,a_employ_reward_args : {
    idx : "_0"//奖励索引
}
,/**
 * 雇佣完成额外奖励
 * @args
 */
a_employ_getExtItems : "a.ep.e2"
,/**
 * 探索失败，领取失败奖励
 * @args 
 */
a_employ_feedback : "a.ep.f"
,/**
 * 获得雇佣奖励记录
 * @args  {type:"记录类型"}
 */
a_employ_getRewardHistory : "a.ep.g"
,a_employ_getRewardHistory_args : {
    type : "_0"//记录类型
}
,/**
 * 验证常规登录,成功返回null
 * @args {accountId:"账号id",loginKey:"登录key",serverIndexId:"登录key"}
 */
c_account_enterGame : "c.a.a"
,c_account_enterGame_args : {
    accountId : "_0"//账号id
    ,loginKey : "_1"//登录key
    ,serverIndexId : "_2"//登录key
}
,/**
 * 创建用户
 * @args {name:"名字",heroTempId:"模板id ",sex:"性别 ",serverIndexId:"登录key",shareKey:"可能的分红模块的分享key", loginKey:"", accountId:""}
 * @returns ds.ExUserData
 */
c_account_createUser : "c.a.b"
,c_account_createUser_args : {
    name : "_0"//名字
    ,heroTempId : "_1"//模板id 
    ,sex : "_2"//性别 
    ,serverIndexId : "_3"//登录key
    ,shareKey : "_4"//可能的分红模块的分享key
    ,loginKey : "_5"//
    ,accountId : "_6"//
}
,/**
 * 获取第三方用户信息
 * @args {}
 * @isWorker 1
 */
c_account_getThirdUserInfo : "c.a.hda"
,/**
 * 链接
 * @args
 */
c_net_connect : "c.n.a"
,/**
 * 断开链接
 * @args {sessionId:" sessionId"}
 */
c_net_disconnect : "c.n.b"
,c_net_disconnect_args : {
    sessionId : "_0"// sessionId
}
,/**
 * 获取服务器当前时间
 * @args
 */
c_net_getServerDate : "c.n.c"
,/**
 * 预加载
 * @args
 */
c_net_preLoad : "c.n.d"
,/**
 * 验证常规登录,成功返回null
 * @args {name:"用户名",pwd:"密码",channelId:"渠道id"}
 */
h_account_login : "h.a.a"
,h_account_login_args : {
    name : "_0"//用户名
    ,pwd : "_1"//密码
    ,channelId : "_2"//渠道id
}
,/**
 * 验证sdk平台登陆,成功返回null
 * sdkData的数据说明：
 * egret: [token,login_type]
 * xiaomi: [uid,sessionId]
 * @args {channelId:"渠道号id",sdkData:"sdk的数据，是一个数组[]",deviceId:"机器码"}
 */
h_account_loginBySdk : "h.a.a1"
,h_account_loginBySdk_args : {
    channelId : "_0"//渠道号id
    ,sdkData : "_1"//sdk的数据，是一个数组[]
    ,deviceId : "_2"//机器码
}
,/**
 * 注册账号
 * @args {name:"账号",pwd:"密码", channelId:"渠道号id",deviceId:"机器码"}
 */
h_account_register : "h.a.c"
,h_account_register_args : {
    name : "_0"//账号
    ,pwd : "_1"//密码
    ,channelId : "_2"//渠道号id
    ,deviceId : "_3"//机器码
}
,/**
 * 获取一条新的公告
 * @args
 * @returns ds.NoticeEntity
 */
h_notice_getNewOne : "h.nc.a"
,/**
 * 获取公告列表
 * @args
 * @returns ds.NoticeEntity
 */
h_notice_getList : "h.nc.b"
,/**
 * 获取所有服务器列表
 * @args {isTest:"是否测试"}
 * @returns [ServerInfoEntity..]
 */
h_serverInfo_getServerList : "h.s.a"
,h_serverInfo_getServerList_args : {
    isTest : "_0"//是否测试
}
,/**
 * 获取服务器实例数据
 * @args {id:"服务器id"}
 * @returns ServerInfoEntity
 */
h_serverInfo_getServerInfo : "h.s.c"
,h_serverInfo_getServerInfo_args : {
    id : "_0"//服务器id
}
,/**
 * 获取服务器当前时间
 * @args
 */
h_serverInfo_getServerDate : "h.s.e"
,/**
 * 获取拥有角色的服务器
 * @args {accountId:"账号id"}
 * @returns [ServerInfoEntity..]
 */
h_serverInfo_getUserServers : "h.s.f"
,h_serverInfo_getUserServers_args : {
    accountId : "_0"//账号id
}
,/**
 * 获取账户服务器信息
 * @args {openId:"openId",appId:"wanba",isTest:"1"}
 * @returns [ds.AccountServer]
 */
h_serverInfo_getaccountServers : "h.s.g"
,h_serverInfo_getaccountServers_args : {
    openId : "_0"//openId
    ,appId : "_1"//wanba
    ,isTest : "_2"//1
}
,/**
 * 获取BI渠道配置表
 * @args 
 * @returns [ds.AccountServer]
 */
h_serverInfo_getChannelConfig : "h.s.h0"
,/**
 * 获取最新客服系统聊天记录
 * @args {lastId:"最后一条的唯一id",openId:"openId"}
 * @returns ds.ChatData
 */
h_kefu_getList : "h.cs.hda"
,h_kefu_getList_args : {
    lastId : "_0"//最后一条的唯一id
    ,openId : "_1"//openId
}
,/**
 * 发送客服聊天记录聊天
 * @args {lastId:"最后一条的唯一id",content:"聊天内容",openId:"openId",nickname:"nickname",vipLevel:"vip_level"}
 * @returns ds.ChatData
 */
h_kefu_sendData : "h.cs.hdb"
,h_kefu_sendData_args : {
    lastId : "_0"//最后一条的唯一id
    ,content : "_1"//聊天内容
    ,openId : "_2"//openId
    ,nickname : "_3"//nickname
    ,vipLevel : "_4"//vip_level
}
,/**
 * 获取缓存信息
 * @args
 * @returns 缓存信息
 */
admin_guild_getCache : "admin.guild.a"
,/**
 * 获取某个行会数据
 * @args {id:"id"}
 * @returns 缓存信息
 */
admin_guild_getGuildById : "admin.guild.b"
,admin_guild_getGuildById_args : {
    id : "_0"//id
}
,/**
 * 修改某个公会内存值
 * @args {id:"id",data:"数据内容"}
 * @returns
 */
admin_guild_updateCache : "admin.guild.c"
,admin_guild_updateCache_args : {
    id : "_0"//id
    ,data : "_1"//数据内容
}
,/**
 * 获取僵尸公会
 * @args
 * @returns
 */
admin_guild_getZombieGuild : "admin.guild.d"
,/**
 * 清除僵尸公会
 * @args {id:"id",data:"[[],[],[],...]"}
 * @returns
 */
admin_guild_clearZombieGuild : "admin.guild.e"
,admin_guild_clearZombieGuild_args : {
    id : "_0"//id
    ,data : "_1"//[[],[],[],...]
}
,/**
 * 会长弹劾
 * @args
 * @returns
 */
admin_guild_chairmanImpeach : "admin.guild.f"
,/**
 * 获取boss缓存信息
 * @args {bossId:"bossId"}
 * @returns 缓存信息
 */
admin_boss_getBossData : "admin.boss.a"
,admin_boss_getBossData_args : {
    bossId : "_0"//bossId
}
,/**
 * 获取用户缓存信息
 * @args {bossId:"bossId"}
 * @returns 缓存信息
 */
admin_boss_getUserCache : "admin.boss.a1"
,admin_boss_getUserCache_args : {
    bossId : "_0"//bossId
}
,/**
 * 获取某个用户数据
 * @args {id:"id"}
 * @returns 缓存信息
 */
admin_boss_getGuildById : "admin.boss.a2"
,admin_boss_getGuildById_args : {
    id : "_0"//id
}
,/**
 * 更新boss缓存
 * @args {data:"[[key,value],[key,value]]"}
 * @returns
 */
admin_boss_updateBossCache : "admin.boss.b"
,admin_boss_updateBossCache_args : {
    data : "_0"//[[key,value],[key,value]]
}
,/**
 * 更新某个用户数据
 * @args {id:"id",data:"[[key,value],[key,value]]"}
 * @returns
 */
admin_boss_updateUserCache : "admin.boss.c"
,admin_boss_updateUserCache_args : {
    id : "_0"//id
    ,data : "_1"//[[key,value],[key,value]]
}
,/**
 * ·¢ËÍ¿ç·þÏûÏ¢£¨Ð¡À®°È£©
 * @args {nickName:"",vip:"",content:"",isGM:"",guildName:"",medalTitle:"",isLittleHorn:"",achieveLvl:"",rebirthLvl:"",nobleLevel:"",userId:"",iconId:"",isPublic:"",type:"",sysMsgArgs:"",sysMsgId:""}
 * @returns [nickName]
 */
admin_chat_serversChat : "admin.chat.a"
,admin_chat_serversChat_args : {
    nickName : "_0"//
    ,vip : "_1"//
    ,content : "_2"//
    ,isGM : "_3"//
    ,guildName : "_4"//
    ,medalTitle : "_5"//
    ,isLittleHorn : "_6"//
    ,achieveLvl : "_7"//
    ,rebirthLvl : "_8"//
    ,nobleLevel : "_9"//
    ,userId : "_10"//
    ,iconId : "_11"//
    ,isPublic : "_12"//
    ,type : "_13"//
    ,sysMsgArgs : "_14"//
    ,sysMsgId : "_15"//
}
,/**
 * @args {content:""}
 * @returns []
 */
admin_chat_GMCommand : "admin.chat.b"
,admin_chat_GMCommand_args : {
    content : "_0"//
}
,/**
 * @args {content:""}
 * @returns [nickName]
 */
admin_chat_Scripts : "admin.chat.c"
,admin_chat_Scripts_args : {
    content : "_0"//
}
,/**
 * 获取缓存信息
 * @args
 * @returns 缓存信息
 */
admin_treasure_getTreasureCash : "admin.treasure.a"
,/**
 * 获取玩家秘宝信息
 * @args
 * @returns 缓存信息
 */
admin_treasure_getTreasureByUserId : "admin.treasure.b"
,/**
 *
 * @args {userId:"123"}
 * @returns 缓存信息
 */
admin_treasure_setTreasureByUserId : "admin.treasure.c"
,admin_treasure_setTreasureByUserId_args : {
    userId : "_0"//123
}
,/**
 * 身份认证 (City)
 * @args {accountId:"账号id",loginKey:"登录key",serverIndexId:"登录Id"}
 * @returns 缓存信息
 */
admin_ws_authCity : "admin.ws.a"
,admin_ws_authCity_args : {
    accountId : "_0"//账号id
    ,loginKey : "_1"//登录key
    ,serverIndexId : "_2"//登录Id
}
,/**
 * 身份认证 (Battle)
 * @args {accountId:"账号id",loginKey:"登录key",serverIndexId:"登录Id"}
 * @returns 缓存信息
 */
admin_ws_authBattle : "admin.ws.a1"
,admin_ws_authBattle_args : {
    accountId : "_0"//账号id
    ,loginKey : "_1"//登录key
    ,serverIndexId : "_2"//登录Id
}
,/**
 * 获取玩家最新WsRoleData数据
 * @args {userId:"角色Id"}
 * @returns 缓存信息
 */
admin_ws_getWsRoleData : "admin.ws.a2"
,admin_ws_getWsRoleData_args : {
    userId : "_0"//角色Id
}
,/**
 * 获取玩家最新WsRoleData数据
 * @args {userId:"角色Id"}
 * @returns 缓存信息
 */
admin_ws_getWsBattleRoleData : "admin.ws.a3"
,admin_ws_getWsBattleRoleData_args : {
    userId : "_0"//角色Id
}
,/**
 * 获得服务器列表
 * @args
 * @returns 缓存信息
 */
admin_ws_serverList : "admin.ws.b"
,/**
 * 获得服务器信息
 * @args {serverId:"服务器Id"}
 * @returns serverData
 */
admin_ws_getServerInfo : "admin.ws.b1"
,admin_ws_getServerInfo_args : {
    serverId : "_0"//服务器Id
}
,/**
 * 获得服务器信息
 * @args {battleId:"战斗分组Id"}
 * @returns serverData
 */
admin_ws_getServerInfoByBattleId : "admin.ws.b2"
,admin_ws_getServerInfoByBattleId_args : {
    battleId : "_0"//战斗分组Id
}
,/**
 * 女神之光增加经验
 * @args {userId:"玩家id",sec:'时间'}
 * @returns 缓存信息
 */
admin_ws_addGodnessExp : "admin.ws.c"
,admin_ws_addGodnessExp_args : {
    userId : "_0"//玩家id
    ,sec : "_1"//时间
}
,/**
 * 拾取宝箱
 * @args  {userId:"用户id", chestId:"宝箱id", isOpen:"0 不开 1 开启"}
 * @returns 缓存信息
 */
admin_ws_addWChest : "admin.ws.d"
,admin_ws_addWChest_args : {
    userId : "_0"//用户id
    ,chestId : "_1"//宝箱id
    ,isOpen : "_2"//0 不开 1 开启
}
,/**
 * 玩家fakeRoleList列表
 * @args  {userId:"用户id", num:"用户数量"}
 * @returns 缓存信息
 */
admin_ws_fakeRoleList : "admin.ws.e"
,admin_ws_fakeRoleList_args : {
    userId : "_0"//用户id
    ,num : "_1"//用户数量
}
,/**
 * 通知用户获得物品(不加玩家数据，只供其他处理)
 * @args  {userId:"用户id", type:"获取途径", items:"获得物品", bossId:"bossId"}
 * @returns 缓存信息
 */
admin_ws_noticeAddItem : "admin.ws.f"
,admin_ws_noticeAddItem_args : {
    userId : "_0"//用户id
    ,type : "_1"//获取途径
    ,items : "_2"//获得物品
    ,bossId : "_3"//bossId
}
,/**
 * 通知用户击杀中立Boss/天命Boss
 * @args  {userId:"用户id", userName:"用户名", bossId:"bossId", type:"boss类型 14 中立 13 天命 16异界", isOwner:"0 不是归属 1 是归属"}
 * @returns 缓存信息
 */
admin_ws_killBoss : "admin.ws.g"
,admin_ws_killBoss_args : {
    userId : "_0"//用户id
    ,userName : "_1"//用户名
    ,bossId : "_2"//bossId
    ,type : "_3"//boss类型 14 中立 13 天命 16异界
    ,isOwner : "_4"//0 不是归属 1 是归属
}
,/**
 * 进入WBoss
 * @args  {userId:"用户id", bossId:"bossId", bossType:"bossType"}
 * @returns 缓存信息
 */
admin_ws_enterWBoss : "admin.ws.h"
,admin_ws_enterWBoss_args : {
    userId : "_0"//用户id
    ,bossId : "_1"//bossId
    ,bossType : "_2"//bossType
}
,/**
 * 获得玩家信息
 * @args  {userId:"用户id"}
 * @returns 缓存信息
 */
admin_ws_getUserInfo : "admin.ws.i"
,admin_ws_getUserInfo_args : {
    userId : "_0"//用户id
}
,/**
 * 通知公会战结果
 * @args  {gres:"结果数据", ures:""}
 * @returns
 */
admin_ws_guildBattleResult : "admin.ws.j"
,admin_ws_guildBattleResult_args : {
    gres : "_0"//结果数据
    ,ures : "_1"//
}
,/**
 * 获得公会战个人积分宝箱
 * @args  {userId:"uid",idx:"索引值"}
 * @returns
 */
admin_ws_getPReward : "admin.ws.k"
,admin_ws_getPReward_args : {
    userId : "_0"//uid
    ,idx : "_1"//索引值
}
,/**
 * 获得公会战战力前8的公会
 * @args
 * @returns
 */
admin_ws_getGuildCombatRank8 : "admin.ws.l"
,/**
 * 玩家参加女神之关(一次活动只通知一次)
 * @args  {userId:"用户id"}
 * @returns 缓存信息
 */
admin_ws_enterGodness : "admin.ws.m"
,admin_ws_enterGodness_args : {
    userId : "_0"//用户id
}
,/**
 * 幻境boss增加次数 
 * @args {userId:"用户id", bossId:"bossId", groupType:"boss组别", type:"类型 1  幻境boss增加归属 2 幻境boss增加夺宝"}
 * @returns
 */
admin_ws_addHJBossNum : "admin.ws.n"
,admin_ws_addHJBossNum_args : {
    userId : "_0"//用户id
    ,bossId : "_1"//bossId
    ,groupType : "_2"//boss组别
    ,type : "_3"//类型 1  幻境boss增加归属 2 幻境boss增加夺宝
}
,/**
 * 增加邮件
 * @args {e:"事件", mailList:"邮件列表"}
 * @returns
 */
admin_ws_addMails : "admin.ws.o"
,admin_ws_addMails_args : {
    e : "_0"//事件
    ,mailList : "_1"//邮件列表
}
,/**
 * 世界boss 钥匙掉落
 * @args  {userId:"用户id", bossId:"世界bossId", type:"0 幸运奖 1 最终幸运奖"}
 * @returns 缓存信息
 */
admin_ws_addWorldLuckyAward : "admin.ws.p"
,admin_ws_addWorldLuckyAward_args : {
    userId : "_0"//用户id
    ,bossId : "_1"//世界bossId
    ,type : "_2"//0 幸运奖 1 最终幸运奖
}
,/**
 * 世界boss鼓舞
 * @args  {userId:"用户id", bossId:"世界bossId"}
 * @returns 缓存信息
 */
admin_ws_inspire : "admin.ws.q"
,admin_ws_inspire_args : {
    userId : "_0"//用户id
    ,bossId : "_1"//世界bossId
}
,/**
 * 世界boss伤害值
 * @args  {userId:"用户id", hurt:"伤害值"}
 * @returns 缓存信息
 */
admin_ws_wbHurt : "admin.ws.r"
,admin_ws_wbHurt_args : {
    userId : "_0"//用户id
    ,hurt : "_1"//伤害值
}
,/**
 * 世界boss 个人奖励
 * @args  {userId:"用户id", bossId:"世界bossId", rank:"排名值 从0开始"}
 * @returns 缓存信息
 */
admin_ws_wbPersonAward : "admin.ws.s"
,admin_ws_wbPersonAward_args : {
    userId : "_0"//用户id
    ,bossId : "_1"//世界bossId
    ,rank : "_2"//排名值 从0开始
}
,/**
 * 世界boss 公会奖励
 * @args  {guildId:"公会id", bossId:"世界bossId", rank:"排名值 从0开始"}
 * @returns 缓存信息
 */
admin_ws_wbGuildAward : "admin.ws.s1"
,admin_ws_wbGuildAward_args : {
    guildId : "_0"//公会id
    ,bossId : "_1"//世界bossId
    ,rank : "_2"//排名值 从0开始
}
,/**
 * 世界boss 最后一击奖励
 * @args  {userId:"用户id", bossId:"世界bossId"}
 * @returns 缓存信息
 */
admin_ws_wbLastShotAward : "admin.ws.s2"
,admin_ws_wbLastShotAward_args : {
    userId : "_0"//用户id
    ,bossId : "_1"//世界bossId
}
,/**
 * 世界boss商店购买物品
 * @args  {userId:"用户id", bossId:"bossId", goodsId:"商品id"}
 * @returns 缓存信息
 */
admin_ws_wbShopBuy : "admin.ws.t"
,admin_ws_wbShopBuy_args : {
    userId : "_0"//用户id
    ,bossId : "_1"//bossId
    ,goodsId : "_2"//商品id
}
,/**
 * 世界boss战斗结果
 * @args  {battleId:"战斗ID", bossId:"bossId", resultData:"战斗结果"}
 * @returns 缓存信息
 */
admin_ws_wbBattleResult : "admin.ws.u"
,admin_ws_wbBattleResult_args : {
    battleId : "_0"//战斗ID
    ,bossId : "_1"//bossId
    ,resultData : "_2"//战斗结果
}
,/**
 * 修改玩家数据
 * @args {data:"接口内容"}
 * @returns 缓存信息
 */
admin_gm_gmCommand : "admin.gm.a"
,admin_gm_gmCommand_args : {
    data : "_0"//接口内容
}
,/**
 * 修改公会会长
 * @args {data:"接口内容"}
 * @returns 缓存信息
 */
admin_gm_setGuildChairman : "admin.gm.a1"
,admin_gm_setGuildChairman_args : {
    data : "_0"//接口内容
}
,/**
 * 重载当前最新公会战战斗数据
 * @args  
 * @returns 缓存信息
 */
admin_gm_reloadGB : "admin.gm.b"
,/**
 * 重载当前最新公会战战斗数据
 * @args  
 * @returns 缓存信息
 */
admin_gm_sendAwardGB : "admin.gm.c"
};