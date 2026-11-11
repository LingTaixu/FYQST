/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50726
Source Host           : :3306
Source Database       : ttf_ly_login

Target Server Type    : MYSQL
Target Server Version : 50726
File Encoding         : 65001

Date: 2020-03-31 01:27:54
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for uw_account
-- ----------------------------
DROP TABLE IF EXISTS `uw_account`;
CREATE TABLE `uw_account` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `name` varchar(128) DEFAULT NULL COMMENT '账号名',
  `email` varchar(64) DEFAULT NULL COMMENT '邮箱',
  `pwd` varchar(64) DEFAULT NULL COMMENT '密码',
  `deviceId` varchar(100) DEFAULT NULL COMMENT '机器码，设备唯一号',
  `status` int(2) DEFAULT '0' COMMENT '账号状态  0正常 ，1普通封号，2设备封号',
  `channelId` int(11) DEFAULT '0' COMMENT '渠道id',
  `sdkData` text COMMENT 'sdk数据',
  `exData` text COMMENT '扩展数据',
  `createTime` datetime DEFAULT NULL COMMENT '创建时间',
  `createIP` varchar(50) DEFAULT NULL COMMENT '创建ip',
  `lastUpdateTime` datetime DEFAULT NULL COMMENT '最后修改时间',
  `loginCount` int(11) DEFAULT '0',
  `loginKey` varchar(500) DEFAULT NULL COMMENT '登陆值',
  `userServers` text COMMENT '有角色的服务器组',
  `rechargeCom` varchar(100) DEFAULT NULL COMMENT '充值补偿',
  `sdkChannelId` varchar(20) DEFAULT NULL COMMENT 'sdk渠道号',
  `bendExpireAt` datetime DEFAULT NULL COMMENT '禁言过期时间',
  `bendType` int(11) DEFAULT '0' COMMENT '禁言类型，第一位为普通',
  PRIMARY KEY (`id`),
  KEY `uw_account_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COMMENT='游戏-账号';

-- ----------------------------
-- Records of uw_account
-- ----------------------------
INSERT INTO `uw_account` VALUES ('1', '52gmsy', null, '7b4419ad754e67ec366c7cd4e6b6eb40', 'device1585461418620', '0', '10006', '{\"id\":\"52gmsy\",\"open_id\":\"52gmsy\",\"channelid\":\"10776\",\"sdkname\":\"acfun\",\"channel\":\"h5_acfun\"}', '{\"1\":1}', '2020-03-29 18:53:18', null, '2020-03-29 18:53:18', '38', '[\"ogtelqktaggknmfi\",\"hgbwfaztqjozomuy\",\"gntgrzjjjjimzyyb\"]', '[\"1\"]', '[]', '10776', null, '0');
INSERT INTO `uw_account` VALUES ('2', '52gmsy1', null, '5ce26389b5eec11c3dc58fe0217632be', 'device1585461418620', '0', '10006', '{\"id\":\"52gmsy1\",\"open_id\":\"52gmsy1\",\"channelid\":\"10776\",\"sdkname\":\"acfun\",\"channel\":\"h5_acfun\"}', '{\"1\":\"1\"}', '2020-03-29 20:43:13', null, '2020-03-29 20:43:13', '9', '[\"kujqfjnxbsygdjkw\",\"adirmwromcfuvrof\",\"firjpgdbwxtcbeyl\"]', '[\"1\"]', '[]', '10776', null, '0');
INSERT INTO `uw_account` VALUES ('3', '52gmsy3', null, '870c15669a175c20ef7b61c35933ee53', 'device1585461418620', '0', '10006', '{\"id\":\"52gmsy3\",\"open_id\":\"52gmsy3\",\"channelid\":\"10776\",\"sdkname\":\"acfun\",\"channel\":\"h5_acfun\"}', '{\"1\":1}', '2020-03-29 20:44:02', null, '2020-03-29 20:44:02', '6', '[\"eskeyqekxjtemdxg\",\"slboupjuhbcqnjfm\",\"eunqronsgqbroyor\"]', '[\"1\"]', '[]', '10776', null, '0');
INSERT INTO `uw_account` VALUES ('4', '52gmsy2', null, 'e97b33c34d263823c61372d94f0f646f', 'device1585461418620', '0', '10006', '{\"id\":\"52gmsy2\",\"open_id\":\"52gmsy2\",\"channelid\":\"10776\",\"sdkname\":\"acfun\",\"channel\":\"h5_acfun\"}', '{\"1\":1}', '2020-03-30 01:49:31', null, '2020-03-30 01:49:31', '7', '[\"mwygmnhqkscerrcn\",\"dlimympjwwsxobqa\",\"ifzmpbmksgkxdyqb\"]', '[\"1\"]', '[]', '10776', null, '0');
INSERT INTO `uw_account` VALUES ('5', '52gmsy4', null, 'd35336b6bb66f544d20edb7c8e55569c', 'device1585461418620', '0', '10006', '{\"id\":\"52gmsy4\",\"open_id\":\"52gmsy4\",\"channelid\":\"10776\",\"sdkname\":\"acfun\",\"channel\":\"h5_acfun\"}', '{\"1\":\"1\"}', '2020-03-30 02:22:30', null, '2020-03-30 02:22:30', '3', '[\"zdywgjogybksavca\",\"vgwzdpyvjgpiwoya\",\"ccgessjfzsajruaq\"]', '[\"1\"]', '[]', '10776', null, '0');

-- ----------------------------
-- Table structure for uw_click_account
-- ----------------------------
DROP TABLE IF EXISTS `uw_click_account`;
CREATE TABLE `uw_click_account` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `channelId` int(11) NOT NULL,
  `openId` varchar(50) DEFAULT NULL COMMENT '账号名',
  `sdkData` text COMMENT 'sdk数据',
  `url` text COMMENT '登录url',
  `createTime` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `openId` (`openId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of uw_click_account
