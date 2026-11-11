/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50726
Source Host           : :3306
Source Database       : ttf_ly_gamelog

Target Server Type    : MYSQL
Target Server Version : 50726
File Encoding         : 65001

Date: 2020-03-31 01:27:48
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for boss_log
-- ----------------------------
DROP TABLE IF EXISTS `boss_log`;
CREATE TABLE `boss_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `server_id` int(11) DEFAULT NULL,
  `boss_id` int(11) DEFAULT NULL,
  `boss_type` int(11) DEFAULT NULL,
  `born_time` bigint(20) DEFAULT NULL,
  `first_fight_time` bigint(20) DEFAULT NULL,
  `max_combat` bigint(20) DEFAULT NULL,
  `dead_time` bigint(20) DEFAULT NULL,
  `end_time` bigint(20) DEFAULT NULL,
  `kill_num` int(11) DEFAULT NULL,
  `user_num` int(11) DEFAULT NULL,
  `rtime` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of boss_log
-- ----------------------------

-- ----------------------------
-- Table structure for buy_log
-- ----------------------------
DROP TABLE IF EXISTS `buy_log`;
CREATE TABLE `buy_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `server_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `lvl` int(11) DEFAULT NULL,
  `shop_type` int(11) DEFAULT NULL,
  `currency_type` int(11) DEFAULT NULL,
  `currency_num` int(11) DEFAULT NULL,
  `goods_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `item_name` varchar(48) DEFAULT NULL,
  `item_num` int(11) DEFAULT NULL,
  `rtime` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `channel_id` varchar(32) DEFAULT NULL,
  `sdk_channel_id` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of buy_log
-- ----------------------------

-- ----------------------------
-- Table structure for chat_log
-- ----------------------------
DROP TABLE IF EXISTS `chat_log`;
CREATE TABLE `chat_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `server_id` int(11) DEFAULT NULL,
  `account_id` int(11) DEFAULT NULL,
  `account` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `nick_name` varchar(255) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `rtime` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of chat_log
-- ----------------------------

-- ----------------------------
-- Table structure for gameinstall_log
-- ----------------------------
DROP TABLE IF EXISTS `gameinstall_log`;
CREATE TABLE `gameinstall_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `account_name` varchar(64) DEFAULT NULL,
  `user_level` varchar(11) DEFAULT NULL,
  `install_step` varchar(4) DEFAULT NULL,
  `install_step_name` varchar(64) DEFAULT NULL,
  `channel_id` varchar(32) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `ip` varchar(64) DEFAULT NULL,
  `rtime` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of gameinstall_log
-- ----------------------------

-- ----------------------------
-- Table structure for lostbi_log
-- ----------------------------
DROP TABLE IF EXISTS `lostbi_log`;
CREATE TABLE `lostbi_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `data` blob,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of lostbi_log
-- ----------------------------

-- ----------------------------
-- Table structure for lottery_log
-- ----------------------------
DROP TABLE IF EXISTS `lottery_log`;
CREATE TABLE `lottery_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `server_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `lvl` int(11) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `lottery_num` int(11) DEFAULT NULL,
  `cost_item_num` int(11) DEFAULT NULL,
  `cost_score` int(11) DEFAULT NULL,
  `data` varchar(256) DEFAULT NULL,
  `rtime` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `channel_id` varchar(32) DEFAULT NULL,
  `sdk_channel_id` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of lottery_log
-- ----------------------------

-- ----------------------------
-- Table structure for openserverrank_log
-- ----------------------------
DROP TABLE IF EXISTS `openserverrank_log`;
CREATE TABLE `openserverrank_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `server_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `lvl` int(11) DEFAULT NULL,
  `regTime` bigint(20) DEFAULT NULL,
  `pay_total` int(11) DEFAULT NULL,
  `rank_score` int(11) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `day_num` int(11) DEFAULT NULL,
  `data` varchar(256) DEFAULT NULL,
  `rtime` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of openserverrank_log
-- ----------------------------

-- ----------------------------
-- Table structure for register_log
-- ----------------------------
DROP TABLE IF EXISTS `register_log`;
CREATE TABLE `register_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `server_id` int(11) DEFAULT NULL,
  `channel_id` varchar(32) DEFAULT NULL,
  `sdk_channel_id` varchar(32) DEFAULT NULL,
  `open_id` varchar(64) DEFAULT NULL,
  `account_id` int(11) DEFAULT NULL,
  `ip` varchar(32) DEFAULT NULL,
  `rtime` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of register_log
-- ----------------------------

-- ----------------------------
-- Table structure for reward_log
-- ----------------------------
DROP TABLE IF EXISTS `reward_log`;
CREATE TABLE `reward_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `server_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `lvl` int(11) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `reward_id` int(11) DEFAULT NULL,
  `data` varchar(256) DEFAULT NULL,
  `rtime` bigint(20) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `channel_id` varchar(32) DEFAULT NULL,
  `sdk_channel_id` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of reward_log
-- ----------------------------
