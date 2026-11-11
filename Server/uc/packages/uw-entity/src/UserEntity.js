/**
游戏-角色(UserEntity)
角色，账号进入到每个服中扮演的角色。
**/
var _Class = module.exports = function(){
    /** 账号id **/
    this.accountId = 0;/*账号id*/
    /** 头像 **/
    this.iconId = null;/**/
    /** 昵称 **/
    this.nickName = null;/*昵称*/
    /** 金币 **/
    this.gold = 0;/*金币*/
    /** 总钻石 **/
    this.diamond = 0;/*钻石*/
    /** 序号 **/
    this.id = null;/*序号*/
    /** 绑定钻石 **/
    this.giveDiamond = 0;/*绑定钻石，即送的钻石*/
    /** 非绑定钻石 **/
    this.buyDiamond = 0;/*非绑定钻石，即购买的钻石*/
    /** 等级 **/
    this.lvl = 0;/*等级(不同于英雄等级)*/
    /** 经验 **/
    this.expc = 0;/*经验*/
    /** 战力 **/
    this.combat = 0;/*战力*/
    /** VIP等级 **/
    this.vip = 0;/*VIP等级*/
    /** VIP积分 **/
    this.vipScore = 0;/*VIP积分*/
    /** 登录天数 **/
    this.loginDays = 0;/*登录天数[登录时间戳,登录时间戳]*/
    /** 体力 **/
    this.strength = 0;/**/
    /** 上次恢复体力时间 **/
    this.strengthReTime = null;/**/
    /** 签名 **/
    this.signName = null;/*签名*/
    /** 荣誉值 **/
    this.honor = 0;/*荣誉值*/
    /** 背包（只存放静态物品） **/
    this.bag = null;/*背包(只存放静态物品，格式：{&quot;物品id&quot;:数量,&quot;物品id&quot;:数量.............})*/
    /** 装备背包 **/
    this.equipBag = null;/*装备背包 {&quot;1&quot;:[物品id,[随到的属性值],评价,是否穿戴,name,[基础属性],锁定状态]
,...}  &quot;1&quot;:指定id,累加上去的*/
    /** 装备背包购买次数 **/
    this.equipBagBuyCount = 0;/*装备背包格数*/
    /** 成就数据 **/
    this.honorData = null;/*成就数据
{&quot;id&quot;:[是否完成，是否领取],&quot;id&quot;:[是否完成，是否领取],..........}*/
    /** 蓝钻标记 **/
    this.blueDiamond = null;/*蓝钻标记，为一个对象，key为dsConsts.BlueDiamond中的定义*/
    /** 签到数据 **/
    this.sign = null;/*签到数据,[签到次数,最近一次签到时间]*/
    /** 活动数据 **/
    this.activity = null;/*{&quot;活动id&quot;:数据}
数据格式：
首充:[领取次数]，
七天登陆：[次数,次数...]
每日限购:[[次数,时间],[次数,时间]..........]
每日累充:[领取时间,领取时间,..........]
全部累充:[次数,次数..........]
每日消费:[领取时间,领取时间,..........]
全部消费:[次数,次数..........]
领主升级:[次数,次数..........]
&quot;-7&quot;:[登陆次数] 7天登陆的数据
时间段限购:[次数,次数..........]*/
    /** 记录数据 **/
    this.record = null;/*记录数据*/
    /** 扩展数据 **/
    this.exData = null;/*刷新数据
{key:value}
具体看c_prop的userExData*/
    /** 今日次数列表 **/
    this.counts = null;/*今日次数列表，是一个数组，对应各自系统的次数。*/
    /** 今日次数列表刷新时间 **/
    this.countsRefreshTime = null;/*今日次数列表刷新时间【】数组对应下标*/
    /** 最后更新时间 **/
    this.lastUpdateTime = null;/*更新时间*/
    /** 服务器 **/
    this.serverId = null;/**/
    /** 最后点技能时间 **/
    this.lastSkillTime = null;/*最后点技能时间*/
    /** 技能CD **/
    this.skillCd = 0;/*技能CD(秒)*/
    /** 是否开启野外pk **/
    this.isOpenPk = 0;/*是否开启野外pk*/
    /** 声望 **/
    this.prestige = 0;/*声望*/
    /** 红点数据 **/
    this.redPointData = null;/*红点数据*/
    /** 机器人id **/
    this.robotId = 0;/*机器人id*/
    /** 创建时间 **/
    this.createTime = null;/*创建时间*/
    /** sdk渠道号 **/
    this.sdkChannelId = null;/*sdk渠道号*/
    /** 服务器索引 **/
    this.serverIndexId = 0;/*服务器索引*/
    /** 在线掉落数据 **/
    this.onlineLootData = null;/*在线掉落数据[每秒经验,每秒金币,每波怪多少秒,是否统计];*/
    /** 是否是霸主 **/
    this.isKing = 0;/*是否是霸主*/
    /** 转生等级 **/
    this.rebirthLvl = 0;/**/
    /** 转生经验 **/
    this.rebirthExp = 0;/**/
    /** 国库累计积分 **/
    this.coffersPoints = 0;/*国库累计积分*/
    /** 国库今日积分 **/
    this.todayCoffersPoints = 0;/*国库今日积分*/
    /** 勋章称号 **/
    this.medalTitle = null;/**/
    /** 勋章数据 **/
    this.medalData = null;/*{勋章id:[勋章强化等级表id],勋章id:[勋章强化等级表id],...}*/
    /** 真气 **/
    this.genuineQi = 0;/*真气*/
    /** 属性数据 **/
    this.propertyData = null;/*{id:数据,id:数据,...}*/
    /** 国库杀人数 **/
    this.coffersKillNum = 0;/*国库杀人数*/
    /** 是否开启注入 **/
    this.isOpenIn = 0;/*是否开启注入*/
    /** 注入经验 **/
    this.infuseExpc = 0;/*注入经验*/
    /** 通天塔最高层数 **/
    this.highPaTa = 0;/*通天塔最高层数*/
    /** 拥有英雄数据 **/
    this.heroData = null;/*{英雄id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...},英雄获得时间,亲密度等级,是否激活羁绊],,,,}*/
    /** 勋章扩展数据 **/
    this.medalExData = null;/*勋章扩展数据 [成就类型:成就数据]*/
    /** 勋章完成数据 **/
    this.medalDoneData = null;/*勋章完成数据 [id1,id2..]*/
    /** buff数据 **/
    this.buff = null;/*玩家buff数据，格式 {buffid:到期时间, buffid:到期时间 ... }*/
    /** 雇佣数据 **/
    this.employData = null;/*雇佣数据 {eplist:[{id:1,degree:1,duration:1,rate:1},{}],
	eper:{id:1,degree:1,duration:1,rate:1,openTime:1003234,diamond:11,gold:0,ret:{是否成功,[奖励列表],[已领取索引]}},
	refreshTime:11111}*/
    /** tap点击战力 **/
    this.tap = 0;/*tap点击战力*/
    /** 成就等级 **/
    this.achieveLvl = 0;/**/
    /** 成就经验 **/
    this.achieveExp = 0;/**/
    /** 胸章数量 **/
    this.medalNum = 0;/*胸章数量*/
    /** 次元壁等级 **/
    this.cybLvl = 1;/*次元壁等级*/
    /** 次元壁点数 **/
    this.cybExp = 0;/*次元壁点数*/
    /** 军衔等级 **/
    this.jxLvl = 1;/*军衔等级*/
    /** 军衔点数 **/
    this.jxExp = 0;/*军衔点数*/
    /** 英雄数目 **/
    this.heroNum = 0;/*英雄数目*/
    /** 奖杯 **/
    this.cup = null;/*奖杯等级*/
    /** 胶囊数据 **/
    this.capsuleData = null;/*{id:value,id:value}*/
    /** 贵族 **/
    this.noble = null;/*[消耗积分数，登录获得点数，是否激活，免费点数领取时间，{贵族等级:免费福利领取时间}，[对应购买贵族礼包ids], 每日首次登录时的贵族等级, 每日首次登录时间]*/
    /** 渠道id **/
    this.channelId = null;/*渠道id*/
    /** 魔导等级 **/
    this.magicLvl = null;/*魔导等级*/
    /** 精灵觉醒数据 **/
    this.elfWakingData = null;/*{&quot;精灵id&quot;:精灵觉醒等级id,….}*/
    /** 精灵觉醒现身id **/
    this.elfWakingAppear = null;/**/

};
_Class.tableName = 'uw_user';