-- ----------------------------

-- ----------------------------
-- Table structure for uw_server_info
-- ----------------------------
DROP TABLE IF EXISTS `uw_server_info`;
CREATE TABLE `uw_server_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `name` varchar(32) DEFAULT NULL,
  `area` varchar(32) DEFAULT NULL COMMENT '游戏区',
  `mergerName` varchar(100) DEFAULT NULL COMMENT '合服后的名字',
  `host` varchar(100) DEFAULT NULL COMMENT '服务器ip',
  `port` varchar(10) DEFAULT NULL COMMENT '端口',
  `isNew` int(1) DEFAULT '1' COMMENT '是否是新区',
  `status` int(1) DEFAULT '1' COMMENT '状态:\n            1:良好，2:正常，3:爆满',
  `dbLink` varchar(200) DEFAULT NULL COMMENT '数据库链接字符串',
  `sort` int(6) DEFAULT '0' COMMENT '排序',
  `appId` varchar(50) DEFAULT NULL,
  `serverId` int(11) DEFAULT NULL COMMENT '服务器id',
  `indexId` int(11) DEFAULT NULL COMMENT '客户端索引id',
  `isClose` int(2) DEFAULT '0' COMMENT '是否维护',
  `closeExplain` varchar(100) DEFAULT NULL COMMENT '维护说明',
  `serverDate` datetime DEFAULT NULL COMMENT '开服时间',
  `outLink` varchar(200) DEFAULT NULL,
  `host2` varchar(100) DEFAULT NULL COMMENT 'ws服务器ip',
  `port2` varchar(10) DEFAULT NULL COMMENT 'ws服务器port',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='服务器信息表。用于管理服务器信息。';

-- ----------------------------
-- Records of uw_server_info
-- ----------------------------
INSERT INTO `uw_server_info` VALUES ('1', '骑士一区', '1区', '', '101.43.194.154', '20001', '0', '2', 'server=127.0.0.1;database=ttf_ly_game1;uid=root;pwd=pwd123456;charset=utf8;port=3306', '1', '', '1', '1', '0', '', '2019-07-20 10:00:00', '', '101.43.194.154', '10001');
