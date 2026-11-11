/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-10-15
 * Time: 下午8:19
 * To change this template use File | Settings | File Templates.
 */
var proto = module.exports;

proto.session = {
    accountId : "s1",
    userId : "s2",
    serverId : "s3",
    areaId :"s4",
    ip :"s5",
    isGM :"s6",
    workerId:"s7",
    serverIndexId:"s8",
    ua:"s9"
};

/**
 * 钻石获得类型
 * @type {}
 */
proto.diamondGainType = {
    activity_1:101,//精彩活动-首冲
    activity_2:102,//精彩活动-7天登陆
    activity_3:103,//精彩活动-每日累充福利
    activity_4:104,//精彩活动-全部累充福利
    activity_5:105,//精彩活动-每日消费有礼
    activity_6:106,//精彩活动-全部消费有礼
    activity_7:107,//精彩活动-升级有奖
    activity_8:108,//精彩活动-兑换码
    arena_1:201,//竞技场-最高纪录奖励
    item_1:301,//物品-宝箱   《需要重构》
    task_1:401,//任务-主线
    task_2:402,//任务-日常
    recharge_1:501,//充值
    exchange_1:601,//兑换
    mail_1:701,//邮件-后台人工
    mail_2:702,//邮件-竞技场排行奖励
    mail_3:703,//邮件-竞技场幸运排行奖励
    sign_1:801,//签到
    tower_1:901//守卫塔-自动战斗宝箱
};

/**
 * 钻石消费类型
 * @type {}
 */
proto.diamondConsumeType = {
    activity_1:101,//精彩活动-限时抢购
    area_1:201,//竞技场-重置CD
    area_2:202,//竞技场-购买次数
    copy_1:301,//副本-扫荡
    copy_2:302,//副本-购买次数
    tower_1:401,//守卫塔-自动战斗
    shop_1:501,//商店-购买
    shop_2:502,//商店-刷新
    lottery_1:601,//抽奖
    user_1:701,//角色-购买体力
    user_2:702,//角色-购买技能点
    user_3:703,//角色-购买金币
    user_4:704,//角色-改名字
    user_5:705,//角色-购买副本次数
    user_6:706,//角色-购买入场劵
    user_7:707,//角色-清除技能CD
    equip_1:801,//装备-(一键锻造)
    friend_1:901//好友，邀请奖励
};

/**
 * 道具类型
 */
proto.itemLogicType = {
    gift:1,//物品
    expc:2,//经验
    res:3//资源
};

//培养类型
proto.trainType = {
    normal:0,//普通
    specify1:1,
    specify2:2
};


proto.pomeloOnKey = {
    sysMsg:"a"
};

/**
 *竞技场幸运排名类型
 */
proto.arenaLuckRankType = {
    pass:0,//过去
    today:1,//今天
    yesterday:2//昨日
};

/**
 * 抽奖类型
 * @type {{gold: number, diamond: number, vip: number}}
 */
proto.lotteryType = {
    gold:1,//金币
    diamond:2, //钻石
    vip:3 //vip
};
/**
 * 抽奖物品类型
 * @type {{item: number, hero: number}}
 */
proto.lotteryItemType ={
    item:0,//物品
    hero:1//英雄
};

proto.MATRIX_TYPE_MAP = {
    1 : "pos",
    2 : "posArenaD",
    3 : "posArenaA",
    4 : "posMirrorD",
    5 : "posMirrorA",
    6 : "posTower",
    7 : "posTrial"
};

/**
 * 试炼类型
 * @type {{ONE: number, SECOND: number, THREE: number}}
 */
proto.trialType = {
    ONE: 0, //试炼1
    SECOND: 1,//试炼2
    THREE: 2//试炼3
};

proto.accountStatus = {
   ok:0,//正常
   lock:1,//普通封号
   lockDevice:2, //设备封号
   test:3, //测试账号
   gm:4 //GM账号
};

//用户扩展数据类型
proto.accountExDataType = {
    userLvl:0, //用户等级
    friendList:1 //好友列表
};

//好友奖励值类型
proto.friendValueType = {
    strength:0,//赠送的体力
    invite:1  //邀请的奖励
};

//商品购买条件
proto.shopNeedType = {
    heroNum:1,  //小弟总数量
    payMoney:2,  //累计充值多少RMB都开启
    heroType:3,  //小弟类型数量
    combatEff:4,  //战斗力达到
    produceNum:5,  //金币生产速度达到
    userRank :6,  //段位达到等级
    userLvl:7  //召唤师等级
};

//购买商品对应属性
proto.addValueType = {
    attack:1,  //提升攻击
    defence:2,  //提升防御
    hp:3,  //提升血量
    crit:4,  //提升暴击
    produceFix:5,  //提升金币生产速度
    producePer :6,  //提升金币生产速度百分比
    copyWipeRate:7  //提升刷野倍率
};

