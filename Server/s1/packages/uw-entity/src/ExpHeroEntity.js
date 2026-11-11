/**
游戏-远征英雄备份(ExpHeroEntity)
游戏-远征英雄备份
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 用户id **/
    this.userId = 0;/*用户id*/
    /** 模板id **/
    this.tempId = 0;/*模板id*/
    /** 品阶 **/
    this.quality = 0;/*品阶*/
    /** 强化 **/
    this.intensifyArr = null;/*强化[等级,等级,...] 下标对应装备位置*/
    /** 星级 **/
    this.starArr = null;/*星级[星级,星级,...] 下标对应装备位置*/
    /** 宝石 **/
    this.gemArr = null;/*宝石[id,id,id,...]下标对应装备位置*/
    /** 翅膀 **/
    this.wingArr = null;/*翅膀[id,等级,星级,当前星经验,左翅强化等级,右翅强化等级]*/
    /** 经验 **/
    this.expc = 0;/*经验*/
    /** 等级 **/
    this.lvl = 0;/*等级*/
    /** 装备数据 **/
    this.equipData = null;/*{&quot;部位&quot;:物品id,....}*/
    /** 技能等级组 **/
    this.skillLvlArr = null;/*[技能1等级,技能2等级...]*/
    /** 最终属性组 **/
    this.propArr = null;/*最终属性组[值,值]*/
    /** 境界等级 **/
    this.realmLvl = 0;/*境界等级*/
    /** 境界符文组 **/
    this.realmArr = null;/*境界符文组  [0,1,2,3,4,5]*/
    /** 性别 **/
    this.sex = 1;/*性别 1:男 2:女*/
    /** 战斗力 **/
    this.combat = 0;/*战斗力*/
    /** 装备精炼 **/
    this.refineArr = null;/*装备精炼[等级,等级,...] 下标对应装备位置*/
    /** 升星突破 **/
    this.starTopArr = null;/*升星突破[升星突破重数,升星突破重数,...] 下标对应装备位置*/
    /** 法宝佩戴 **/
    this.talismanAdorn = null;/*法宝佩戴*/
    /** 法宝数据 **/
    this.talismanData = null;/*法宝数据{法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...},临时资质],法宝id:[等级,资质,星级,最高星级,{星级:技能id,星级:技能id,...},临时资质],....}*/
    /** 法宝共鸣 **/
    this.talismanFg = null;/*法宝共鸣{共鸣id:[0,1],共鸣id:[1,0],...}*/
    /** 翅膀总等级 **/
    this.wingSumLvl = null;/*翅膀等级*100+星数*/
    /** 宝石总等级 **/
    this.gemSumLvl = null;/*宝石总等级*/
    /** 境界总等级 **/
    this.realmSumLvl = null;/*境界等级 * 100 + 已装备个数*/
    /** 出战顺序 **/
    this.fightSort = null;/*出战顺序*/
    /** 元婴背包 **/
    this.soulArr = null;/*{&quot;元婴id&quot;:[物品id,剩余血量,今日是否有穿戴过]}*/
    /** 佩戴元婴 **/
    this.wearSoulId = null;/**/
    /** 记录时间 **/
    this.recordTime = null;/**/

};
_Class.tableName = 'uw_expedition_hero';