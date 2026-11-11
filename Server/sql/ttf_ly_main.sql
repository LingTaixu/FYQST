/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50726
Source Host           : :3306
Source Database       : ttf_ly_main

Target Server Type    : MYSQL
Target Server Version : 50726
File Encoding         : 65001

Date: 2020-03-31 01:27:59
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for chat_logs
-- ----------------------------
DROP TABLE IF EXISTS `chat_logs`;
CREATE TABLE `chat_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `accountId` int(11) NOT NULL,
  `account` varchar(64) NOT NULL DEFAULT '' COMMENT '账号',
  `nickName` varchar(50) NOT NULL DEFAULT '' COMMENT '角色名称',
  `serverId` int(11) NOT NULL DEFAULT '0',
  `type` int(11) NOT NULL DEFAULT '0',
  `content` varchar(255) NOT NULL DEFAULT '' COMMENT '消息内容',
  `chatTime` int(11) NOT NULL DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`serverId`,`userId`),
  KEY `idx_name` (`serverId`,`nickName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of chat_logs
-- ----------------------------

-- ----------------------------
-- Table structure for customer_chat_logs
-- ----------------------------
DROP TABLE IF EXISTS `customer_chat_logs`;
CREATE TABLE `customer_chat_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gamerole_id` int(11) NOT NULL DEFAULT '0' COMMENT 'gameroleid',
  `admin_id` int(11) NOT NULL DEFAULT '0' COMMENT '客服用户id',
  `nickname` varchar(100) NOT NULL DEFAULT '' COMMENT '角色名称',
  `game_id` int(11) NOT NULL DEFAULT '0',
  `area` varchar(64) NOT NULL DEFAULT '',
  `group` varchar(64) NOT NULL DEFAULT '',
  `role_id` varchar(255) NOT NULL DEFAULT '' COMMENT '角色id',
  `open_id` varchar(64) NOT NULL DEFAULT '',
  `vip_level` int(11) NOT NULL DEFAULT '0',
  `content` varchar(255) NOT NULL DEFAULT '' COMMENT '消息内容',
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_game_area_group_role` (`game_id`,`area`,`group`,`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of customer_chat_logs
-- ----------------------------