//成就完成条件
proto.honorNeedType = {
    heroNum:1,  //小弟总数量
    produceNum:2,  //金币生产速度达到
    goldNum:3,  //获得的金币总量
    userLvl:4,  //召唤师等级
    heroType:5,  //小弟类型数量
    userRank :6,  //段位达到等级
    pkWinCount:7,  //排位赛胜利场次
    pkLoseCount:8,  //排位赛失败场次
    attack:9,  //攻击
    defence:10,  //防御
    hp:11,  //血量
    crit:12  //暴击
};

proto.localChannelId = 99999;

//技能目标类型
proto.skillTargetType = {
    self:1,//自己
    enemy:2 //敌人
};

//buff目标类型
proto.buffTargetType = {
    self:1,//自己
    enemy:2 //敌人
};

//胜利状态
proto.winStatus = {
    win: 1,//胜利
    lose: 2, //输
    bigWin: 3, //大胜
    smallWin: 4 //惨胜
};

//buff类型
proto.buffType = {
    freeze: 1,//冰冻
    poison: 2,//中毒
    replayHp: 3,//回血
    suckHp: 4,//吸血 以伤害最终伤害为基础
    addProp: 5,//提升属性
    delProp: 6,//降低属性
    seal: 9,//沉默
    stun: 10,//眩晕
    absHurt: 11,//护盾（抵挡伤害具体值）
    invincibility: 12,//无敌
    moveHurt: 13,//伤害转移
    reMAttack: 14,//魔免
    rePAttack: 15,//物免
    addSkillRate: 16,//增加技能触发概率
    delSkillRate: 17,//减少技能触发概率
    absHurtNum: 18,//护盾（抵挡次数）
    sunZi: 19,//嘲讽
    stealProp: 20,//属性偷取
    absorbHurt: 21,//吸收部分伤害
    count_release: 22,//伤害累计爆发
    bleed: 23,//流血
    sleep: 24,//昏睡
    rebound: 25,//反弹护盾
    stone: 26,//定身/石化
    strikeBack: 27,//反击
    revival: 28,//重生（复活，复活后血量百分比）
    clearPositive: 29,//清除敌方增益buff（个数）
    clearNegatice: 30,//清除友方减益buff（个数）
    attackAgain: 31//追击
};


//buff持续类型
proto.buffConType = {
    continue:1,
    interval:2
};

//buff效果类型
proto.buffEffectType = {
    attack:1,  //攻击
    defence:2,  //防御
    hp:3,  //血量
    crit:4  //暴击
};

//buff效果类型
proto.pkRoundStatus = {
    init:1,  //初始化
    fighting:2,  //战斗中
    over:3  //结束
};

//buff正负面类型
proto.buffSide = {
    none:0,//不能移除
    up:1,//正面
    down:2 //负面
};

/*1：普通随机类型
2：商店可购买类型
3：活动类型*/
//英雄获得类型
proto.heroGetType = {
    normal:1,
    shop:2,
    activity:3
};

//物品类型
proto.itemType = {
    hero:1,//英雄
    diamond:2,//钻石
    wipeItem:3,//挑战券
    producePer:4 //金币收益
};

//目标对象
proto.skillTargetObj = {
    random:1,//1随机
    group:2,//2群体
    f_cross:3,//3面前十字
    m_cross:4,//4中间十字
    b_cross:5,//5后方十字
    temp6:6,
    lastAttack:7,//7目标是你的对象
    self:8,//8自己
    all:9,//9所有人（除了自己）
    temp10:10,
    min_hp:11,//11最残血
    max_hp:12,//12最高血
    min_attack:13,//13最低攻
    max_attack:14,//14最高攻
    min_mDefence:15,//15最低魔防
    max_mDefence:16,//16最高魔法
    min_pDefence:17,//17最低护甲
    max_pDefence:18,//18最高护甲
    min_speed:19,//19最低速度
    max_speed:20//20最高速度
};

//目标对象位置
proto.skillTargetPos = {
    all: 0,//0所有
    front: 1,//1前排
    back: 2 //2后面
};

//技能攻击类型
proto.skillAttackType = {
    pAttack: 0,//物攻
    mAttack: 1,//魔攻
    other: 99 //其他
};

/**
 * 服务器状态
 */
proto.serverStatus = {
    closed:0,//维护
    good:1,//良好
    normal:2,//正常
    hot:3,//火爆
    notOpen:4//未开放
};

/**
 * boss状态
 * @type {{closed: number, open: number}}
 */
proto.bossStatus = {
    closed:0,
    open:1,
    prize:2//结算中
};

//worker消息类型
proto.workerMsgType = {
    request:0,//路由
    remote:1 //跨数据
};

//兑换码类型
proto.couponType = {
    once: 0,//一次
    noLimit:1//无限制
};