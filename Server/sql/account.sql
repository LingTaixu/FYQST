/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50726
Source Host           : :3306
Source Database       : account

Target Server Type    : MYSQL
Target Server Version : 50726
File Encoding         : 65001

Date: 2020-03-31 01:27:23
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for account
-- ----------------------------
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(255) NOT NULL,
  `pass` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of account
-- ----------------------------
INSERT INTO `account` VALUES ('1', '52gmsy', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO `account` VALUES ('2', '52gmsy1', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO `account` VALUES ('3', '52gmsy3', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO `account` VALUES ('4', '52gmsy2', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO `account` VALUES ('5', '52gmsy4', 'e10adc3949ba59abbe56e057f20f883e');