-- ----------------------------
-- Table structure for customer_game_roles
-- ----------------------------
DROP TABLE IF EXISTS `customer_game_roles`;
CREATE TABLE `customer_game_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL DEFAULT '0',
  `area` varchar(64) NOT NULL DEFAULT '',
  `group` varchar(64) NOT NULL DEFAULT '',
  `role_id` varchar(255) NOT NULL DEFAULT '' COMMENT '角色id',
  `open_id` varchar(64) NOT NULL DEFAULT '',
  `user_id` bigint(18) NOT NULL DEFAULT '0',
  `nickname` varchar(100) NOT NULL DEFAULT '' COMMENT '角色名称',
  `vip_level` int(11) NOT NULL DEFAULT '0' COMMENT 'vip等级',
  `status` int(11) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL,
  `updated` datetime NOT NULL,
  `solve_msg` text COMMENT '处理意见',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uql_game_area_group_role` (`game_id`,`area`,`group`,`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of customer_game_roles
-- ----------------------------

-- ----------------------------
-- Table structure for uw_activity_record
-- ----------------------------
DROP TABLE IF EXISTS `uw_activity_record`;
CREATE TABLE `uw_activity_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `userId` int(11) DEFAULT NULL COMMENT '用户id',
  `activityId` int(11) DEFAULT NULL COMMENT '活动id',
  `activityType` int(11) DEFAULT NULL COMMENT '活动类型',
  `userLvl` int(11) DEFAULT NULL COMMENT '用户等级',
  `userVip` int(11) DEFAULT NULL COMMENT '用户vip',
  `costDiamond` int(11) DEFAULT NULL COMMENT '消耗钻石数量',
  `getDiamond` int(11) DEFAULT NULL COMMENT '获取钻石数量',
  `joinCount` int(11) DEFAULT NULL COMMENT '参与活动次数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='游戏-活动记录';

-- ----------------------------
-- Records of uw_activity_record
-- ----------------------------

-- ----------------------------
-- Table structure for uw_battles_group
-- ----------------------------
DROP TABLE IF EXISTS `uw_battles_group`;
CREATE TABLE `uw_battles_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `type` int(11) NOT NULL COMMENT '分组类型',
  `name` varchar(100) DEFAULT NULL COMMENT '组名',
  `serverArr` text COMMENT '服务器组',
  `battleHost` varchar(32) DEFAULT NULL COMMENT 'battle服务地址',
  `battlePort` int(11) DEFAULT NULL COMMENT 'battle服务端口',
  `battleId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `battleId` (`battleId`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of uw_battles_group
-- ----------------------------
INSERT INTO `uw_battles_group` VALUES ('1', '1', '战斗1', '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]', '101.43.194.154', '9001', '1');
INSERT INTO `uw_battles_group` VALUES ('2', '1', '战斗2', '[21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40]', '101.43.194.154', '9002', '2');
INSERT INTO `uw_battles_group` VALUES ('3', '1', '战斗3', '[41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60]', '101.43.194.154', '9003', '3');
INSERT INTO `uw_battles_group` VALUES ('4', '1', '战斗4', '[61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80]', '101.43.194.154', '9004', '4');
INSERT INTO `uw_battles_group` VALUES ('5', '1', '战斗5', '[81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100]', '101.43.194.154', '9005', '5');
INSERT INTO `uw_battles_group` VALUES ('6', '1', '战斗6', '[101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120]', '101.43.194.154', '9006', '6');
INSERT INTO `uw_battles_group` VALUES ('7', '1', '战斗7', '[121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139]', '101.43.194.154', '9007', '7');
INSERT INTO `uw_battles_group` VALUES ('8', '1', '战斗8', '[140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155]', '101.43.194.154', '9008', '8');
INSERT INTO `uw_battles_group` VALUES ('9', '1', 'battle9', '[]', '101.43.194.154', '9009', '9');
INSERT INTO `uw_battles_group` VALUES ('10', '1', 'battle10', '[186,187,188,189,190]', '101.43.194.154', '9010', '10');
INSERT INTO `uw_battles_group` VALUES ('11', '1', 'battle11', '[191,192,193,194,195]', '101.43.194.154', '9011', '11');
INSERT INTO `uw_battles_group` VALUES ('12', '1', 'battle12', '[156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171]', '101.43.194.154', '9012', '12');
INSERT INTO `uw_battles_group` VALUES ('13', '1', 'battle13', '[231,232,233,234,235]', '101.43.194.154', '9013', '13');
INSERT INTO `uw_battles_group` VALUES ('14', '1', 'battle14', '[172,173,174,175,176,177,178,179,180,181,182,183,184,185]', '101.43.194.154', '9014', '14');
INSERT INTO `uw_battles_group` VALUES ('15', '1', 'battle15', '[196,197,198,199,200,201]', '101.43.194.154', '9015', '15');
INSERT INTO `uw_battles_group` VALUES ('16', '1', 'battle16', '[202,203,204,205]', '101.43.194.154', '9016', '16');
INSERT INTO `uw_battles_group` VALUES ('17', '1', 'battle17', '[206,207,208,209,210]', '101.43.194.154', '9017', '17');
INSERT INTO `uw_battles_group` VALUES ('18', '1', 'battle18', '[211,212,213,214,215]', '101.43.194.154', '9018', '18');
INSERT INTO `uw_battles_group` VALUES ('19', '1', 'battle19', '[216,217,218,219,220]', '101.43.194.154', '9019', '19');
INSERT INTO `uw_battles_group` VALUES ('20', '1', 'battle20', '[221,222,223,224,225]', '101.43.194.154', '9020', '20');
INSERT INTO `uw_battles_group` VALUES ('21', '1', '战斗21', '[226,227,228,229,230]', '101.43.194.154', '9021', '21');
INSERT INTO `uw_battles_group` VALUES ('22', '1', '战斗22', '[236,237,238,239,240]', '101.43.194.154', '9022', '22');
INSERT INTO `uw_battles_group` VALUES ('23', '1', '战斗23', '[241,242,243,244,245]', '101.43.194.154', '9023', '23');
INSERT INTO `uw_battles_group` VALUES ('24', '1', '战斗24', '[246,247,248,249,250]', '101.43.194.154', '9024', '24');
INSERT INTO `uw_battles_group` VALUES ('25', '1', '战斗25', '[251,252,253,254,255]', '101.43.194.154', '9025', '25');
INSERT INTO `uw_battles_group` VALUES ('26', '1', '战斗26', '[256,257,258,259,260]', '101.43.194.154', '9026', '26');
INSERT INTO `uw_battles_group` VALUES ('27', '1', '战斗27', '[261,262,263,264,265]', '101.43.194.154', '9027', '27');
INSERT INTO `uw_battles_group` VALUES ('28', '1', '战斗28', '[266,267,268,269,270]', '101.43.194.154', '9028', '28');

-- ----------------------------
-- Table structure for uw_channel_config
-- ----------------------------
DROP TABLE IF EXISTS `uw_channel_config`;
CREATE TABLE `uw_channel_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `channelId` int(11) DEFAULT NULL,
  `sdkChannelId` varchar(64) DEFAULT NULL COMMENT '子渠道id',
  `channelName` varchar(64) DEFAULT NULL COMMENT '渠道名称EN',
  `sdkChannelName` varchar(64) DEFAULT NULL COMMENT '子渠道名称EN',
  `channelDesc` varchar(128) DEFAULT NULL COMMENT '渠道名称等',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of uw_channel_config
-- ----------------------------
INSERT INTO `uw_channel_config` VALUES ('1', '10006', '301', 'soeasy', 'lianwifi', '万能钥匙');
INSERT INTO `uw_channel_config` VALUES ('2', '10006', '10220', 'soeasy', 'huawei', '华为H5');
INSERT INTO `uw_channel_config` VALUES ('3', '10006', '10233', 'soeasy', 'zx', '紫霞');
INSERT INTO `uw_channel_config` VALUES ('4', '10006', '10455', 'soeasy', 'ledong', '乐动');
INSERT INTO `uw_channel_config` VALUES ('5', '10006', '10582', 'soeasy', 'lyy', '天宇游');
INSERT INTO `uw_channel_config` VALUES ('6', '10006', '10454', 'soeasy', '8090', '8090');
INSERT INTO `uw_channel_config` VALUES ('7', '10006', '10726', 'soeasy', '7723', '7723');
INSERT INTO `uw_channel_config` VALUES ('8', '10006', '10260', 'soeasy', '265g', '265G');
INSERT INTO `uw_channel_config` VALUES ('9', '10006', '10636', 'soeasy', 'daka', '福礼惠（大咖游戏）');
INSERT INTO `uw_channel_config` VALUES ('10', '10006', '10271', 'soeasy', 'cdsc', '畅读书城');
INSERT INTO `uw_channel_config` VALUES ('11', '10006', '10263', 'soeasy', 'cczs', '虫虫助手');
INSERT INTO `uw_channel_config` VALUES ('12', '10006', '10605', 'soeasy', 'xmly', '喜马拉雅');
INSERT INTO `uw_channel_config` VALUES ('13', '10006', '10449', 'soeasy', 'qk', '趣酷');
INSERT INTO `uw_channel_config` VALUES ('14', '10006', '10386', 'soeasy', 'hjy', '欢聚游HJY');
INSERT INTO `uw_channel_config` VALUES ('15', '10006', '10358', 'soeasy', 'fh', '飞火');
INSERT INTO `uw_channel_config` VALUES ('16', '10006', '362', 'soeasy', 'hw', '火舞(阅玩)(欢趣)');
INSERT INTO `uw_channel_config` VALUES ('17', '10006', '10478', 'soeasy', 'lequ', '乐趣');
INSERT INTO `uw_channel_config` VALUES ('18', '10006', '10212', 'soeasy', 'xiao7', '小七手游');
INSERT INTO `uw_channel_config` VALUES ('19', '10006', '10410', 'soeasy', '07073', '07073游戏网');
INSERT INTO `uw_channel_config` VALUES ('20', '10006', '352', 'soeasy', 'sdw', '电魂（闪电玩）');
INSERT INTO `uw_channel_config` VALUES ('21', '10006', '10314', 'soeasy', '5144', '射阳形伊5144');
INSERT INTO `uw_channel_config` VALUES ('22', '10006', '10363', 'soeasy', '7724', '7724');
INSERT INTO `uw_channel_config` VALUES ('23', '10006', '381', 'soeasy', 'xmxx', '厦门仙侠/45451');
INSERT INTO `uw_channel_config` VALUES ('24', '10006', '10382', 'soeasy', '9g', '9G_h5');
INSERT INTO `uw_channel_config` VALUES ('25', '10006', '10465', 'soeasy', 'lhh ', '乐嗨嗨');
INSERT INTO `uw_channel_config` VALUES ('26', '10006', '310', 'soeasy', 'iqiyi', '爱奇艺');
INSERT INTO `uw_channel_config` VALUES ('27', '10006', '10531', 'soeasy', '4399', '4399');
INSERT INTO `uw_channel_config` VALUES ('28', '10006', '10209', 'soeasy', 'dangle', '当乐');
INSERT INTO `uw_channel_config` VALUES ('29', '10006', '406', 'soeasy', 'xyw', 'X游网');
INSERT INTO `uw_channel_config` VALUES ('30', '10006', '320', 'soeasy', 'qhei', '群黑游戏');
INSERT INTO `uw_channel_config` VALUES ('31', '10006', '328', 'soeasy', 'sina', '新浪');
INSERT INTO `uw_channel_config` VALUES ('32', '10006', '10215', 'soeasy', '4177', '4177');
INSERT INTO `uw_channel_config` VALUES ('33', '10006', '10214', 'soeasy', '333', '333游戏');
INSERT INTO `uw_channel_config` VALUES ('34', '10006', '10308', 'soeasy', 'ywyx', '阅文游戏中心');
INSERT INTO `uw_channel_config` VALUES ('35', '10006', '314', 'soeasy', 'budejie', '百思不得姐(168)');
INSERT INTO `uw_channel_config` VALUES ('36', '10006', '303', 'soeasy', '1758', '1758');
INSERT INTO `uw_channel_config` VALUES ('37', '10006', '315', 'soeasy', 'zm', '杭州掌盟');
INSERT INTO `uw_channel_config` VALUES ('38', '10006', '10535', 'soeasy', 'tt', 'TT游戏');
INSERT INTO `uw_channel_config` VALUES ('39', '10006', '10618', 'soeasy', '87', '87盒子');
INSERT INTO `uw_channel_config` VALUES ('40', '10006', '10729', 'soeasy', 'wf', '玩蜂');
INSERT INTO `uw_channel_config` VALUES ('41', '10006', '10724', 'soeasy', 'ymxk', '游民星空');
INSERT INTO `uw_channel_config` VALUES ('42', '10006', '10307', 'soeasy', '7k7k', '7k7k');
INSERT INTO `uw_channel_config` VALUES ('43', '10006', '10733', 'soeasy', 'ziyun', '紫云');
INSERT INTO `uw_channel_config` VALUES ('44', '10006', '10730', 'soeasy', 'orange', '橙子游戏');
INSERT INTO `uw_channel_config` VALUES ('45', '10006', '347', 'soeasy', 'hlr', '欢乐人');
INSERT INTO `uw_channel_config` VALUES ('46', '10006', '10225', 'soeasy', 'jyu', '鲸鱼游戏');
INSERT INTO `uw_channel_config` VALUES ('47', '10006', '10646', 'soeasy', 'gamefan', '游戏fan');
INSERT INTO `uw_channel_config` VALUES ('48', '10006', '10683', 'soeasy', 'zsyy', '中山优游');
INSERT INTO `uw_channel_config` VALUES ('49', '10006', '10734', 'soeasy', 'zhangyue', '掌阅');
INSERT INTO `uw_channel_config` VALUES ('50', '10006', '10739', 'soeasy', 'youxipa', '游戏葩');
INSERT INTO `uw_channel_config` VALUES ('51', '10006', '10602', 'soeasy', 'tcy', '同城游');
INSERT INTO `uw_channel_config` VALUES ('52', '10006', '10368', 'soeasy', 'haoy', '昊游互娱');
INSERT INTO `uw_channel_config` VALUES ('53', '10006', '10222', 'soeasy', 'gouzai', '狗仔游戏');
INSERT INTO `uw_channel_config` VALUES ('54', '10006', '10280', 'soeasy', 'gzyx', '果子游戏');
INSERT INTO `uw_channel_config` VALUES ('55', '10006', '10334', 'soeasy', 'g765', 'g765');
INSERT INTO `uw_channel_config` VALUES ('56', '10006', '10255', 'soeasy', '511wan', '511wan');
INSERT INTO `uw_channel_config` VALUES ('57', '10006', '10660', 'soeasy', 'qimiao', '七淼互娱');
INSERT INTO `uw_channel_config` VALUES ('58', '10006', '10745', 'soeasy', 'ludashi', '鲁大师');
INSERT INTO `uw_channel_config` VALUES ('59', '10006', '10543', 'soeasy', '263wan', '微游吧(263wan)');
INSERT INTO `uw_channel_config` VALUES ('60', '10006', '351', 'soeasy', 'blw', '萝卜网络');
INSERT INTO `uw_channel_config` VALUES ('61', '10006', '316', 'soeasy', 'xhb', '小伙伴');
INSERT INTO `uw_channel_config` VALUES ('62', '10006', '326', 'soeasy', 'ximi', '小米');
INSERT INTO `uw_channel_config` VALUES ('63', '10006', '10380', 'soeasy', 'youwo', '上海游窝');
INSERT INTO `uw_channel_config` VALUES ('64', '10006', '10321', 'soeasy', 'niudao', '牛刀网络');
INSERT INTO `uw_channel_config` VALUES ('65', '10006', '348', 'soeasy', 'wyx', '微游戏');
INSERT INTO `uw_channel_config` VALUES ('66', '10006', '10748', 'soeasy', 'qwy ', '趣微游');
INSERT INTO `uw_channel_config` VALUES ('67', '10006', '345', 'soeasy', 'gamedog', '游戏狗');
INSERT INTO `uw_channel_config` VALUES ('68', '10006', '10347', 'soeasy', 'tsy', '淘手游');
INSERT INTO `uw_channel_config` VALUES ('69', '10006', '10590', 'soeasy', 'syj', '搜游记');
INSERT INTO `uw_channel_config` VALUES ('70', '10006', '386', 'soeasy', '16you', '16游');
INSERT INTO `uw_channel_config` VALUES ('71', '10006', '10395', 'soeasy', 'sdm', '3DM');
INSERT INTO `uw_channel_config` VALUES ('72', '10006', '10728', 'soeasy', 'aotian', '傲天游戏');
INSERT INTO `uw_channel_config` VALUES ('73', '10006', '10656', 'soeasy', 'yyshouyou', 'yy手游');
INSERT INTO `uw_channel_config` VALUES ('74', '10006', '10654', 'soeasy', 'yyyeyou', 'yy页游');
INSERT INTO `uw_channel_config` VALUES ('75', '10006', '10603', 'soeasy', 'santang', '三唐游戏');
INSERT INTO `uw_channel_config` VALUES ('76', '10006', '10422', 'soeasy', 'yilewan', '易乐玩');
INSERT INTO `uw_channel_config` VALUES ('77', '10006', '10712', 'soeasy', 'tengqu', '腾趣');
INSERT INTO `uw_channel_config` VALUES ('78', '10010', null, 'awy', null, '爱玩游');
INSERT INTO `uw_channel_config` VALUES ('79', '10011', null, 'limi', null, 'limi');
INSERT INTO `uw_channel_config` VALUES ('80', '10012', null, 'huawei', null, '华为');
INSERT INTO `uw_channel_config` VALUES ('81', '10006', '10614', 'soeasy', '9130', '9130');
INSERT INTO `uw_channel_config` VALUES ('82', '10006', '10492', 'soeasy', '360', '360');
INSERT INTO `uw_channel_config` VALUES ('83', '10006', '10775', 'soeasy', 'liutian', '六天网络');
INSERT INTO `uw_channel_config` VALUES ('84', '10006', '10392', 'soeasy', 'shuidi', '水滴');
INSERT INTO `uw_channel_config` VALUES ('85', '10006', '10776', 'soeasy', 'acfun', 'AcFun');
INSERT INTO `uw_channel_config` VALUES ('86', '10006', '10782', 'soeasy', 'songshu', '松鼠游戏');
INSERT INTO `uw_channel_config` VALUES ('87', '10006', '10780', 'soeasy', 'maimeng', '麦萌');
INSERT INTO `uw_channel_config` VALUES ('88', '10006', '10464', 'soeasy', '17wan', '17玩');
INSERT INTO `uw_channel_config` VALUES ('89', '10006', '10785', 'soeasy', 'zhongquan', '重拳游戏');
INSERT INTO `uw_channel_config` VALUES ('90', '10006', '10796', 'soeasy', 'youxia', '游侠网');
INSERT INTO `uw_channel_config` VALUES ('91', '10006', '10797', 'soeasy', 'dfmz', '东方明珠G');
INSERT INTO `uw_channel_config` VALUES ('92', '10014', '', 'hoolai_ios', '', '胡莱ios');
INSERT INTO `uw_channel_config` VALUES ('93', '10006', '10793', 'soeasy', 'ouwan', '偶玩');
INSERT INTO `uw_channel_config` VALUES ('94', '10006', '10812', 'soeasy', 'joyfun', 'joyfun');
INSERT INTO `uw_channel_config` VALUES ('95', '10006', '10566', 'soeasy', 'leyou', '乐游先锋');
INSERT INTO `uw_channel_config` VALUES ('96', '10006', '10823', 'soeasy', 'ty', '途游');
INSERT INTO `uw_channel_config` VALUES ('97', '10006', '10820', 'soeasy', '798wan', '798wan');
INSERT INTO `uw_channel_config` VALUES ('98', '10006', '10641', 'soeasy', 'jdcy', '京东彩娱');
INSERT INTO `uw_channel_config` VALUES ('99', '10006', '10825', 'soeasy', 'zhiyou', '致游');
INSERT INTO `uw_channel_config` VALUES ('100', '10006', '10830', 'soeasy', 'xyhb', '小游荷包');
INSERT INTO `uw_channel_config` VALUES ('101', '10006', '10802', 'soeasy', 'kuku', 'kuku');
INSERT INTO `uw_channel_config` VALUES ('102', '10006', '10667', 'soeasy', 'vivo', 'vivo');
INSERT INTO `uw_channel_config` VALUES ('103', '10006', '10647', 'soeasy', 'xuyang', '旭扬');
INSERT INTO `uw_channel_config` VALUES ('104', '10006', '10828', 'soeasy', 'yule', '渝乐');

-- ----------------------------
-- Table structure for uw_coupon
-- ----------------------------
DROP TABLE IF EXISTS `uw_coupon`;
CREATE TABLE `uw_coupon` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'åºå·',
  `userId` int(11) DEFAULT NULL COMMENT 'ä½¿ç”¨ç”¨æˆ·id',
  `name` varchar(20) DEFAULT NULL COMMENT 'åç§°',
  `content` varchar(200) DEFAULT NULL COMMENT 'æè¿°',
  `code` varchar(50) DEFAULT NULL COMMENT 'ç”Ÿæˆç ',
  `type` int(2) DEFAULT '0' COMMENT 'ç±»åž‹',
  `startTime` datetime DEFAULT NULL COMMENT 'ç”Ÿæ•ˆæ—¶é—´',
  `endTime` datetime DEFAULT NULL COMMENT 'æˆªæ­¢æ—¶é—´',
  `items` varchar(500) DEFAULT NULL COMMENT 'ç‰©å“',
  `channelId` int(11) DEFAULT NULL COMMENT 'æ¸ é“å·',
  `isUsed` int(2) DEFAULT '0' COMMENT 'æ˜¯å¦é¢†å–',
  `serverId` int(11) DEFAULT '0',
  `accountId` int(11) DEFAULT '0' COMMENT 'è´¦å·id',
  `channelIds` text COMMENT '渠道组',
  `isNew` int(2) DEFAULT '0' COMMENT '是否使用新兑换码机制',
  `period` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `uw_coupon_uid` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of uw_coupon
-- ----------------------------

-- ----------------------------
-- Table structure for uw_game_config
-- ----------------------------
DROP TABLE IF EXISTS `uw_game_config`;
CREATE TABLE `uw_game_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rankServerHost` varchar(50) DEFAULT NULL COMMENT '跨服排名服Host',
  `rankServerPort` int(6) DEFAULT '0' COMMENT '跨服排名服port',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='主-游戏配置(GameConfigEntity)';

-- ----------------------------
-- Records of uw_game_config
-- ----------------------------
INSERT INTO `uw_game_config` VALUES ('1', '114.67.103.84', '7010');

-- ----------------------------
-- Table structure for uw_guild_group
-- ----------------------------
DROP TABLE IF EXISTS `uw_guild_group`;
CREATE TABLE `uw_guild_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL COMMENT '组名',
  `serverArr` text COMMENT '服务器组',
  `lastRankData` mediumtext COMMENT '最后排行数据',
  `lastRankTime` datetime DEFAULT NULL,
  `redisId` int(6) DEFAULT '0' COMMENT '对应的redis序号',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='主-行会战分组(GuildGroupEntity)';

-- ----------------------------
-- Records of uw_guild_group
-- ----------------------------

-- ----------------------------
-- Table structure for uw_guild_war_sign
-- ----------------------------
DROP TABLE IF EXISTS `uw_guild_war_sign`;
CREATE TABLE `uw_guild_war_sign` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `serverId` int(11) DEFAULT '0' COMMENT 'æœåŠ¡å™¨id',
  `guildId` int(11) DEFAULT '0' COMMENT 'è¡Œä¼šid',
  `signTime` datetime DEFAULT NULL COMMENT 'æŠ¥åæ—¶é—´',
  `groupId` int(4) DEFAULT '0' COMMENT 'æŠ¥åç»„åˆ«',
  `signUserId` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `uw_guild_war_sign_serverid` (`serverId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='ä¸»-è¡Œä¼šæˆ˜æŠ¥å(GuildWarSignEntity)';

-- ----------------------------
-- Records of uw_guild_war_sign
-- ----------------------------

-- ----------------------------
-- Table structure for uw_invite
-- ----------------------------
DROP TABLE IF EXISTS `uw_invite`;
CREATE TABLE `uw_invite` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `inviterUid` varchar(64) DEFAULT NULL COMMENT '邀请者账号',
  `inviteeUids` text COMMENT '被邀请者账号',
  `num` int(11) DEFAULT '0' COMMENT '邀请数量',
  `rewards` varchar(128) DEFAULT NULL COMMENT '奖励领取记录',
  PRIMARY KEY (`id`),
  KEY `inviterUid` (`inviterUid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of uw_invite
-- ----------------------------

-- ----------------------------
-- Table structure for uw_invite_reward
-- ----------------------------
DROP TABLE IF EXISTS `uw_invite_reward`;
CREATE TABLE `uw_invite_reward` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `recordType` int(4) DEFAULT NULL COMMENT '记录类型',
  `account` varchar(64) DEFAULT NULL COMMENT '邀请者账号',
  `accountId` int(11) DEFAULT '0' COMMENT '邀请者账号ID',
  `userId` int(11) DEFAULT '0' COMMENT '邀请者角色ID',
  `nickName` varchar(48) DEFAULT NULL COMMENT '邀请者角色昵称',
  `items` varchar(128) DEFAULT NULL COMMENT '奖励物品',
  `recordTime` datetime DEFAULT NULL COMMENT '记录日期',
  PRIMARY KEY (`id`),
  KEY `accountId` (`accountId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of uw_invite_reward
-- ----------------------------

-- ----------------------------
-- Table structure for uw_loot_config
-- ----------------------------
DROP TABLE IF EXISTS `uw_loot_config`;
CREATE TABLE `uw_loot_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `startTime` datetime DEFAULT NULL COMMENT '开始时间',
  `endTime` datetime DEFAULT NULL COMMENT '结束时间',
  `lootTypeArr` varchar(500) DEFAULT NULL COMMENT '特殊掉落的物品类型',
  `notServerArr` varchar(600) DEFAULT NULL COMMENT '排除的服务器组',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='主-掉落配置';

-- ----------------------------
-- Records of uw_loot_config
-- ----------------------------

-- ----------------------------
-- Table structure for uw_notice
-- ----------------------------
DROP TABLE IF EXISTS `uw_notice`;
CREATE TABLE `uw_notice` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `title` varchar(50) DEFAULT NULL COMMENT '标题',
  `content` text COMMENT '内容',
  `serverIdArr` text COMMENT '服务器id组,[]长度为0时为全服',
  `isOpen` int(2) DEFAULT '0' COMMENT '是否开启,0：不开启，1：开启',
  `updateTime` datetime DEFAULT NULL COMMENT '更新时间',
  `iconType` int(2) DEFAULT '0' COMMENT 'icon类型',
  `noticeTime` datetime DEFAULT NULL COMMENT '公告时间',
  `startTime` datetime DEFAULT NULL COMMENT '开始时间',
  `endTime` datetime DEFAULT NULL COMMENT '结束时间',
  `sort` int(6) DEFAULT '0' COMMENT '排序',
  `exData` text COMMENT '公告额外信息',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='公告';

-- ----------------------------
-- Records of uw_notice
-- ----------------------------
INSERT INTO `uw_notice` VALUES (1, '活动开启公告', '亲爱的友友：\n\n欢迎来到二次元游戏绯雨骑士团~\n\n尽情体验游戏的快乐吧！', '["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59","60","61","62","63","64","65","66","67","68","69","70","71","72","73","74","75","76","77","78","79","80","81","82","83"]', 1, '0000-00-00 00:00:00', 3, '2018-07-06 00:00:00', '2018-07-06 00:00:00', '2019-08-06 00:00:00', 1, '');

-- ----------------------------
-- Table structure for uw_protocol_content
-- ----------------------------
DROP TABLE IF EXISTS `uw_protocol_content`;
CREATE TABLE `uw_protocol_content` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `content` text COMMENT '内容',
  `isOpen` int(2) DEFAULT '0' COMMENT '是否开启,0：不开启，1：开启',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='协议内容';

-- ----------------------------
-- Records of uw_protocol_content
-- ----------------------------

-- ----------------------------
-- Table structure for uw_public_activity
-- ----------------------------
DROP TABLE IF EXISTS `uw_public_activity`;
CREATE TABLE `uw_public_activity` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `title` varchar(50) DEFAULT NULL COMMENT '标题',
  `fullTitle` varchar(50) DEFAULT NULL COMMENT '标题全称',
  `type` int(2) DEFAULT '0' COMMENT '1:首冲;\n            2:7天登陆\n            3:限时抢购\n            4:每日累充福利\n            5:全部累充福利\n            6:每日消费有礼\n            7:全部消费有礼\n            8:升级有奖\n            9:兑换码\n            ',
  `iconType` int(2) DEFAULT '0' COMMENT 'icon类型',
  `tiIconType` int(2) DEFAULT '0' COMMENT '标题icon类型',
  `startTime` datetime DEFAULT NULL COMMENT '开始时间',
  `endTime` datetime DEFAULT NULL COMMENT '结束时间',
  `items` text COMMENT '{hero:{"id":num,..},diamond:100,wipeItem:100}',
  `randomHeroes` varchar(500) DEFAULT NULL COMMENT '[[种类数,总数]，.....]',
  `exValues` text COMMENT '首充:不需要\n            七天登陆:[英雄tid,........]\n            每日限购：[钻石数,........]\n            每日累冲：[钻石数,........]\n            全部累冲：[钻石数,........]\n            每日消费有礼：[钻石数,........]\n            全部消费有礼：[钻石数,........]\n            领主等级礼包：[领主等级,....]\n            兑换码：不需要',
  `exValues2` text COMMENT '每日限购：[限购数量,........]\n            时间段限购：[限购数量,........]',
  `exValues3` text COMMENT '每日限购：[几折,........]\n            时间段限购：[几折,........]',
  `content` text COMMENT '内容',
  `isOpen` int(2) DEFAULT '0' COMMENT '是否发布',
  `sort` int(11) DEFAULT '0' COMMENT '排序',
  `exData` text COMMENT '活动额外信息 {"1":"jchd"}',
  `templateId` int(11) DEFAULT '0' COMMENT '活动模板ID',
  `note` text COMMENT '备注',
  `isTemplate` int(2) DEFAULT '0' COMMENT '是否作为模板',
  `templateName` varchar(50) DEFAULT NULL COMMENT '模板名',
  `serverArr` text COMMENT '生效服务器',
  `isAnyTimeValid` int(2) DEFAULT '0' COMMENT '是否支持任意时间生效',
  PRIMARY KEY (`id`),
  KEY `uw_activity_isopen` (`isOpen`)
) ENGINE=InnoDB AUTO_INCREMENT=100036 DEFAULT CHARSET=utf8 COMMENT='主-游戏公共活动(PublicActivityEntity)';

-- ----------------------------
-- Records of uw_public_activity
-- ----------------------------
INSERT INTO `uw_public_activity` VALUES ('100000', '收集兑换', '灯神召唤', '30', '0', '0', '2019-01-12 00:00:00', '2020-02-12 00:00:00', '[\r\n{\"desc\":\"兑换活跃度*10\",\"needItems\":{\"100250\":1},\"getItems\":{\"1500302\":1},\"limitNum\":60},\r\n{\"desc\":\"兑换深渊魔石\",\"needItems\":{\"100251\":2},\"getItems\":{\"950\":8},\"limitNum\":999},\r\n{\"desc\":\"兑换黄金R宠蛋\",\"needItems\":{\"100251\":1,\"100250\":1},\"getItems\":{\"4008\":1},\"limitNum\":999},\r\n{\"desc\":\"兑换寂灭星魂宝箱\",\"needItems\":{\"100252\":4,\"100251\":6,\"100250\":8},\"getItems\":{\"2053\":1},\"limitNum\":10},\r\n{\"desc\":\"兑换史莱姆圣王\",\"needItems\":{\"100252\":3,\"100251\":4,\"100250\":5},\"getItems\":{\"122000\":1},\"limitNum\":5},\r\n\r\n\r\n{\"desc\":\"兑换3阶翅膀\",\"needItems\":{\"100252\":4,\"100251\":4,\"100250\":4},\"getItems\":{\"2034\":1},\"limitNum\":4},\r\n{\"desc\":\"兑换觉醒·贝露丹迪\",\"needItems\":{\"100252\":24,\"100251\":36,\"100250\":48},\"getItems\":{\"100244\":1},\"limitNum\":3},\r\n{\"desc\":\"兑换地结晶碎片\",\"needItems\":{\"100252\":1},\"getItems\":{\"3\":2},\"limitNum\":999},\r\n{\"desc\":\"兑换火结晶碎片\",\"needItems\":{\"100252\":1},\"getItems\":{\"6\":2},\"limitNum\":999},\r\n{\"desc\":\"兑换风结晶碎片\",\"needItems\":{\"100252\":1},\"getItems\":{\"5\":2},\"limitNum\":999},\r\n{\"desc\":\"兑换水结晶碎片\",\"needItems\":{\"100252\":1},\"getItems\":{\"4\":2},\"limitNum\":999}\r\n]', null, '', '', '', null, '0', '10', '{\"1\":\"ico_goddrop\",\"4\":\"shendeng_bg\",\"8\":30}', '0', '', '1', '灯神召唤兑换活动通用1', '1-3', '1');
INSERT INTO `uw_public_activity` VALUES ('100001', '收集兑换', '灯神召唤', '30', '0', '0', '2019-01-12 00:00:00', '2020-02-12 00:00:00', '[\r\n{\"desc\":\"兑换活跃度*10\",\"needItems\":{\"100250\":1},\"getItems\":{\"1500302\":1},\"limitNum\":60},\r\n{\"desc\":\"兑换深渊魔石\",\"needItems\":{\"100251\":2},\"getItems\":{\"950\":8},\"limitNum\":999},\r\n{\"desc\":\"兑换黄金R宠蛋\",\"needItems\":{\"100251\":1,\"100250\":1},\"getItems\":{\"4008\":1},\"limitNum\":999},\r\n{\"desc\":\"兑换SSR苏菲\",\"needItems\":{\"100252\":12,\"100251\":14,\"100250\":16},\"getItems\":{\"1000409\":1},\"limitNum\":1},\r\n{\"desc\":\"兑换S级人物果实\",\"needItems\":{\"100252\":15,\"100251\":21,\"100250\":28},\"getItems\":{\"5004\":1},\"limitNum\":3},\r\n{\"desc\":\"兑换A级人物果实\",\"needItems\":{\"100251\":10,\"100250\":15},\"getItems\":{\"5003\":1},\"limitNum\":5},\r\n\r\n\r\n{\"desc\":\"兑换觉醒·温蒂尔\",\"needItems\":{\"100252\":12,\"100251\":18,\"100250\":24},\"getItems\":{\"100243\":1},\"limitNum\":3},\r\n\r\n\r\n{\"desc\":\"兑换地结晶碎片\",\"needItems\":{\"100252\":1},\"getItems\":{\"3\":2},\"limitNum\":999},\r\n{\"desc\":\"兑换火结晶碎片\",\"needItems\":{\"100252\":1},\"getItems\":{\"6\":2},\"limitNum\":999},\r\n{\"desc\":\"兑换风结晶碎片\",\"needItems\":{\"100252\":1},\"getItems\":{\"5\":2},\"limitNum\":999},\r\n{\"desc\":\"兑换水结晶碎片\",\"needItems\":{\"100252\":1},\"getItems\":{\"4\":2},\"limitNum\":999}\r\n]', null, '', '', '', null, '0', '10', '{\"1\":\"ico_goddrop\",\"4\":\"shendeng_bg\",\"8\":30}', '0', '', '1', '灯神召唤兑换活动新人物苏菲', '1-3', '1');
INSERT INTO `uw_public_activity` VALUES ('100002', '收集兑换', '佣兵集结', '30', '0', '0', '2019-01-12 00:00:00', '2020-02-12 00:00:00', '[\r\n{\"desc\":\"兑换精灵之泪\",\"needItems\":{\"100260\":2},\"getItems\":{\"30\":20},\"limitNum\":999},\r\n{\"desc\":\"兑换拿铁咖啡\",\"needItems\":{\"100261\":2},\"getItems\":{\"45\":25},\"limitNum\":999},\r\n{\"desc\":\"兑换史莱姆蛋\",\"needItems\":{\"100261\":2,\"100260\":2},\"getItems\":{\"1500308\":1},\"limitNum\":30},\r\n{\"desc\":\"兑换奥瑞斯\",\"needItems\":{\"100262\":4,\"100261\":6,\"100260\":8},\"getItems\":{\"432000\":1},\"limitNum\":5},\r\n{\"desc\":\"兑换传说の勇者\",\"needItems\":{\"100262\":20,\"100261\":20,\"100260\":20},\"getItems\":{\"11478\":1},\"limitNum\":1},\r\n{\"desc\":\"兑换狂战士\",\"needItems\":{\"100261\":15,\"100260\":15},\"getItems\":{\"11480\":1},\"limitNum\":1},\r\n{\"desc\":\"兑换圣骑士\",\"needItems\":{\"100261\":15,\"100260\":15},\"getItems\":{\"11481\":1},\"limitNum\":1},\r\n{\"desc\":\"兑换声望之羽\",\"needItems\":{\"100262\":1},\"getItems\":{\"52\":300},\"limitNum\":999}\r\n]', null, '', '', '', null, '0', '20', '{\"1\":\"ico_goddrop\",\"4\":\"shengbei_bg\",\"8\":30}', '0', '', '1', '佣兵集结兑换活动新SSR宠物奥瑞斯', '1-2', '1');
INSERT INTO `uw_public_activity` VALUES ('100003', '收集兑换', '佣兵集结', '30', '0', '0', '2019-01-12 00:00:00', '2020-02-13 00:00:00', '[\r\n{\"desc\":\"兑换精灵之泪\",\"needItems\":{\"100260\":2},\"getItems\":{\"30\":20},\"limitNum\":999},\r\n{\"desc\":\"兑换拿铁咖啡\",\"needItems\":{\"100261\":2},\"getItems\":{\"45\":25},\"limitNum\":999},\r\n{\"desc\":\"兑换史莱姆蛋\",\"needItems\":{\"100261\":2,\"100260\":2},\"getItems\":{\"1500308\":1},\"limitNum\":30},\r\n{\"desc\":\"兑换暗黑巨狼\",\"needItems\":{\"100262\":4,\"100261\":6,\"100260\":8},\"getItems\":{\"230000\":1},\"limitNum\":5},\r\n{\"desc\":\"兑换佣兵王\",\"needItems\":{\"100262\":20,\"100261\":20,\"100260\":20},\"getItems\":{\"11479\":1},\"limitNum\":1},\r\n{\"desc\":\"兑换我最可爱\",\"needItems\":{\"100261\":15,\"100260\":15},\"getItems\":{\"11482\":1},\"limitNum\":1},\r\n{\"desc\":\"兑换我是神\",\"needItems\":{\"100261\":15,\"100260\":15},\"getItems\":{\"11483\":1},\"limitNum\":1},\r\n{\"desc\":\"兑换声望之羽\",\"needItems\":{\"100262\":1},\"getItems\":{\"52\":300},\"limitNum\":999}\r\n]', null, '', '', '', null, '0', '20', '{\"1\":\"ico_goddrop\",\"4\":\"shengbei_bg\",\"8\":30}', '0', '', '1', '佣兵集结兑换活动新SSR宠物暗灰巨狼', '1-2', '1');
INSERT INTO `uw_public_activity` VALUES ('100004', '收集兑换', '喵币收集', '30', '0', '0', '2019-01-12 00:00:00', '2020-02-12 00:00:00', '[\r\n{\"desc\":\"兑换薛定谔\",\"needItems\":{\"100246\":3,\"100248\":3},\"getItems\":{\"224000\":1},\"limitNum\":10},\r\n{\"desc\":\"兑换首席猫奴\",\"needItems\":{\"100247\":20,\"100246\":20,\"100248\":20},\"getItems\":{\"11477\":1},\"limitNum\":1},\r\n{\"desc\":\"兑换光明战士\",\"needItems\":{\"100246\":3,\"100248\":3},\"getItems\":{\"130000\":1},\"limitNum\":10},\r\n{\"desc\":\"兑换圣战士\",\"needItems\":{\"100246\":3,\"100248\":3},\"getItems\":{\"433000\":1},\"limitNum\":10},\r\n{\"desc\":\"兑换逗比仙人掌\",\"needItems\":{\"100247\":5,\"100246\":5,\"100248\":5},\"getItems\":{\"329000\":1},\"limitNum\":10},\r\n{\"desc\":\"兑换小小精灵蛋\",\"needItems\":{\"100248\":12},\"getItems\":{\"1500306\":1},\"limitNum\":30},\r\n{\"desc\":\"兑换军衔奖杯\",\"needItems\":{\"100248\":2},\"getItems\":{\"1500301\":1},\"limitNum\":200},\r\n{\"desc\":\"兑换A型充电宝\",\"needItems\":{\"100246\":2},\"getItems\":{\"54\":40},\"limitNum\":999},\r\n{\"desc\":\"兑换史莱姆软糖\",\"needItems\":{\"100247\":1},\"getItems\":{\"56\":1500},\"limitNum\":999}\r\n]', null, '', '', '', null, '0', '30', '{\"1\":\"ico_heimao\",\"4\":\"miaobi_bg\",\"8\":50}', '0', '', '1', '收集喵币兑换活动新SSR宠物逗比仙人掌', '1-3', '1');
INSERT INTO `uw_public_activity` VALUES ('100005', '收集兑换', '七海寻宝', '30', '0', '0', '2019-01-12 00:00:00', '2020-02-12 00:00:00', '[\r\n{\"desc\":\"兑换110级橙装宝箱\",\"needItems\":{\"100270\":10},\"getItems\":{\"1500313\":1},\"limitNum\":15,\"limitLvl\":[110,119]},\r\n{\"desc\":\"兑换120级橙装宝箱\",\"needItems\":{\"100270\":21},\"getItems\":{\"1500314\":1},\"limitNum\":15,\"limitLvl\":[120,129]},\r\n{\"desc\":\"兑换130级橙装宝箱\",\"needItems\":{\"100270\":32},\"getItems\":{\"1500315\":1},\"limitNum\":15,\"limitLvl\":[130,139]},\r\n{\"desc\":\"兑换140级橙装宝箱\",\"needItems\":{\"100270\":43},\"getItems\":{\"1500316\":1},\"limitNum\":15,\"limitLvl\":[140,149]},\r\n{\"desc\":\"兑换150级橙装宝箱\",\"needItems\":{\"100270\":54},\"getItems\":{\"1500317\":1},\"limitNum\":15,\"limitLvl\":[150,159]},\r\n{\"desc\":\"兑换160级橙装宝箱\",\"needItems\":{\"100270\":75},\"getItems\":{\"1500318\":1},\"limitNum\":15,\"limitLvl\":[160,169]},\r\n{\"desc\":\"兑换170级橙装宝箱\",\"needItems\":{\"100270\":97},\"getItems\":{\"1500319\":1},\"limitNum\":15,\"limitLvl\":[170,179]},\r\n{\"desc\":\"兑换180级橙装宝箱\",\"needItems\":{\"100270\":129},\"getItems\":{\"1500320\":1},\"limitNum\":15,\"limitLvl\":[180,189]},\r\n{\"desc\":\"兑换190级橙装宝箱\",\"needItems\":{\"100270\":162},\"getItems\":{\"1500321\":1},\"limitNum\":15,\"limitLvl\":[190,199]},\r\n{\"desc\":\"兑换200级橙装宝箱\",\"needItems\":{\"100270\":216},\"getItems\":{\"1500322\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[0,99]},\r\n{\"desc\":\"兑换魔导100阶橙装宝箱\",\"needItems\":{\"100270\":280},\"getItems\":{\"1500323\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[100,199]},\r\n{\"desc\":\"兑换魔导200阶橙装宝箱\",\"needItems\":{\"100270\":356},\"getItems\":{\"1500324\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[200,299]},\r\n{\"desc\":\"兑换魔导300阶橙装宝箱\",\"needItems\":{\"100270\":442},\"getItems\":{\"1500325\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[300,399]},\r\n{\"desc\":\"兑换魔导400阶橙装宝箱\",\"needItems\":{\"100270\":540},\"getItems\":{\"1500326\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[400,499]},\r\n{\"desc\":\"兑换魔导500阶橙装宝箱\",\"needItems\":{\"100270\":648},\"getItems\":{\"1500327\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[500,3000]},\r\n{\"desc\":\"兑换120级R红宝箱\",\"needItems\":{\"100271\":15,\"100270\":10},\"getItems\":{\"1500328\":1},\"limitNum\":7,\"limitLvl\":[120,139]},\r\n{\"desc\":\"兑换130级R红宝箱\",\"needItems\":{\"100271\":22,\"100270\":16},\"getItems\":{\"1500329\":1},\"limitNum\":7,\"limitLvl\":[130,149]},\r\n{\"desc\":\"兑换140级R红宝箱\",\"needItems\":{\"100271\":30,\"100270\":21},\"getItems\":{\"1500330\":1},\"limitNum\":7,\"limitLvl\":[140,159]},\r\n{\"desc\":\"兑换150级R红宝箱\",\"needItems\":{\"100271\":37,\"100270\":27},\"getItems\":{\"1500331\":1},\"limitNum\":7,\"limitLvl\":[150,169]},\r\n{\"desc\":\"兑换160级R红宝箱\",\"needItems\":{\"100271\":52,\"100270\":37},\"getItems\":{\"1500332\":1},\"limitNum\":7,\"limitLvl\":[160,179]},\r\n{\"desc\":\"兑换170级R红宝箱\",\"needItems\":{\"100271\":67,\"100270\":48},\"getItems\":{\"1500333\":1},\"limitNum\":7,\"limitLvl\":[170,189]},\r\n{\"desc\":\"兑换180级R红宝箱\",\"needItems\":{\"100271\":90,\"100270\":64},\"getItems\":{\"1500334\":1},\"limitNum\":7,\"limitLvl\":[180,199]},\r\n{\"desc\":\"兑换190级R红宝箱\",\"needItems\":{\"100271\":112,\"100270\":81},\"getItems\":{\"1500335\":1},\"limitNum\":7,\"limitLvl\":[190,200],\"limitMagicLvl\":[0,99]},\r\n{\"desc\":\"兑换200级R红宝箱\",\"needItems\":{\"100271\":150,\"100270\":108},\"getItems\":{\"1500336\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[0,199]},\r\n{\"desc\":\"兑换魔导100阶R红宝箱\",\"needItems\":{\"100271\":195,\"100270\":140},\"getItems\":{\"1500337\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[100,299]},\r\n{\"desc\":\"兑换魔导200阶R红宝箱\",\"needItems\":{\"100271\":247,\"100270\":178},\"getItems\":{\"1500338\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[200,399]},\r\n{\"desc\":\"兑换魔导300阶R红宝箱\",\"needItems\":{\"100271\":307,\"100270\":221},\"getItems\":{\"1500339\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[300,499]},\r\n{\"desc\":\"兑换魔导400阶R红宝箱\",\"needItems\":{\"100271\":375,\"100270\":270},\"getItems\":{\"1500340\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[400,599]},\r\n{\"desc\":\"兑换魔导500阶R红宝箱\",\"needItems\":{\"100271\":450,\"100270\":324},\"getItems\":{\"1500341\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[500,3000]},\r\n{\"desc\":\"兑换120级S红宝箱\",\"needItems\":{\"100272\":12,\"100270\":10},\"getItems\":{\"1500342\":1},\"limitNum\":2,\"limitLvl\":[120,149]},\r\n{\"desc\":\"兑换130级S红宝箱\",\"needItems\":{\"100272\":17,\"100270\":16},\"getItems\":{\"1500343\":1},\"limitNum\":2,\"limitLvl\":[130,159]},\r\n{\"desc\":\"兑换140级S红宝箱\",\"needItems\":{\"100272\":24,\"100270\":21},\"getItems\":{\"1500344\":1},\"limitNum\":2,\"limitLvl\":[140,169]},\r\n{\"desc\":\"兑换150级S红宝箱\",\"needItems\":{\"100272\":30,\"100270\":27},\"getItems\":{\"1500345\":1},\"limitNum\":2,\"limitLvl\":[150,179]},\r\n{\"desc\":\"兑换160级S红宝箱\",\"needItems\":{\"100272\":41,\"100270\":37},\"getItems\":{\"1500346\":1},\"limitNum\":2,\"limitLvl\":[160,189]},\r\n{\"desc\":\"兑换170级S红宝箱\",\"needItems\":{\"100272\":54,\"100270\":48},\"getItems\":{\"1500347\":1},\"limitNum\":2,\"limitLvl\":[170,199]},\r\n{\"desc\":\"兑换180级S红宝箱\",\"needItems\":{\"100272\":71,\"100270\":64},\"getItems\":{\"1500348\":1},\"limitNum\":2,\"limitLvl\":[180,200],\"limitMagicLvl\":[0,99]},\r\n{\"desc\":\"兑换190级S红宝箱\",\"needItems\":{\"100272\":90,\"100270\":81},\"getItems\":{\"1500349\":1},\"limitNum\":2,\"limitLvl\":[190,200],\"limitMagicLvl\":[0,199]},\r\n{\"desc\":\"兑换200级S红宝箱\",\"needItems\":{\"100272\":120,\"100270\":108},\"getItems\":{\"1500350\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[0,299]},\r\n{\"desc\":\"兑换魔导100阶S红宝箱\",\"needItems\":{\"100272\":156,\"100270\":140},\"getItems\":{\"1500351\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[100,399]},\r\n{\"desc\":\"兑换魔导200阶S红宝箱\",\"needItems\":{\"100272\":197,\"100270\":178},\"getItems\":{\"1500352\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[200,499]},\r\n{\"desc\":\"兑换魔导300阶S红宝箱\",\"needItems\":{\"100272\":245,\"100270\":221},\"getItems\":{\"1500353\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[300,599]},\r\n{\"desc\":\"兑换魔导400阶S红宝箱\",\"needItems\":{\"100272\":300,\"100270\":270},\"getItems\":{\"1500354\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[400,699]},\r\n{\"desc\":\"兑换魔导500阶S红宝箱\",\"needItems\":{\"100272\":360,\"100270\":324},\"getItems\":{\"1500355\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[500,3000]},\r\n{\"desc\":\"兑换神秘宝石袋\",\"needItems\":{\"100272\":5},\"getItems\":{\"1434\":1},\"limitNum\":20,\"limitLvl\":[0,150]},\r\n{\"desc\":\"兑换神秘宝石袋\",\"needItems\":{\"100272\":15},\"getItems\":{\"1434\":3},\"limitNum\":20,\"limitLvl\":[151,199]},\r\n{\"desc\":\"兑换神秘宝石袋\",\"needItems\":{\"100272\":40},\"getItems\":{\"1434\":8},\"limitNum\":20,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]},\r\n{\"desc\":\"兑换神之金属\",\"needItems\":{\"100271\":10},\"getItems\":{\"19\":10},\"limitNum\":40,\"limitLvl\":[0,150]},\r\n{\"desc\":\"兑换神之金属\",\"needItems\":{\"100271\":30},\"getItems\":{\"19\":30},\"limitNum\":40,\"limitLvl\":[151,199]},\r\n{\"desc\":\"兑换神之金属\",\"needItems\":{\"100271\":100},\"getItems\":{\"19\":100},\"limitNum\":40,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]},\r\n{\"desc\":\"兑换玛娜之心\",\"needItems\":{\"100270\":20},\"getItems\":{\"18\":1000},\"limitNum\":60,\"limitLvl\":[0,150]},\r\n{\"desc\":\"兑换玛娜之心\",\"needItems\":{\"100270\":60},\"getItems\":{\"18\":3000},\"limitNum\":60,\"limitLvl\":[151,199]},\r\n{\"desc\":\"兑换玛娜之心\",\"needItems\":{\"100270\":200},\"getItems\":{\"18\":10000},\"limitNum\":60,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]},\r\n{\"desc\":\"兑换贤者之石\",\"needItems\":{\"1500312\":10},\"getItems\":{\"1500310\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]},\r\n{\"desc\":\"兑换神之金属\",\"needItems\":{\"1500312\":1},\"getItems\":{\"19\":15},\"limitNum\":999,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]}\r\n]', null, '', '', '', null, '0', '40', '{\"1\":\"ico_goddrop\",\"4\":\"haidao_bg\",\"8\":30}', '0', '', '1', '七海寻宝兑换活动通用1', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100006', '女神的私人报答', '女神的私人报答', '51', '0', '0', '2019-01-12 00:00:00', '2022-02-12 00:00:00', '[\r\n1500231,\r\n1500232,\r\n1500233,\r\n1500234,\r\n1500235\r\n]', null, '[6,30,60,98,198]', '', '', null, '0', '100', '{\"2\":\"nvshen2_bg\",\"4\":\"nvshen_bg\"}', '0', '', '1', '累计充值女神的私人报答通用1', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100007', '克里斯汀的黑色魔导', '克里斯汀的黑色魔导', '51', '0', '0', '2019-01-12 00:00:00', '2022-02-12 00:00:00', '[\r\n1500221,\r\n1500222,\r\n1500223,\r\n1500224,\r\n1500225\r\n]', null, '[6,30,60,98,198]', '', '', null, '0', '100', '{\"2\":\"hmds2_bg\",\"4\":\"hmds_bg\"}', '0', '', '1', '累计充值克里斯汀的黑色魔导', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100008', '惠惠的音爆之魂', '惠惠的音爆之魂', '51', '0', '0', '2019-01-12 00:00:00', '2022-02-12 00:00:00', '[\r\n1500211,\r\n1500212,\r\n1500213,\r\n1500214,\r\n1500215\r\n]', null, '[6,30,60,98,198]', '', '', null, '0', '100', '{\"2\":\"ybbs2_bg\",\"4\":\"ybbs_bg\"}', '0', '', '1', '累计充值惠惠的音爆之魂', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100009', '女子宿舍的每日巡查', '女子宿舍的每日巡查', '2', '0', '0', '2019-02-24 00:00:00', '2022-02-08 23:59:59', '[\r\n{\"2008\":1,\"52\":100,\"200\":100},\r\n{\"100219\":10,\"56\":1000,\"200\":100},\r\n{\"2008\":1,\"52\":100,\"200\":100},\r\n{\"2008\":1,\"52\":100,\"200\":100},\r\n{\"2\":2,\"8\":2,\"2013\":1},\r\n{\"1551\":30,\"200\":500,\"2013\":1},\r\n{\"2007\":50,\"200\":500,\"2013\":1}\r\n]', null, '', '', '', null, '0', '50', '{\"2\":\"nzss\",\"4\":\"everyDayGirl\"}', '0', '', '1', '女子宿舍的每日巡查', '', '0');
INSERT INTO `uw_public_activity` VALUES ('100010', '七日登录', '七日登录', '2', '0', '0', '2019-02-24 00:00:00', '2022-02-08 23:59:59', '[\r\n{\"2008\":2,\"2007\":30,\"200\":100},\r\n{\"1807\":1,\"56\":1000,\"200\":200},\r\n{\"1551\":30,\"54\":30,\"200\":200},\r\n{\"45\":10,\"2013\":1,\"200\":100},\r\n{\"2\":2,\"100235\":1,\"200\":100},\r\n{\"8\":1,\"100235\":1,\"200\":100},\r\n{\"5002\":2,\"100235\":1,\"200\":500}\r\n]', null, '', '', '', null, '0', '50', '{\"2\":\"qrdl\",\"4\":\"sevenlogin_banner\"}', '0', '', '1', '七日登录通用1', '', '0');
INSERT INTO `uw_public_activity` VALUES ('100011', '收集兑换', '天降之物', '30', '0', '0', '2017-02-09 00:00:00', '2022-10-31 23:59:59', '[\r\n{\"desc\":\"收集白色羽毛\",\"needItems\":{\"1500104\":10},\"getItems\":{\"18\":100},\"limitNum\":999},\r\n{\"desc\":\"收集金色羽毛\",\"needItems\":{\"1500105\":10},\"getItems\":{\"30\":40},\"limitNum\":99},\r\n{\"desc\":\"收集红色羽毛\",\"needItems\":{\"1500106\":5},\"getItems\":{\"1550\":50},\"limitNum\":99},\r\n{\"desc\":\"收集白金红三色羽毛\",\"needItems\":{\"1500104\":3,\"1500105\":1,\"1500106\":1},\"getItems\":{\"53\":5},\"limitNum\":99},\r\n{\"desc\":\"收集白红彩虹三色羽毛\",\"needItems\":{\"1500104\":3,\"1500106\":1,\"1500107\":1},\"getItems\":{\"100219\":5},\"limitNum\":35},\r\n{\"desc\":\"收集金红黑三色羽毛\",\"needItems\":{\"1500105\":3,\"1500106\":1,\"1500108\":1},\"getItems\":{\"2050\":1},\"limitNum\":20}\r\n]', null, '', '[430002,[1500104, 1500105,1500106,1500107,1500108]]', '', null, '0', '0', '{\"1\":\"ico_goddrop\",\"4\":\"tjzw_bg\",\"8\":30}', '0', '', '1', '天降之物通用1', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100012', '戴安娜衣橱', '戴安娜的衣橱', '65', '0', '0', '2017-02-09 00:00:00', '2022-02-08 23:59:59', '[]', null, '{\r\n\"1\":300,\r\n\"10\":2700,\r\n\"mustGetChestId\":100611,\r\n\"poolType\":1,\r\n\"fakeDataTypeKey\":8,\r\n\"employLogTypeKey\":4,\r\n\"showItems\":[1012010,1989,1013010,1016010,1400007,1011010,1018010]\r\n}', '', '', null, '0', '500', '{\"1\":\"Diana_sign\",\"4\":\"clothes_bg\",\"8\":30,\"12\":[\"btn_streamer_10\"],\"13\":[\"换装%s次\"],\"14\":313}', '0', '', '1', '戴安娜衣橱', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100013', '健身计划', '拉切尔的健身计划', '64', '0', '0', '2019-01-20 00:00:00', '2022-10-31 23:59:59', '{\r\n\"1\":{\"target\":1000,\"reward\":11200101},\r\n\"2\":{\"target\":2000,\"reward\":11200102},\r\n\"3\":{\"target\":3500,\"reward\":11200103},\r\n\"4\":{\"target\":4500,\"reward\":11200104},\r\n\"5\":{\"target\":5500,\"reward\":11200105},\r\n\"6\":{\"target\":7000,\"reward\":11200106}\r\n}', null, '[\r\n{\"taskId\":13000001,\"fitValue\":100},\r\n{\"taskId\":13000002,\"fitValue\":5},\r\n{\"taskId\":13000003,\"fitValue\":10},\r\n{\"taskId\":13000004,\"fitValue\":10},\r\n{\"taskId\":13000005,\"fitValue\":10},\r\n{\"taskId\":13000006,\"fitValue\":20},\r\n{\"taskId\":13000007,\"fitValue\":10},\r\n{\"taskId\":13000008,\"fitValue\":25},\r\n{\"taskId\":13000009,\"fitValue\":20},\r\n{\"taskId\":13000010,\"fitValue\":10},\r\n{\"taskId\":13000011,\"fitValue\":40},\r\n{\"taskId\":13000012,\"fitValue\":30},\r\n{\"taskId\":13000013,\"fitValue\":55,\"relationActId\":3005}\r\n]', '', '', null, '0', '23', '{\"1\":\"Rachel_fitness_icon\",\"4\":\"Rachel_picture2\",\"8\":50}', '0', '', '1', '拉切尔的健身计划', '', '0');
INSERT INTO `uw_public_activity` VALUES ('100014', '屠龙远征', '屠龙远征', '63', '0', '0', '2017-02-09 00:00:00', '2022-03-25 23:59:59', '[\r\n{\"desc\":\"狩猎巨龙之鳞\",\"needItems\":{\"1500101\":1},\"getItems\":{\"53\":18},\"limitNum\":10},\r\n{\"desc\":\"狩猎巨龙之爪\",\"needItems\":{\"1500102\":1},\"getItems\":{\"1551\":20},\"limitNum\":10},\r\n{\"desc\":\"狩猎巨龙之鳞,巨龙之爪\",\"needItems\":{\"1500101\":1,\"1500102\":1},\"getItems\":{\"946\":1},\"limitNum\":5},\r\n{\"desc\":\"狩猎巨龙之心\",\"needItems\":{\"1500101\":2,\"1500102\":2,\"1500103\":1},\"getItems\":{\"943\":1},\"limitNum\":5}\r\n]', null, '', '', '', null, '0', '21', '{\"1\":\"dragonSkill_ico\",\"8\":80}', '0', '', '1', '屠龙远征', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100015', '梦境魔法', '梦境魔法', '66', '0', '0', '2019-01-25 00:00:00', '2020-01-27 23:59:59', '[]', null, '{\"5\":{\"1\":2,\"3\":2},\"6\":{\"12\":2,\"13\":2,\"14\":2,\"15\":2,\"16\":2,\"17\":2},\"0\":{\"18\":2}}', '', '', null, '0', '22', '{\"1\":\"dreamMagic\",\"8\":50}', '0', '', '1', '梦境魔法', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100016', '星象转盘', '星象转盘', '68', '0', '0', '2017-02-09 00:00:00', '2022-03-23 23:59:59', '[\r\n{\"taskId\":15000001,\"awardNum\":1},\r\n{\"taskId\":15000002,\"awardNum\":1},\r\n{\"taskId\":15000003,\"awardNum\":1},\r\n{\"taskId\":15000005,\"awardNum\":1},\r\n{\"taskId\":15000006,\"awardNum\":1},\r\n{\"taskId\":15000004,\"awardNum\":2},\r\n{\"taskId\":15000007,\"awardNum\":2},\r\n{\"taskId\":15000011,\"awardNum\":3},\r\n{\"taskId\":15000008,\"awardNum\":3}\r\n]', null, '{\"chestId\":100501,\"price\":1}', '', '', null, '0', '400', '{\"1\":\"ico_zhuanpan\",\"8\":30}', '0', '', '1', '星象转盘', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100017', '星象占卜', '遥的星象占卜', '65', '0', '0', '2017-02-09 00:00:00', '2022-10-31 23:59:59', '[]', null, '{\r\n\"1\":150,\r\n\"10\":1350,\r\n\"mustGetChestId\":100612,\r\n\"poolType\":2,\r\n\"fakeDataTypeKey\":9,\r\n\"employLogTypeKey\":5,\r\n\"showItems\":[1400010,950,100222,100240,53,1400020,1400024]\r\n}', '', '', null, '0', '500', '{\"1\":\"ico_yaodxxzp\",\"4\":\"yaodxxzp_bg\",\"8\":30,\"12\":[\"yao_text\"],\"13\":[\"占卜%s次\"],\"14\":314}', '0', '', '1', '遥的星象占卜', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100018', '收集兑换', '灯神召唤', '30', '0', '0', '2018-10-18 00:00:00', '2018-11-04 23:59:59', '[\r\n{\"desc\":\"兑换活跃度*10\",\"needItems\":{\"100250\":1},\"getItems\":{\"1500302\":1},\"limitNum\":60},\r\n{\"desc\":\"兑换深渊魔石\",\"needItems\":{\"100251\":2},\"getItems\":{\"950\":8},\"limitNum\":999},\r\n{\"desc\":\"兑换黄金R宠蛋\",\"needItems\":{\"100251\":1,\"100250\":1},\"getItems\":{\"4008\":1},\"limitNum\":999},\r\n{\"desc\":\"兑换寂灭星魂宝箱\",\"needItems\":{\"100252\":4,\"100251\":6,\"100250\":8},\"getItems\":{\"2053\":1},\"limitNum\":10},\r\n{\"desc\":\"兑换史莱姆圣王\",\"needItems\":{\"100252\":3,\"100251\":4,\"100250\":5},\"getItems\":{\"122000\":1},\"limitNum\":5},\r\n\r\n\r\n{\"desc\":\"兑换3阶翅膀\",\"needItems\":{\"100252\":4,\"100251\":4,\"100250\":4},\"getItems\":{\"2034\":1},\"limitNum\":4},\r\n{\"desc\":\"兑换觉醒·贝露丹迪\",\"needItems\":{\"100252\":24,\"100251\":36,\"100250\":48},\"getItems\":{\"100244\":1},\"limitNum\":3},\r\n{\"desc\":\"兑换地结晶碎片\",\"needItems\":{\"100252\":1},\"getItems\":{\"3\":2},\"limitNum\":999},\r\n{\"desc\":\"兑换火结晶碎片\",\"needItems\":{\"100252\":1},\"getItems\":{\"6\":2},\"limitNum\":999},\r\n{\"desc\":\"兑换风结晶碎片\",\"needItems\":{\"100252\":1},\"getItems\":{\"5\":2},\"limitNum\":999},\r\n{\"desc\":\"兑换水结晶碎片\",\"needItems\":{\"100252\":1},\"getItems\":{\"4\":2},\"limitNum\":999}\r\n]', null, '', '', '', null, '1', '10', '{\"1\":\"ico_goddrop\",\"4\":\"shendeng_bg\",\"8\":30}', '0', '', '0', '灯神召唤兑换活动通用1', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100019', '收集兑换', '佣兵集结', '30', '0', '0', '2018-10-18 00:00:00', '2018-11-18 23:59:59', '[\r\n{\"desc\":\"兑换精灵之泪\",\"needItems\":{\"100260\":2},\"getItems\":{\"30\":20},\"limitNum\":999},\r\n{\"desc\":\"兑换拿铁咖啡\",\"needItems\":{\"100261\":2},\"getItems\":{\"45\":25},\"limitNum\":999},\r\n{\"desc\":\"兑换史莱姆蛋\",\"needItems\":{\"100261\":2,\"100260\":2},\"getItems\":{\"1500308\":1},\"limitNum\":30},\r\n{\"desc\":\"兑换奥瑞斯\",\"needItems\":{\"100262\":4,\"100261\":6,\"100260\":8},\"getItems\":{\"432000\":1},\"limitNum\":5},\r\n{\"desc\":\"兑换传说の勇者\",\"needItems\":{\"100262\":20,\"100261\":20,\"100260\":20},\"getItems\":{\"11478\":1},\"limitNum\":1},\r\n{\"desc\":\"兑换狂战士\",\"needItems\":{\"100261\":15,\"100260\":15},\"getItems\":{\"11480\":1},\"limitNum\":1},\r\n{\"desc\":\"兑换圣骑士\",\"needItems\":{\"100261\":15,\"100260\":15},\"getItems\":{\"11481\":1},\"limitNum\":1},\r\n{\"desc\":\"兑换声望之羽\",\"needItems\":{\"100262\":1},\"getItems\":{\"52\":300},\"limitNum\":999}\r\n]', null, '', '', '', null, '1', '20', '{\"1\":\"ico_goddrop\",\"4\":\"shengbei_bg\",\"8\":30}', '0', '', '0', '', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100020', '收集兑换', '喵币收集', '30', '0', '0', '2018-10-18 00:00:00', '2018-11-18 23:59:59', '[\r\n{\"desc\":\"兑换薛定谔\",\"needItems\":{\"100246\":3,\"100248\":3},\"getItems\":{\"224000\":1},\"limitNum\":10},\r\n{\"desc\":\"兑换首席猫奴\",\"needItems\":{\"100247\":20,\"100246\":20,\"100248\":20},\"getItems\":{\"11477\":1},\"limitNum\":1},\r\n{\"desc\":\"兑换光明战士\",\"needItems\":{\"100246\":3,\"100248\":3},\"getItems\":{\"130000\":1},\"limitNum\":10},\r\n{\"desc\":\"兑换圣战士\",\"needItems\":{\"100246\":3,\"100248\":3},\"getItems\":{\"433000\":1},\"limitNum\":10},\r\n{\"desc\":\"兑换逗比仙人掌\",\"needItems\":{\"100247\":5,\"100246\":5,\"100248\":5},\"getItems\":{\"329000\":1},\"limitNum\":10},\r\n{\"desc\":\"兑换小小精灵蛋\",\"needItems\":{\"100248\":12},\"getItems\":{\"1500306\":1},\"limitNum\":30},\r\n{\"desc\":\"兑换军衔奖杯\",\"needItems\":{\"100248\":2},\"getItems\":{\"1500301\":1},\"limitNum\":200},\r\n{\"desc\":\"兑换A型充电宝\",\"needItems\":{\"100246\":2},\"getItems\":{\"54\":40},\"limitNum\":999},\r\n{\"desc\":\"兑换史莱姆软糖\",\"needItems\":{\"100247\":1},\"getItems\":{\"56\":1500},\"limitNum\":999}\r\n]', null, '', '', '', null, '1', '30', '{\"1\":\"ico_heimao\",\"4\":\"miaobi_bg\",\"8\":50}', '0', '', '0', '收集喵币兑换活动新SSR宠物逗比仙人掌', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100021', '收集兑换', '天降之物', '30', '0', '0', '2018-10-18 00:00:00', '2018-10-28 23:59:59', '[\r\n{\"desc\":\"收集白色羽毛\",\"needItems\":{\"1500104\":10},\"getItems\":{\"18\":100},\"limitNum\":999},\r\n{\"desc\":\"收集金色羽毛\",\"needItems\":{\"1500105\":10},\"getItems\":{\"30\":40},\"limitNum\":99},\r\n{\"desc\":\"收集红色羽毛\",\"needItems\":{\"1500106\":5},\"getItems\":{\"1550\":50},\"limitNum\":99},\r\n{\"desc\":\"收集白金红三色羽毛\",\"needItems\":{\"1500104\":3,\"1500105\":1,\"1500106\":1},\"getItems\":{\"53\":5},\"limitNum\":99},\r\n{\"desc\":\"收集白红彩虹三色羽毛\",\"needItems\":{\"1500104\":3,\"1500106\":1,\"1500107\":1},\"getItems\":{\"100219\":5},\"limitNum\":35},\r\n{\"desc\":\"收集金红黑三色羽毛\",\"needItems\":{\"1500105\":3,\"1500106\":1,\"1500108\":1},\"getItems\":{\"2050\":1},\"limitNum\":20}\r\n]', null, '', '[430002,[1500104, 1500105,1500106,1500107,1500108]]', '', null, '1', '0', '{\"1\":\"ico_goddrop\",\"4\":\"tjzw_bg\",\"8\":30}', '0', '', '0', '天降之物通用1', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100022', '收集兑换', '七海寻宝', '30', '0', '0', '2018-10-18 00:00:00', '2018-10-28 23:59:59', '[\r\n{\"desc\":\"兑换110级橙装宝箱\",\"needItems\":{\"100270\":10},\"getItems\":{\"1500313\":1},\"limitNum\":15,\"limitLvl\":[110,119]},\r\n{\"desc\":\"兑换120级橙装宝箱\",\"needItems\":{\"100270\":21},\"getItems\":{\"1500314\":1},\"limitNum\":15,\"limitLvl\":[120,129]},\r\n{\"desc\":\"兑换130级橙装宝箱\",\"needItems\":{\"100270\":32},\"getItems\":{\"1500315\":1},\"limitNum\":15,\"limitLvl\":[130,139]},\r\n{\"desc\":\"兑换140级橙装宝箱\",\"needItems\":{\"100270\":43},\"getItems\":{\"1500316\":1},\"limitNum\":15,\"limitLvl\":[140,149]},\r\n{\"desc\":\"兑换150级橙装宝箱\",\"needItems\":{\"100270\":54},\"getItems\":{\"1500317\":1},\"limitNum\":15,\"limitLvl\":[150,159]},\r\n{\"desc\":\"兑换160级橙装宝箱\",\"needItems\":{\"100270\":75},\"getItems\":{\"1500318\":1},\"limitNum\":15,\"limitLvl\":[160,169]},\r\n{\"desc\":\"兑换170级橙装宝箱\",\"needItems\":{\"100270\":97},\"getItems\":{\"1500319\":1},\"limitNum\":15,\"limitLvl\":[170,179]},\r\n{\"desc\":\"兑换180级橙装宝箱\",\"needItems\":{\"100270\":129},\"getItems\":{\"1500320\":1},\"limitNum\":15,\"limitLvl\":[180,189]},\r\n{\"desc\":\"兑换190级橙装宝箱\",\"needItems\":{\"100270\":162},\"getItems\":{\"1500321\":1},\"limitNum\":15,\"limitLvl\":[190,199]},\r\n{\"desc\":\"兑换200级橙装宝箱\",\"needItems\":{\"100270\":216},\"getItems\":{\"1500322\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[0,99]},\r\n{\"desc\":\"兑换魔导100阶橙装宝箱\",\"needItems\":{\"100270\":280},\"getItems\":{\"1500323\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[100,199]},\r\n{\"desc\":\"兑换魔导200阶橙装宝箱\",\"needItems\":{\"100270\":356},\"getItems\":{\"1500324\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[200,299]},\r\n{\"desc\":\"兑换魔导300阶橙装宝箱\",\"needItems\":{\"100270\":442},\"getItems\":{\"1500325\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[300,399]},\r\n{\"desc\":\"兑换魔导400阶橙装宝箱\",\"needItems\":{\"100270\":540},\"getItems\":{\"1500326\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[400,499]},\r\n{\"desc\":\"兑换魔导500阶橙装宝箱\",\"needItems\":{\"100270\":648},\"getItems\":{\"1500327\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[500,3000]},\r\n{\"desc\":\"兑换120级R红宝箱\",\"needItems\":{\"100271\":15,\"100270\":10},\"getItems\":{\"1500328\":1},\"limitNum\":7,\"limitLvl\":[120,139]},\r\n{\"desc\":\"兑换130级R红宝箱\",\"needItems\":{\"100271\":22,\"100270\":16},\"getItems\":{\"1500329\":1},\"limitNum\":7,\"limitLvl\":[130,149]},\r\n{\"desc\":\"兑换140级R红宝箱\",\"needItems\":{\"100271\":30,\"100270\":21},\"getItems\":{\"1500330\":1},\"limitNum\":7,\"limitLvl\":[140,159]},\r\n{\"desc\":\"兑换150级R红宝箱\",\"needItems\":{\"100271\":37,\"100270\":27},\"getItems\":{\"1500331\":1},\"limitNum\":7,\"limitLvl\":[150,169]},\r\n{\"desc\":\"兑换160级R红宝箱\",\"needItems\":{\"100271\":52,\"100270\":37},\"getItems\":{\"1500332\":1},\"limitNum\":7,\"limitLvl\":[160,179]},\r\n{\"desc\":\"兑换170级R红宝箱\",\"needItems\":{\"100271\":67,\"100270\":48},\"getItems\":{\"1500333\":1},\"limitNum\":7,\"limitLvl\":[170,189]},\r\n{\"desc\":\"兑换180级R红宝箱\",\"needItems\":{\"100271\":90,\"100270\":64},\"getItems\":{\"1500334\":1},\"limitNum\":7,\"limitLvl\":[180,199]},\r\n{\"desc\":\"兑换190级R红宝箱\",\"needItems\":{\"100271\":112,\"100270\":81},\"getItems\":{\"1500335\":1},\"limitNum\":7,\"limitLvl\":[190,200],\"limitMagicLvl\":[0,99]},\r\n{\"desc\":\"兑换200级R红宝箱\",\"needItems\":{\"100271\":150,\"100270\":108},\"getItems\":{\"1500336\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[0,199]},\r\n{\"desc\":\"兑换魔导100阶R红宝箱\",\"needItems\":{\"100271\":195,\"100270\":140},\"getItems\":{\"1500337\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[100,299]},\r\n{\"desc\":\"兑换魔导200阶R红宝箱\",\"needItems\":{\"100271\":247,\"100270\":178},\"getItems\":{\"1500338\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[200,399]},\r\n{\"desc\":\"兑换魔导300阶R红宝箱\",\"needItems\":{\"100271\":307,\"100270\":221},\"getItems\":{\"1500339\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[300,499]},\r\n{\"desc\":\"兑换魔导400阶R红宝箱\",\"needItems\":{\"100271\":375,\"100270\":270},\"getItems\":{\"1500340\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[400,599]},\r\n{\"desc\":\"兑换魔导500阶R红宝箱\",\"needItems\":{\"100271\":450,\"100270\":324},\"getItems\":{\"1500341\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[500,3000]},\r\n{\"desc\":\"兑换120级S红宝箱\",\"needItems\":{\"100272\":12,\"100270\":10},\"getItems\":{\"1500342\":1},\"limitNum\":2,\"limitLvl\":[120,149]},\r\n{\"desc\":\"兑换130级S红宝箱\",\"needItems\":{\"100272\":17,\"100270\":16},\"getItems\":{\"1500343\":1},\"limitNum\":2,\"limitLvl\":[130,159]},\r\n{\"desc\":\"兑换140级S红宝箱\",\"needItems\":{\"100272\":24,\"100270\":21},\"getItems\":{\"1500344\":1},\"limitNum\":2,\"limitLvl\":[140,169]},\r\n{\"desc\":\"兑换150级S红宝箱\",\"needItems\":{\"100272\":30,\"100270\":27},\"getItems\":{\"1500345\":1},\"limitNum\":2,\"limitLvl\":[150,179]},\r\n{\"desc\":\"兑换160级S红宝箱\",\"needItems\":{\"100272\":41,\"100270\":37},\"getItems\":{\"1500346\":1},\"limitNum\":2,\"limitLvl\":[160,189]},\r\n{\"desc\":\"兑换170级S红宝箱\",\"needItems\":{\"100272\":54,\"100270\":48},\"getItems\":{\"1500347\":1},\"limitNum\":2,\"limitLvl\":[170,199]},\r\n{\"desc\":\"兑换180级S红宝箱\",\"needItems\":{\"100272\":71,\"100270\":64},\"getItems\":{\"1500348\":1},\"limitNum\":2,\"limitLvl\":[180,200],\"limitMagicLvl\":[0,99]},\r\n{\"desc\":\"兑换190级S红宝箱\",\"needItems\":{\"100272\":90,\"100270\":81},\"getItems\":{\"1500349\":1},\"limitNum\":2,\"limitLvl\":[190,200],\"limitMagicLvl\":[0,199]},\r\n{\"desc\":\"兑换200级S红宝箱\",\"needItems\":{\"100272\":120,\"100270\":108},\"getItems\":{\"1500350\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[0,299]},\r\n{\"desc\":\"兑换魔导100阶S红宝箱\",\"needItems\":{\"100272\":156,\"100270\":140},\"getItems\":{\"1500351\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[100,399]},\r\n{\"desc\":\"兑换魔导200阶S红宝箱\",\"needItems\":{\"100272\":197,\"100270\":178},\"getItems\":{\"1500352\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[200,499]},\r\n{\"desc\":\"兑换魔导300阶S红宝箱\",\"needItems\":{\"100272\":245,\"100270\":221},\"getItems\":{\"1500353\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[300,599]},\r\n{\"desc\":\"兑换魔导400阶S红宝箱\",\"needItems\":{\"100272\":300,\"100270\":270},\"getItems\":{\"1500354\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[400,699]},\r\n{\"desc\":\"兑换魔导500阶S红宝箱\",\"needItems\":{\"100272\":360,\"100270\":324},\"getItems\":{\"1500355\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[500,3000]},\r\n{\"desc\":\"兑换神秘宝石袋\",\"needItems\":{\"100272\":5},\"getItems\":{\"1434\":1},\"limitNum\":20,\"limitLvl\":[0,150]},\r\n{\"desc\":\"兑换神秘宝石袋\",\"needItems\":{\"100272\":15},\"getItems\":{\"1434\":3},\"limitNum\":20,\"limitLvl\":[151,199]},\r\n{\"desc\":\"兑换神秘宝石袋\",\"needItems\":{\"100272\":40},\"getItems\":{\"1434\":8},\"limitNum\":20,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]},\r\n{\"desc\":\"兑换神之金属\",\"needItems\":{\"100271\":10},\"getItems\":{\"19\":10},\"limitNum\":40,\"limitLvl\":[0,150]},\r\n{\"desc\":\"兑换神之金属\",\"needItems\":{\"100271\":30},\"getItems\":{\"19\":30},\"limitNum\":40,\"limitLvl\":[151,199]},\r\n{\"desc\":\"兑换神之金属\",\"needItems\":{\"100271\":100},\"getItems\":{\"19\":100},\"limitNum\":40,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]},\r\n{\"desc\":\"兑换玛娜之心\",\"needItems\":{\"100270\":20},\"getItems\":{\"18\":1000},\"limitNum\":60,\"limitLvl\":[0,150]},\r\n{\"desc\":\"兑换玛娜之心\",\"needItems\":{\"100270\":60},\"getItems\":{\"18\":3000},\"limitNum\":60,\"limitLvl\":[151,199]},\r\n{\"desc\":\"兑换玛娜之心\",\"needItems\":{\"100270\":200},\"getItems\":{\"18\":10000},\"limitNum\":60,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]},\r\n{\"desc\":\"兑换贤者之石\",\"needItems\":{\"1500312\":10},\"getItems\":{\"1500310\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]},\r\n{\"desc\":\"兑换神之金属\",\"needItems\":{\"1500312\":1},\"getItems\":{\"19\":15},\"limitNum\":999,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]}\r\n]', null, '', '', '', null, '1', '40', '{\"1\":\"ico_goddrop\",\"4\":\"haidao_bg\",\"8\":30}', '0', '', '0', '七海寻宝兑换活动通用1', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100023', '收集兑换', '七海寻宝', '30', '0', '0', '2018-10-29 00:00:00', '2018-11-04 23:59:59', '[\r\n{\"desc\":\"兑换110级橙装宝箱\",\"needItems\":{\"100270\":10},\"getItems\":{\"1500313\":1},\"limitNum\":15,\"limitLvl\":[110,119]},\r\n{\"desc\":\"兑换120级橙装宝箱\",\"needItems\":{\"100270\":21},\"getItems\":{\"1500314\":1},\"limitNum\":15,\"limitLvl\":[120,129]},\r\n{\"desc\":\"兑换130级橙装宝箱\",\"needItems\":{\"100270\":32},\"getItems\":{\"1500315\":1},\"limitNum\":15,\"limitLvl\":[130,139]},\r\n{\"desc\":\"兑换140级橙装宝箱\",\"needItems\":{\"100270\":43},\"getItems\":{\"1500316\":1},\"limitNum\":15,\"limitLvl\":[140,149]},\r\n{\"desc\":\"兑换150级橙装宝箱\",\"needItems\":{\"100270\":54},\"getItems\":{\"1500317\":1},\"limitNum\":15,\"limitLvl\":[150,159]},\r\n{\"desc\":\"兑换160级橙装宝箱\",\"needItems\":{\"100270\":75},\"getItems\":{\"1500318\":1},\"limitNum\":15,\"limitLvl\":[160,169]},\r\n{\"desc\":\"兑换170级橙装宝箱\",\"needItems\":{\"100270\":97},\"getItems\":{\"1500319\":1},\"limitNum\":15,\"limitLvl\":[170,179]},\r\n{\"desc\":\"兑换180级橙装宝箱\",\"needItems\":{\"100270\":129},\"getItems\":{\"1500320\":1},\"limitNum\":15,\"limitLvl\":[180,189]},\r\n{\"desc\":\"兑换190级橙装宝箱\",\"needItems\":{\"100270\":162},\"getItems\":{\"1500321\":1},\"limitNum\":15,\"limitLvl\":[190,199]},\r\n{\"desc\":\"兑换200级橙装宝箱\",\"needItems\":{\"100270\":216},\"getItems\":{\"1500322\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[0,99]},\r\n{\"desc\":\"兑换魔导100阶橙装宝箱\",\"needItems\":{\"100270\":280},\"getItems\":{\"1500323\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[100,199]},\r\n{\"desc\":\"兑换魔导200阶橙装宝箱\",\"needItems\":{\"100270\":356},\"getItems\":{\"1500324\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[200,299]},\r\n{\"desc\":\"兑换魔导300阶橙装宝箱\",\"needItems\":{\"100270\":442},\"getItems\":{\"1500325\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[300,399]},\r\n{\"desc\":\"兑换魔导400阶橙装宝箱\",\"needItems\":{\"100270\":540},\"getItems\":{\"1500326\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[400,499]},\r\n{\"desc\":\"兑换魔导500阶橙装宝箱\",\"needItems\":{\"100270\":648},\"getItems\":{\"1500327\":1},\"limitNum\":15,\"limitLvl\":[200,200],\"limitMagicLvl\":[500,3000]},\r\n{\"desc\":\"兑换120级R红宝箱\",\"needItems\":{\"100271\":15,\"100270\":10},\"getItems\":{\"1500328\":1},\"limitNum\":7,\"limitLvl\":[120,139]},\r\n{\"desc\":\"兑换130级R红宝箱\",\"needItems\":{\"100271\":22,\"100270\":16},\"getItems\":{\"1500329\":1},\"limitNum\":7,\"limitLvl\":[130,149]},\r\n{\"desc\":\"兑换140级R红宝箱\",\"needItems\":{\"100271\":30,\"100270\":21},\"getItems\":{\"1500330\":1},\"limitNum\":7,\"limitLvl\":[140,159]},\r\n{\"desc\":\"兑换150级R红宝箱\",\"needItems\":{\"100271\":37,\"100270\":27},\"getItems\":{\"1500331\":1},\"limitNum\":7,\"limitLvl\":[150,169]},\r\n{\"desc\":\"兑换160级R红宝箱\",\"needItems\":{\"100271\":52,\"100270\":37},\"getItems\":{\"1500332\":1},\"limitNum\":7,\"limitLvl\":[160,179]},\r\n{\"desc\":\"兑换170级R红宝箱\",\"needItems\":{\"100271\":67,\"100270\":48},\"getItems\":{\"1500333\":1},\"limitNum\":7,\"limitLvl\":[170,189]},\r\n{\"desc\":\"兑换180级R红宝箱\",\"needItems\":{\"100271\":90,\"100270\":64},\"getItems\":{\"1500334\":1},\"limitNum\":7,\"limitLvl\":[180,199]},\r\n{\"desc\":\"兑换190级R红宝箱\",\"needItems\":{\"100271\":112,\"100270\":81},\"getItems\":{\"1500335\":1},\"limitNum\":7,\"limitLvl\":[190,200],\"limitMagicLvl\":[0,99]},\r\n{\"desc\":\"兑换200级R红宝箱\",\"needItems\":{\"100271\":150,\"100270\":108},\"getItems\":{\"1500336\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[0,199]},\r\n{\"desc\":\"兑换魔导100阶R红宝箱\",\"needItems\":{\"100271\":195,\"100270\":140},\"getItems\":{\"1500337\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[100,299]},\r\n{\"desc\":\"兑换魔导200阶R红宝箱\",\"needItems\":{\"100271\":247,\"100270\":178},\"getItems\":{\"1500338\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[200,399]},\r\n{\"desc\":\"兑换魔导300阶R红宝箱\",\"needItems\":{\"100271\":307,\"100270\":221},\"getItems\":{\"1500339\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[300,499]},\r\n{\"desc\":\"兑换魔导400阶R红宝箱\",\"needItems\":{\"100271\":375,\"100270\":270},\"getItems\":{\"1500340\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[400,599]},\r\n{\"desc\":\"兑换魔导500阶R红宝箱\",\"needItems\":{\"100271\":450,\"100270\":324},\"getItems\":{\"1500341\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[500,3000]},\r\n{\"desc\":\"兑换120级S红宝箱\",\"needItems\":{\"100272\":12,\"100270\":10},\"getItems\":{\"1500342\":1},\"limitNum\":2,\"limitLvl\":[120,149]},\r\n{\"desc\":\"兑换130级S红宝箱\",\"needItems\":{\"100272\":17,\"100270\":16},\"getItems\":{\"1500343\":1},\"limitNum\":2,\"limitLvl\":[130,159]},\r\n{\"desc\":\"兑换140级S红宝箱\",\"needItems\":{\"100272\":24,\"100270\":21},\"getItems\":{\"1500344\":1},\"limitNum\":2,\"limitLvl\":[140,169]},\r\n{\"desc\":\"兑换150级S红宝箱\",\"needItems\":{\"100272\":30,\"100270\":27},\"getItems\":{\"1500345\":1},\"limitNum\":2,\"limitLvl\":[150,179]},\r\n{\"desc\":\"兑换160级S红宝箱\",\"needItems\":{\"100272\":41,\"100270\":37},\"getItems\":{\"1500346\":1},\"limitNum\":2,\"limitLvl\":[160,189]},\r\n{\"desc\":\"兑换170级S红宝箱\",\"needItems\":{\"100272\":54,\"100270\":48},\"getItems\":{\"1500347\":1},\"limitNum\":2,\"limitLvl\":[170,199]},\r\n{\"desc\":\"兑换180级S红宝箱\",\"needItems\":{\"100272\":71,\"100270\":64},\"getItems\":{\"1500348\":1},\"limitNum\":2,\"limitLvl\":[180,200],\"limitMagicLvl\":[0,99]},\r\n{\"desc\":\"兑换190级S红宝箱\",\"needItems\":{\"100272\":90,\"100270\":81},\"getItems\":{\"1500349\":1},\"limitNum\":2,\"limitLvl\":[190,200],\"limitMagicLvl\":[0,199]},\r\n{\"desc\":\"兑换200级S红宝箱\",\"needItems\":{\"100272\":120,\"100270\":108},\"getItems\":{\"1500350\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[0,299]},\r\n{\"desc\":\"兑换魔导100阶S红宝箱\",\"needItems\":{\"100272\":156,\"100270\":140},\"getItems\":{\"1500351\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[100,399]},\r\n{\"desc\":\"兑换魔导200阶S红宝箱\",\"needItems\":{\"100272\":197,\"100270\":178},\"getItems\":{\"1500352\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[200,499]},\r\n{\"desc\":\"兑换魔导300阶S红宝箱\",\"needItems\":{\"100272\":245,\"100270\":221},\"getItems\":{\"1500353\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[300,599]},\r\n{\"desc\":\"兑换魔导400阶S红宝箱\",\"needItems\":{\"100272\":300,\"100270\":270},\"getItems\":{\"1500354\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[400,699]},\r\n{\"desc\":\"兑换魔导500阶S红宝箱\",\"needItems\":{\"100272\":360,\"100270\":324},\"getItems\":{\"1500355\":1},\"limitNum\":2,\"limitLvl\":[200,200],\"limitMagicLvl\":[500,3000]},\r\n{\"desc\":\"兑换神秘宝石袋\",\"needItems\":{\"100272\":5},\"getItems\":{\"1434\":1},\"limitNum\":20,\"limitLvl\":[0,150]},\r\n{\"desc\":\"兑换神秘宝石袋\",\"needItems\":{\"100272\":15},\"getItems\":{\"1434\":3},\"limitNum\":20,\"limitLvl\":[151,199]},\r\n{\"desc\":\"兑换神秘宝石袋\",\"needItems\":{\"100272\":40},\"getItems\":{\"1434\":8},\"limitNum\":20,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]},\r\n{\"desc\":\"兑换神之金属\",\"needItems\":{\"100271\":10},\"getItems\":{\"19\":10},\"limitNum\":40,\"limitLvl\":[0,150]},\r\n{\"desc\":\"兑换神之金属\",\"needItems\":{\"100271\":30},\"getItems\":{\"19\":30},\"limitNum\":40,\"limitLvl\":[151,199]},\r\n{\"desc\":\"兑换神之金属\",\"needItems\":{\"100271\":100},\"getItems\":{\"19\":100},\"limitNum\":40,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]},\r\n{\"desc\":\"兑换玛娜之心\",\"needItems\":{\"100270\":20},\"getItems\":{\"18\":1000},\"limitNum\":60,\"limitLvl\":[0,150]},\r\n{\"desc\":\"兑换玛娜之心\",\"needItems\":{\"100270\":60},\"getItems\":{\"18\":3000},\"limitNum\":60,\"limitLvl\":[151,199]},\r\n{\"desc\":\"兑换玛娜之心\",\"needItems\":{\"100270\":200},\"getItems\":{\"18\":10000},\"limitNum\":60,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]},\r\n{\"desc\":\"兑换贤者之石\",\"needItems\":{\"1500312\":10},\"getItems\":{\"1500310\":1},\"limitNum\":7,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]},\r\n{\"desc\":\"兑换神之金属\",\"needItems\":{\"1500312\":1},\"getItems\":{\"19\":15},\"limitNum\":999,\"limitLvl\":[200,200],\"limitMagicLvl\":[1,3000]}\r\n]', null, '', '', '', null, '1', '40', '{\"1\":\"ico_goddrop\",\"4\":\"haidao_bg\",\"8\":30}', '0', '', '0', '七海寻宝兑换活动通用1', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100024', '收集兑换', '天降之物', '30', '0', '0', '2018-10-29 00:00:00', '2018-11-04 23:59:59', '[\r\n{\"desc\":\"收集白色羽毛\",\"needItems\":{\"1500104\":10},\"getItems\":{\"18\":100},\"limitNum\":999},\r\n{\"desc\":\"收集金色羽毛\",\"needItems\":{\"1500105\":10},\"getItems\":{\"30\":40},\"limitNum\":99},\r\n{\"desc\":\"收集红色羽毛\",\"needItems\":{\"1500106\":5},\"getItems\":{\"1550\":50},\"limitNum\":99},\r\n{\"desc\":\"收集白金红三色羽毛\",\"needItems\":{\"1500104\":3,\"1500105\":1,\"1500106\":1},\"getItems\":{\"53\":5},\"limitNum\":99},\r\n{\"desc\":\"收集白红彩虹三色羽毛\",\"needItems\":{\"1500104\":3,\"1500106\":1,\"1500107\":1},\"getItems\":{\"100219\":5},\"limitNum\":35},\r\n{\"desc\":\"收集金红黑三色羽毛\",\"needItems\":{\"1500105\":3,\"1500106\":1,\"1500108\":1},\"getItems\":{\"2050\":1},\"limitNum\":20}\r\n]', null, '', '[430002,[1500104, 1500105,1500106,1500107,1500108]]', '', null, '1', '0', '{\"1\":\"ico_goddrop\",\"4\":\"tjzw_bg\",\"8\":30}', '0', '', '0', '天降之物通用1', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100025', '女子宿舍的每日巡查', '女子宿舍的每日巡查', '2', '0', '0', '2018-10-29 00:00:00', '2018-11-04 23:59:59', '[\r\n{\"2008\":1,\"52\":100,\"200\":100},\r\n{\"100219\":10,\"56\":1000,\"200\":100},\r\n{\"2008\":1,\"52\":100,\"200\":100},\r\n{\"2008\":1,\"52\":100,\"200\":100},\r\n{\"2\":2,\"8\":2,\"2013\":1},\r\n{\"1551\":30,\"200\":500,\"2013\":1},\r\n{\"2007\":50,\"200\":500,\"2013\":1}\r\n]', null, '', '', '', null, '1', '50', '{\"2\":\"nzss\",\"4\":\"everyDayGirl\"}', '0', '', '0', '女子宿舍的每日巡查', '', '0');
INSERT INTO `uw_public_activity` VALUES ('100026', '女神的私人报答', '女神的私人报答', '51', '0', '0', '2018-10-26 00:00:00', '2018-10-26 23:59:59', '[\r\n1500231,\r\n1500232,\r\n1500233,\r\n1500234,\r\n1500235\r\n]', null, '[6,30,60,98,198]', '', '', null, '1', '100', '{\"2\":\"nvshen2_bg\",\"4\":\"nvshen_bg\"}', '0', '', '0', '累计充值女神的私人报答通用1', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100027', '克里斯汀的黑色魔导', '克里斯汀的黑色魔导', '51', '0', '0', '2018-11-02 00:00:00', '2018-11-02 23:59:59', '[\r\n1500221,\r\n1500222,\r\n1500223,\r\n1500224,\r\n1500225\r\n]', null, '[6,30,60,98,198]', '', '', null, '1', '100', '{\"2\":\"hmds2_bg\",\"4\":\"hmds_bg\"}', '0', '', '0', '累计充值克里斯汀的黑色魔导', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100028', '屠龙远征', '屠龙远征', '63', '0', '0', '2018-10-26 00:00:00', '2018-10-28 23:59:59', '[\r\n{\"desc\":\"狩猎巨龙之鳞\",\"needItems\":{\"1500101\":1},\"getItems\":{\"53\":18},\"limitNum\":10},\r\n{\"desc\":\"狩猎巨龙之爪\",\"needItems\":{\"1500102\":1},\"getItems\":{\"1551\":20},\"limitNum\":10},\r\n{\"desc\":\"狩猎巨龙之鳞,巨龙之爪\",\"needItems\":{\"1500101\":1,\"1500102\":1},\"getItems\":{\"946\":1},\"limitNum\":5},\r\n{\"desc\":\"狩猎巨龙之心\",\"needItems\":{\"1500101\":2,\"1500102\":2,\"1500103\":1},\"getItems\":{\"943\":1},\"limitNum\":5}\r\n]', null, '', '', '', null, '1', '21', '{\"1\":\"dragonSkill_ico\",\"8\":80}', '0', '', '0', '屠龙远征', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100029', '屠龙远征', '屠龙远征', '63', '0', '0', '2018-11-02 00:00:00', '2018-11-04 23:59:59', '[\r\n{\"desc\":\"狩猎巨龙之鳞\",\"needItems\":{\"1500101\":1},\"getItems\":{\"53\":18},\"limitNum\":10},\r\n{\"desc\":\"狩猎巨龙之爪\",\"needItems\":{\"1500102\":1},\"getItems\":{\"1551\":20},\"limitNum\":10},\r\n{\"desc\":\"狩猎巨龙之鳞,巨龙之爪\",\"needItems\":{\"1500101\":1,\"1500102\":1},\"getItems\":{\"946\":1},\"limitNum\":5},\r\n{\"desc\":\"狩猎巨龙之心\",\"needItems\":{\"1500101\":2,\"1500102\":2,\"1500103\":1},\"getItems\":{\"943\":1},\"limitNum\":5}\r\n]', null, '', '', '', null, '1', '21', '{\"1\":\"dragonSkill_ico\",\"8\":80}', '0', '', '0', '屠龙远征', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100030', '梦境魔法', '梦境魔法', '66', '0', '0', '2018-10-26 00:00:00', '2018-10-28 23:59:59', '[]', null, '{\"5\":{\"1\":2,\"3\":2},\"6\":{\"12\":2,\"13\":2,\"14\":2,\"15\":2,\"16\":2,\"17\":2},\"0\":{\"18\":2}}', '', '', null, '1', '22', '{\"1\":\"dreamMagic\",\"8\":50}', '0', '', '0', '梦境魔法', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100031', '梦境魔法', '梦境魔法', '66', '0', '0', '2018-11-02 00:00:00', '2018-11-04 23:59:59', '[]', null, '{\"5\":{\"1\":2,\"3\":2},\"6\":{\"12\":2,\"13\":2,\"14\":2,\"15\":2,\"16\":2,\"17\":2},\"0\":{\"18\":2}}', '', '', null, '1', '22', '{\"1\":\"dreamMagic\",\"8\":50}', '0', '', '0', '梦境魔法', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100032', '星象占卜', '遥的星象占卜', '65', '0', '0', '2018-10-26 00:00:00', '2018-10-28 23:59:59', '[]', null, '{\r\n\"1\":150,\r\n\"10\":1350,\r\n\"mustGetChestId\":100612,\r\n\"poolType\":2,\r\n\"fakeDataTypeKey\":9,\r\n\"employLogTypeKey\":5,\r\n\"showItems\":[1400010,950,100222,100240,53,1400020,1400024]\r\n}', '', '', null, '1', '500', '{\"1\":\"ico_yaodxxzp\",\"4\":\"yaodxxzp_bg\",\"8\":30,\"12\":[\"yao_text\"],\"13\":[\"占卜%s次\"],\"14\":314}', '0', '', '0', '遥的星象占卜', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100033', '星象转盘', '星象转盘', '68', '0', '0', '2018-10-26 00:00:00', '2018-10-28 23:59:59', '[\r\n{\"taskId\":15000001,\"awardNum\":1},\r\n{\"taskId\":15000002,\"awardNum\":1},\r\n{\"taskId\":15000003,\"awardNum\":1},\r\n{\"taskId\":15000005,\"awardNum\":1},\r\n{\"taskId\":15000006,\"awardNum\":1},\r\n{\"taskId\":15000004,\"awardNum\":2},\r\n{\"taskId\":15000007,\"awardNum\":2},\r\n{\"taskId\":15000011,\"awardNum\":3},\r\n{\"taskId\":15000008,\"awardNum\":3}\r\n]', null, '{\"chestId\":100501,\"price\":1}', '', '', null, '1', '400', '{\"1\":\"ico_zhuanpan\",\"8\":30}', '0', '', '0', '星象转盘', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100034', '戴安娜衣橱', '戴安娜的衣橱', '65', '0', '0', '2018-11-02 00:00:00', '2018-11-04 23:59:59', '[]', null, '{\r\n\"1\":300,\r\n\"10\":2700,\r\n\"mustGetChestId\":100611,\r\n\"poolType\":1,\r\n\"fakeDataTypeKey\":8,\r\n\"employLogTypeKey\":4,\r\n\"showItems\":[1012010,1989,1013010,1016010,1400007,1011010,1018010]\r\n}', '', '', null, '1', '500', '{\"1\":\"Diana_sign\",\"4\":\"clothes_bg\",\"8\":30,\"12\":[\"btn_streamer_10\"],\"13\":[\"换装%s次\"],\"14\":313}', '0', '', '0', '戴安娜衣橱', '', '1');
INSERT INTO `uw_public_activity` VALUES ('100035', '健身计划', '拉切尔的健身计划', '64', '0', '0', '2018-11-02 00:00:00', '2018-11-04 23:59:59', '{\r\n\"1\":{\"target\":1000,\"reward\":11200101},\r\n\"2\":{\"target\":2000,\"reward\":11200102},\r\n\"3\":{\"target\":3500,\"reward\":11200103},\r\n\"4\":{\"target\":4500,\"reward\":11200104},\r\n\"5\":{\"target\":5500,\"reward\":11200105},\r\n\"6\":{\"target\":7000,\"reward\":11200106}\r\n}', null, '[\r\n{\"taskId\":13000001,\"fitValue\":100},\r\n{\"taskId\":13000002,\"fitValue\":5},\r\n{\"taskId\":13000003,\"fitValue\":10},\r\n{\"taskId\":13000004,\"fitValue\":10},\r\n{\"taskId\":13000005,\"fitValue\":10},\r\n{\"taskId\":13000006,\"fitValue\":20},\r\n{\"taskId\":13000007,\"fitValue\":10},\r\n{\"taskId\":13000008,\"fitValue\":25},\r\n{\"taskId\":13000009,\"fitValue\":20},\r\n{\"taskId\":13000010,\"fitValue\":10},\r\n{\"taskId\":13000011,\"fitValue\":40},\r\n{\"taskId\":13000012,\"fitValue\":30},\r\n{\"taskId\":13000013,\"fitValue\":55,\"relationActId\":3005}\r\n]', '', '', null, '1', '23', '{\"1\":\"Rachel_fitness_icon\",\"4\":\"Rachel_picture2\",\"8\":50}', '0', '', '0', '拉切尔的健身计划', '', '0');

-- ----------------------------
-- Table structure for uw_recharge_request
-- ----------------------------
DROP TABLE IF EXISTS `uw_recharge_request`;
CREATE TABLE `uw_recharge_request` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `accountId` int(11) DEFAULT NULL COMMENT '账号id',
  `userId` int(11) DEFAULT NULL COMMENT '用户id',
  `serverId` int(11) DEFAULT NULL COMMENT '服务器id',
  `rechargeId` int(11) DEFAULT NULL COMMENT '充值项id',
  `status` int(11) DEFAULT '0' COMMENT '状态 0:请求 1:支付成功 2:领取钻石',
  `addTime` datetime DEFAULT NULL COMMENT '添加时间',
  `transId` varchar(50) DEFAULT NULL COMMENT '业务号',
  `goodsId` varchar(50) DEFAULT '0' COMMENT '渠道物品id',
  `orderNo` varchar(200) DEFAULT NULL COMMENT '订单号',
  `gmStatus` int(11) DEFAULT '0',
  `lvl` int(11) DEFAULT '0',
  `goodsPrice` int(11) DEFAULT '0',
  `feeMoney` int(11) DEFAULT '0',
  `channelId` varchar(32) DEFAULT NULL,
  `sdkChannelId` varchar(20) DEFAULT NULL COMMENT '子渠道id',
  PRIMARY KEY (`id`),
  KEY `uw_recharge_request_uid` (`userId`),
  KEY `uw_recharge_request_orderNo` (`orderNo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COMMENT='充值请求记录';

-- ----------------------------
-- Records of uw_recharge_request
-- ----------------------------
INSERT INTO `uw_recharge_request` VALUES ('1', '1', '2251', '1', '41', '0', '2020-03-29 19:32:49', null, '41', 'ID1T1585481569442', '0', '84', '28', '0', '10006', '10776');
INSERT INTO `uw_recharge_request` VALUES ('2', '1', '2251', '1', '2', '0', '2020-03-30 02:42:07', null, '2', 'ID2T1585507327234', '0', '60', '12', '0', '10006', '10776');

-- ----------------------------
-- Table structure for uw_servers_group
-- ----------------------------
DROP TABLE IF EXISTS `uw_servers_group`;
CREATE TABLE `uw_servers_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `type` int(11) NOT NULL COMMENT '分组类型',
  `name` varchar(100) DEFAULT NULL COMMENT '组名',
  `serverArr` text COMMENT '服务器组',
  `isDelete` int(2) NOT NULL DEFAULT '0' COMMENT '是否删除',
  `case` int(11) DEFAULT NULL COMMENT '分组方案',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8 COMMENT='服务器分组表';

-- ----------------------------
-- Records of uw_servers_group
-- ----------------------------
INSERT INTO `uw_servers_group` VALUES ('2', '1', 'chat1', '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]', '0', null);
INSERT INTO `uw_servers_group` VALUES ('3', '1', 'chat2', '[21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40]', '0', null);
INSERT INTO `uw_servers_group` VALUES ('4', '1', 'chat3', '[41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60]', '0', null);
INSERT INTO `uw_servers_group` VALUES ('5', '1', 'chat4', '[61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80]', '0', null);
INSERT INTO `uw_servers_group` VALUES ('6', '1', 'chat5', '[81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100]', '0', null);
INSERT INTO `uw_servers_group` VALUES ('7', '1', 'chat6', '[101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120]', '0', null);
INSERT INTO `uw_servers_group` VALUES ('8', '1', 'chat7', '[121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140]', '0', null);
INSERT INTO `uw_servers_group` VALUES ('9', '1', 'chat8', '[141,142,143,144,145,146,147,147,149,150,151,152,153,154,155,156,157,158,159,160]', '0', null);
INSERT INTO `uw_servers_group` VALUES ('10', '1', 'chat9', '[161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180]', '0', null);
INSERT INTO `uw_servers_group` VALUES ('11', '1', 'chat10', '[181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200]', '0', null);
INSERT INTO `uw_servers_group` VALUES ('12', '1', 'chat11', '[201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220]', '0', null);
INSERT INTO `uw_servers_group` VALUES ('13', '1', 'chat12', '[221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240]', '0', null);
INSERT INTO `uw_servers_group` VALUES ('14', '1', 'chat13', '[241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260]', '0', null);
INSERT INTO `uw_servers_group` VALUES ('15', '1', 'chat14', '[261,262,263,264,265,266,267,268,269,270]', '0', null);

-- ----------------------------
-- Table structure for uw_shop_record
-- ----------------------------
DROP TABLE IF EXISTS `uw_shop_record`;
CREATE TABLE `uw_shop_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `userId` int(11) DEFAULT NULL COMMENT '用户id',
  `userLvl` int(11) DEFAULT NULL COMMENT '用户等级',
  `userVip` int(11) DEFAULT NULL COMMENT '用户vip',
  `costGold` int(11) DEFAULT NULL COMMENT '消耗金币',
  `shopType` int(4) DEFAULT NULL COMMENT '商店类型',
  `costDiamond` int(11) DEFAULT NULL COMMENT '消耗元宝',
  `buyItemId` int(11) DEFAULT NULL COMMENT '购买物品',
  `buyAmount` int(11) DEFAULT NULL COMMENT '购买数量',
  `buyTime` datetime DEFAULT NULL COMMENT '购买时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='游戏-商店购买记录';

-- ----------------------------
-- Records of uw_shop_record
-- ----------------------------

-- ----------------------------
-- Table structure for uw_system_message
-- ----------------------------
DROP TABLE IF EXISTS `uw_system_message`;
CREATE TABLE `uw_system_message` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `serverId` int(11) DEFAULT '0' COMMENT '默认为0，所有服务器',
  `message` varchar(255) NOT NULL COMMENT '公告内容',
  `type` tinyint(4) NOT NULL DEFAULT '1' COMMENT '公告类型： \n1 marquee 跑马灯公告\n2 即时公告',
  `color` varchar(45) DEFAULT '#000000' COMMENT '字体颜色',
  `size` int(11) DEFAULT '16' COMMENT '字体大小',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '状态0未发送，1已发送',
  `times` int(11) DEFAULT '1' COMMENT '显示次数',
  `interval` int(11) DEFAULT '60' COMMENT '间隔时间秒为单位',
  `sendTime` datetime DEFAULT NULL,
  `expireTime` datetime DEFAULT NULL,
  `createTime` datetime DEFAULT NULL,
  `lastUpdateTime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of uw_system_message
-- ----------------------------
INSERT INTO `uw_system_message` VALUES ('1', '0', '【系统公告】服务器预计将于今晨9:20停服更新，预计持续时间30分钟，我们将带着惊喜奖励欢迎您归来', '1', '#ffffff', '18', '0', '30', '30', '2018-07-13 09:15:13', '2018-07-13 09:25:22', null, null);
INSERT INTO `uw_system_message` VALUES ('2', '0', '【系统公告】服务器预计将于今日稍后23:40停服更新优化游戏性能，预计持续时间20分钟，我们将带着惊喜奖励欢迎您归来', '1', '#ffffff', '18', '0', '10', '30', '2018-07-17 23:37:53', '2018-07-17 23:42:55', null, null);
INSERT INTO `uw_system_message` VALUES ('15', '0', '【系统公告】服务器预计将于今日稍后23:30停服更新优化游戏性能，预计持续时间10分钟，我们将带着惊喜奖励欢迎您归来', '1', '#ffffff', '18', '0', '20', '30', '2018-07-21 23:19:21', '2018-07-21 23:40:23', null, null);
INSERT INTO `uw_system_message` VALUES ('16', '0', '【系统公告】服务器预计将于今日稍后23:20停服更新优化游戏性能，预计持续时间10分钟，我们将带着惊喜奖励欢迎您归来', '1', '#ffffff', '18', '0', '20', '30', '2018-07-23 23:12:08', '2018-07-23 23:23:54', null, null);
INSERT INTO `uw_system_message` VALUES ('18', '0', '【系统公告】服务器预计将于今日稍后12:40停服更新BOSS无法打的bug，预计持续时间10分钟，我们将带着惊喜奖励欢迎您归来', '1', '#FF0000', '18', '0', '5', '30', '2018-07-29 12:31:40', '2018-07-29 12:39:40', null, null);
INSERT INTO `uw_system_message` VALUES ('19', '0', '服务器预计将于今日稍后17:00停服更新预计持续时间60分钟.', '1', '#FF0000', '18', '0', '20', '30', '2018-09-04 16:54:38', '2018-09-04 17:00:38', null, null);
INSERT INTO `uw_system_message` VALUES ('20', '0', '亲爱的玩家，我们将于14:00紧急更新修复充值无法到账问题，更新时间预计20分钟。', '1', '#FF0000', '18', '0', '100', '60', '2018-09-05 12:08:12', '2018-09-05 14:00:00', null, null);

-- ----------------------------
-- Table structure for uw_usersurvey_record
-- ----------------------------
DROP TABLE IF EXISTS `uw_usersurvey_record`;
CREATE TABLE `uw_usersurvey_record` (
  `id` int(11) NOT NULL COMMENT '序号',
  `serverId` int(11) NOT NULL COMMENT '服务器id',
  `userId` int(11) DEFAULT NULL COMMENT '用户id',
  `userLvl` int(11) DEFAULT NULL COMMENT '用户等级',
  `userVip` int(11) DEFAULT NULL COMMENT '用户vip等级',
  `activityId` int(11) DEFAULT NULL COMMENT '活动id',
  `questionId` int(11) DEFAULT NULL COMMENT '题目id',
  `selectIndex` int(4) DEFAULT NULL COMMENT '玩家选择',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='主-用户调研(UserSurveyEntity)';

-- ----------------------------
-- Records of uw_usersurvey_record
-- ----------------------------

-- ----------------------------
-- Table structure for uw_worldboss_record
-- ----------------------------
DROP TABLE IF EXISTS `uw_worldboss_record`;
CREATE TABLE `uw_worldboss_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `battleId` int(11) DEFAULT NULL COMMENT '战斗ID',
  `bossId` int(11) DEFAULT NULL COMMENT 'bossId',
  `resultData` text,
  `recordTime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bid` (`battleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of uw_worldboss_record
-- ----------------------------
