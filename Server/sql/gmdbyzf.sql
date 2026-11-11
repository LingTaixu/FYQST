/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50726
Source Host           : :3306
Source Database       : gmdbyzf

Target Server Type    : MYSQL
Target Server Version : 50726
File Encoding         : 65001

Date: 2020-03-31 01:27:29
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for cdkey
-- ----------------------------
DROP TABLE IF EXISTS `cdkey`;
CREATE TABLE `cdkey` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cdkey` varchar(1000) NOT NULL COMMENT 'cdk',
  `status` varchar(100) NOT NULL COMMENT '权限',
  `isuse` varchar(100) DEFAULT NULL COMMENT '使用状态',
  `qu` int(11) DEFAULT NULL COMMENT '分区',
  `binduser` varchar(100) DEFAULT NULL COMMENT '账号绑定',
  `create_time` datetime DEFAULT NULL COMMENT '账号绑定时间',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of cdkey
-- ----------------------------

-- ----------------------------
-- Table structure for gmlog
-- ----------------------------
DROP TABLE IF EXISTS `gmlog`;
CREATE TABLE `gmlog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(100) NOT NULL COMMENT '用户',
  `create_time` datetime NOT NULL COMMENT '时间',
  `name` varchar(100) DEFAULT NULL COMMENT '游戏账号',
  `remark` varchar(1000) NOT NULL COMMENT '备注',
  `ip` varchar(100) NOT NULL COMMENT 'ip地址',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of gmlog
-- ----------------------------

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(100) NOT NULL COMMENT '用户',
  `password` varchar(40) NOT NULL COMMENT '密码',
  `name` varchar(100) DEFAULT NULL COMMENT '游戏账号',
  `status` varchar(100) NOT NULL COMMENT '权限',
  `qu` int(11) NOT NULL COMMENT '分区',
  `roleid` varchar(100) DEFAULT NULL COMMENT '角色id',
  `endtime` datetime DEFAULT NULL COMMENT '有效期',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('1', 'admin', '123456', null, 'admin', '1', '', '2019-08-02 09:02:12');
