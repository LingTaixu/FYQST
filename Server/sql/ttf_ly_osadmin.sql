/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50726
Source Host           : :3306
Source Database       : ttf_ly_osadmin

Target Server Type    : MYSQL
Target Server Version : 50726
File Encoding         : 65001

Date: 2020-03-31 01:28:07
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for check_mail
-- ----------------------------
DROP TABLE IF EXISTS `check_mail`;
CREATE TABLE `check_mail` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号',
  `userId` int(11) DEFAULT NULL COMMENT '用户id',
  `type` int(4) DEFAULT NULL COMMENT '类型',
  `platform` varchar(50) DEFAULT NULL COMMENT '平台',
  `serverId` int(11) DEFAULT '0' COMMENT '区服',
  `fromName` varchar(50) DEFAULT NULL COMMENT '发送者',
  `title` varchar(50) DEFAULT NULL COMMENT '标题',
  `content` text COMMENT '内容',
  `replaceArgs` varchar(100) DEFAULT NULL COMMENT '替换值',
  `items` text COMMENT '附件物品',
  `isPicked` int(2) DEFAULT '0' COMMENT '是否提取物品',
  `isRead` int(2) DEFAULT '0' COMMENT '是否阅读',
  `delHours` int(6) DEFAULT NULL COMMENT '操作后几小时删除',
  `delTime` datetime DEFAULT NULL COMMENT '删除时间',
  `expireTime` datetime DEFAULT NULL COMMENT '过期时间',
  `addTime` datetime DEFAULT NULL COMMENT '添加时间',
  `isDelete` int(2) DEFAULT '0',
  `taskId` int(11) NOT NULL DEFAULT '0',
  `isChecked` int(2) DEFAULT '0' COMMENT '是否通过审核',
  `nickName` varchar(50) DEFAULT NULL COMMENT '昵称',
  PRIMARY KEY (`id`),
  KEY `uw_mail_uid` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COMMENT='邮件';

-- ----------------------------
-- Records of check_mail
-- ----------------------------
INSERT INTO `check_mail` VALUES ('1', '2252', '0', '10006', '1', '', 'test', 'test1', '[]', '{\"2\":99,\"3\":99}', '0', '0', '24', null, '2019-08-23 14:38:25', '2019-07-24 14:38:25', '0', '0', '1', 's1.一阵风');
INSERT INTO `check_mail` VALUES ('2', '2252', '0', '10006', '1', '', 'test', 'test', '[]', '{\"99\":999999,\"200\":8888,\"9\":22}', '0', '0', '24', null, '2019-08-23 14:54:50', '2019-07-24 14:54:50', '0', '0', '1', 's1.一阵风');
INSERT INTO `check_mail` VALUES ('3', '2252', '0', '10006', '1', '', 'aaaa', 'bbbb', '[]', '{\"99\":88888,\"200\":9999}', '0', '0', '24', null, '2019-08-23 15:28:59', '2019-07-24 15:28:59', '0', '0', '1', 's1.一阵风');
INSERT INTO `check_mail` VALUES ('4', '2252', '0', '10006', '1', null, 'aaaa', 'bbbb', '[]', '{\"99\":11111,\"200\":2222}', '0', '0', '12', null, '2019-07-24 15:39:40', '2019-07-24 15:39:40', '0', '0', '0', 's1.一阵风');
INSERT INTO `check_mail` VALUES ('5', '2252', '0', '10006', '1', null, 'aaaa', 'bbbb', '[]', '{\"99\":88888,\"200\":9999}', '0', '0', '12', null, '2019-07-24 15:45:01', '2019-07-24 15:45:01', '0', '0', '1', 's1.一阵风');
INSERT INTO `check_mail` VALUES ('6', '2252', '0', '10006', '1', null, 'aaaa', 'bbbb', '[]', '{\"99\":88888,\"200\":9999}', '0', '0', '12', null, '2019-07-24 15:46:30', '2019-07-24 15:46:30', '0', '0', '0', 's1.一阵风');

-- ----------------------------
-- Table structure for machine_info
-- ----------------------------
DROP TABLE IF EXISTS `machine_info`;
CREATE TABLE `machine_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL DEFAULT '',
  `desc_info` varchar(256) NOT NULL DEFAULT '',
  `host` varchar(128) NOT NULL DEFAULT '',
  `outer_ip` varchar(32) NOT NULL DEFAULT '',
  `inner_ip` varchar(32) NOT NULL DEFAULT '',
  `is_init` tinyint(3) NOT NULL DEFAULT '0',
  `servers` text,
  `rtime` int(11) NOT NULL DEFAULT '0',
  `create_time` datetime DEFAULT NULL,
  `type` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of machine_info
-- ----------------------------
INSERT INTO `machine_info` VALUES ('1', '联运机器1', '4核16G', '114.67.103.84', '114.67.103.84', '114.67.103.84', '1', '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,221,222,223,224,225', '1533871591', '2018-08-10 11:26:31', '0');

-- ----------------------------
-- Table structure for osa_menu_url
-- ----------------------------
DROP TABLE IF EXISTS `osa_menu_url`;
CREATE TABLE `osa_menu_url` (
  `menu_id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_name` varchar(50) NOT NULL,
  `menu_url` varchar(255) NOT NULL,
  `module_id` int(11) NOT NULL,
  `is_show` tinyint(4) NOT NULL COMMENT '是否在sidebar里出现',
  `online` int(11) NOT NULL DEFAULT '1' COMMENT '在线状态，还是下线状态，即可用，不可用。',
  `shortcut_allowed` int(10) unsigned NOT NULL DEFAULT '1' COMMENT '是否允许快捷访问',
  `menu_desc` varchar(255) DEFAULT NULL,
  `father_menu` int(11) NOT NULL DEFAULT '0' COMMENT '上一级菜单',
  PRIMARY KEY (`menu_id`),
  UNIQUE KEY `menu_url` (`menu_url`)
) ENGINE=InnoDB AUTO_INCREMENT=198 DEFAULT CHARSET=utf8 COMMENT='功能链接';

-- ----------------------------
-- Records of osa_menu_url
-- ----------------------------
INSERT INTO `osa_menu_url` VALUES ('1', '首页', '/panel/index.php', '1', '0', '1', '1', '后台首页', '0');
INSERT INTO `osa_menu_url` VALUES ('20', '登入', '/login.php', '1', '0', '1', '1', '登入页面', '0');
INSERT INTO `osa_menu_url` VALUES ('23', 'ajax访问修改快捷菜单', '/ajax/shortcut.php', '1', '0', '1', '0', 'ajax请求', '0');
INSERT INTO `osa_menu_url` VALUES ('24', '添加便签', '/panel/quicknote_add.php', '1', '0', '1', '1', '添加quicknote的内容', '18');
INSERT INTO `osa_menu_url` VALUES ('25', '修改便签', '/panel/quicknote_modify.php', '1', '0', '1', '0', '修改quicknote的内容', '18');
INSERT INTO `osa_menu_url` VALUES ('26', '系统设置', '/panel/setting.php', '1', '0', '1', '0', '系统设置', '0');
INSERT INTO `osa_menu_url` VALUES ('101', '样例', '/sample/sample.php', '2', '1', '1', '1', '', '0');
INSERT INTO `osa_menu_url` VALUES ('104', '角色管理', '/user/role_op.php', '3', '1', '1', '1', '角色管理', '0');
INSERT INTO `osa_menu_url` VALUES ('105', '玩家profile', '/user/role_profile.php', '3', '0', '1', '1', '玩家profile', '0');
INSERT INTO `osa_menu_url` VALUES ('106', '玩家数据修改', '/user/role_modify.php', '3', '0', '1', '1', '玩家数据修改', '0');
INSERT INTO `osa_menu_url` VALUES ('107', '玩家邮件', '/user/role_mail.php', '3', '0', '1', '1', '玩家邮件发送物品', '104');
INSERT INTO `osa_menu_url` VALUES ('108', 'api接口功能', '/api/api.php', '3', '0', '1', '0', 'api接口功能', '0');
INSERT INTO `osa_menu_url` VALUES ('109', '邮件列表', '/user/role_maillist.php', '3', '1', '1', '1', '邮件列表', '0');
INSERT INTO `osa_menu_url` VALUES ('110', '游戏设置 ', '/user/game_setting.php', '3', '1', '1', '1', '游戏设置 ', '0');
INSERT INTO `osa_menu_url` VALUES ('111', '行会信息', '/user/guild.php', '3', '1', '1', '1', '行会信息', '0');
INSERT INTO `osa_menu_url` VALUES ('112', '系统公告', '/user/game_message.php', '3', '1', '1', '1', '跑马灯，登录提示消息框等', '0');
INSERT INTO `osa_menu_url` VALUES ('113', '添加系统消息', '/user/game_message_add.php', '3', '0', '1', '1', '添加系统消息(跑马灯、即时消息)', '112');
INSERT INTO `osa_menu_url` VALUES ('114', '修改系统消息', '/user/game_message_modify.php', '3', '0', '1', '1', '修改系统消息(跑马灯、即时消息)', '112');
INSERT INTO `osa_menu_url` VALUES ('115', '登录页公告', '/user/game_notice.php', '3', '1', '1', '1', '公告列表', '0');
INSERT INTO `osa_menu_url` VALUES ('116', '添加公告', '/user/game_notice_add.php', '3', '0', '1', '1', '添加公告', '115');
INSERT INTO `osa_menu_url` VALUES ('117', '修改公告', '/user/game_notice_modify.php', '3', '0', '1', '1', '修改公告', '115');
INSERT INTO `osa_menu_url` VALUES ('118', '选择平台区服', '/user/set_game_server.php', '3', '0', '1', '0', '', '0');
INSERT INTO `osa_menu_url` VALUES ('119', '封禁查询', '/user/role_banlist.php', '3', '1', '1', '1', '封禁查询', '0');
INSERT INTO `osa_menu_url` VALUES ('120', '封禁账号', '/user/role_ban.php', '3', '0', '1', '1', '封禁账号', '119');
INSERT INTO `osa_menu_url` VALUES ('121', '聊天监控', '/user/chat_monitor.php', '3', '1', '1', '1', '聊天监控', '0');
INSERT INTO `osa_menu_url` VALUES ('122', '批量封禁API', '/api/ban_api.php', '3', '0', '1', '0', '', '0');
INSERT INTO `osa_menu_url` VALUES ('123', '邮件审核', '/user/check_mails.php', '3', '1', '1', '1', '邮件审核', '0');
INSERT INTO `osa_menu_url` VALUES ('124', '通用ajaxAPI', '/api/ajax_api.php', '3', '0', '1', '0', '通用ajaxAPI', '0');
INSERT INTO `osa_menu_url` VALUES ('125', '月卡邮件', '/user/role_card_mail.php', '3', '1', '1', '1', '月卡邮件 无需审核', '0');
INSERT INTO `osa_menu_url` VALUES ('126', '积分邮件', '/user/role_integral_mail.php', '3', '1', '1', '1', '积分邮件', '0');
INSERT INTO `osa_menu_url` VALUES ('127', '玩家详情', '/user/role_info.php', '3', '0', '1', '0', '玩家详情', '104');
INSERT INTO `osa_menu_url` VALUES ('128', '礼包码', '/user/gift.php', '3', '1', '1', '1', '礼包码', '0');
INSERT INTO `osa_menu_url` VALUES ('129', '生成礼包码', '/user/giftAdd.php', '3', '0', '1', '1', '生成礼包码', '128');
INSERT INTO `osa_menu_url` VALUES ('130', '礼包码下载', '/user/giftDownload.php', '3', '1', '1', '1', '礼包码下载', '0');
INSERT INTO `osa_menu_url` VALUES ('131', '全服邮件', '/user/send_server_mails.php', '3', '1', '1', '1', '全服邮件', '0');
INSERT INTO `osa_menu_url` VALUES ('132', '充值商品统计', '/user/sta_buy_goods.php', '3', '1', '1', '1', '充值商品统计', '0');
INSERT INTO `osa_menu_url` VALUES ('133', '活动列表', '/user/activity_list.php', '3', '1', '1', '1', '', '0');
INSERT INTO `osa_menu_url` VALUES ('134', '活动编辑(慎重)', '/user/activity_op.php', '3', '0', '1', '1', '活动编辑,修改', '133');
INSERT INTO `osa_menu_url` VALUES ('140', '玩家邮件2', '/user/role_mail2.php', '3', '0', '1', '1', '玩家邮件2， 内部测试', '104');
INSERT INTO `osa_menu_url` VALUES ('141', '付费排行', '/statistics/topPay.php', '4', '1', '1', '0', '玩家付费排行', '0');
INSERT INTO `osa_menu_url` VALUES ('142', '运营数据统计', '/statistics/totalData.php', '4', '1', '1', '0', '运营数据统计', '0');
INSERT INTO `osa_menu_url` VALUES ('143', '新手引导流失', '/statistics/lostGuide.php', '4', '1', '1', '0', '新手引导流失统计', '0');
INSERT INTO `osa_menu_url` VALUES ('144', '玩家流失', '/statistics/lostUser.php', '4', '1', '1', '0', '流失玩家统计', '0');
INSERT INTO `osa_menu_url` VALUES ('145', '每日数据', '/statistics/everyServer.php', '4', '1', '1', '0', '分服每日数据统计', '0');
INSERT INTO `osa_menu_url` VALUES ('146', '新增付费', '/statistics/firstPay.php', '4', '1', '1', '0', '每日新增付费用户数据统计', '0');
INSERT INTO `osa_menu_url` VALUES ('147', '宠物拉霸', '/statistics/labaLog.php', '4', '1', '1', '0', '宠物拉霸统计', '0');
INSERT INTO `osa_menu_url` VALUES ('148', '购买物品', '/statistics/buyLog.php', '4', '1', '1', '0', '购买物品统计', '0');
INSERT INTO `osa_menu_url` VALUES ('149', '活动添加', '/user/activity_add.php', '3', '0', '1', '1', '活动添加', '133');
INSERT INTO `osa_menu_url` VALUES ('150', '关卡信息修改', '/user/role_progress.php', '3', '0', '1', '1', '关卡信息修改', '0');
INSERT INTO `osa_menu_url` VALUES ('151', '关卡统计', '/statistics/lostProgress.php', '4', '1', '1', '0', '关卡通关统计', '0');
INSERT INTO `osa_menu_url` VALUES ('153', '充值统计', '/statistics/rechargeStatistic.php', '4', '1', '1', '0', '', '0');
INSERT INTO `osa_menu_url` VALUES ('154', 'boss统计', '/statistics/bossStatistic.php', '4', '1', '1', '0', 'boss统计', '0');
INSERT INTO `osa_menu_url` VALUES ('155', '设置白名单', '/user/white_list.php', '3', '1', '1', '1', '', '0');
INSERT INTO `osa_menu_url` VALUES ('156', '在线人数', '/user/onlinenum.php', '3', '1', '1', '1', '在线人数', '0');
INSERT INTO `osa_menu_url` VALUES ('157', '充值明细', '/statistics/rechargeDetail.php', '4', '1', '1', '0', '充值明细', '0');
INSERT INTO `osa_menu_url` VALUES ('158', '模拟充值', '/user/rechargeSimulate.php', '3', '1', '1', '0', '模拟充值', '0');
INSERT INTO `osa_menu_url` VALUES ('172', '等级排行', '/statistics/levelRank.php', '4', '1', '1', '0', '', '0');
INSERT INTO `osa_menu_url` VALUES ('184', '用户获得物品', '/user/role_reward.php', '3', '0', '1', '0', '', '104');
INSERT INTO `osa_menu_url` VALUES ('193', '世界战力', '/user/servers_combat.php', '3', '0', '1', '0', '', '190');
INSERT INTO `osa_menu_url` VALUES ('194', '行会列表', '/user/guild_list.php', '3', '1', '1', '0', '', '0');
INSERT INTO `osa_menu_url` VALUES ('195', '行会成员', '/user/guild_person_list.php', '3', '0', '1', '0', '', '194');
INSERT INTO `osa_menu_url` VALUES ('197', '战斗服务管理', '/user/servers_group_battle_mgr.php', '3', '0', '1', '1', '战斗服务管理', '0');

-- ----------------------------
-- Table structure for osa_module
-- ----------------------------
DROP TABLE IF EXISTS `osa_module`;
CREATE TABLE `osa_module` (
  `module_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `module_name` varchar(50) NOT NULL,
  `module_url` varchar(128) NOT NULL,
  `module_sort` int(11) unsigned NOT NULL DEFAULT '1',
  `module_desc` varchar(255) DEFAULT NULL,
  `module_icon` varchar(32) DEFAULT 'icon-th' COMMENT '菜单模块图标',
  `online` int(11) NOT NULL DEFAULT '1' COMMENT '模块是否在线',
  PRIMARY KEY (`module_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='菜单模块';

-- ----------------------------
-- Records of osa_module
-- ----------------------------
INSERT INTO `osa_module` VALUES ('1', '控制面板', '/panel/index.php', '0', '配置OSAdmin的相关功能', 'icon-th-list', '1');
INSERT INTO `osa_module` VALUES ('3', '游戏管理', '/panel/index.php', '1', '游戏管理', 'icon-adjust', '1');

-- ----------------------------
-- Table structure for osa_quick_note
-- ----------------------------
DROP TABLE IF EXISTS `osa_quick_note`;
CREATE TABLE `osa_quick_note` (
  `note_id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'note_id',
  `note_content` varchar(255) COLLATE utf8_unicode_ci NOT NULL COMMENT '内容',
  `owner_id` int(10) unsigned NOT NULL COMMENT '谁添加的',
  PRIMARY KEY (`note_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='用于显示的quick note';

-- ----------------------------
-- Records of osa_quick_note
-- ----------------------------
INSERT INTO `osa_quick_note` VALUES ('6', '孔子说：万能的不是神，是程序员！', '1');

-- ----------------------------
-- Table structure for osa_system
-- ----------------------------
DROP TABLE IF EXISTS `osa_system`;
CREATE TABLE `osa_system` (
  `key_name` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `key_value` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='系统配置表';

-- ----------------------------
-- Records of osa_system
-- ----------------------------
INSERT INTO `osa_system` VALUES ('timezone', '\"Asia/Shanghai\"');

-- ----------------------------
-- Table structure for osa_sys_log
-- ----------------------------
DROP TABLE IF EXISTS `osa_sys_log`;
CREATE TABLE `osa_sys_log` (
  `op_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(32) NOT NULL,
  `action` varchar(255) NOT NULL,
  `class_name` varchar(255) NOT NULL COMMENT '操作了哪个类的对象',
  `class_obj` varchar(32) NOT NULL COMMENT '操作的对象是谁，可能为对象的ID',
  `result` text NOT NULL COMMENT '操作的结果',
  `op_time` int(11) NOT NULL,
  PRIMARY KEY (`op_id`),
  KEY `op_time` (`op_time`),
  KEY `class_name` (`class_name`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8 COMMENT='操作日志表';

-- ----------------------------
-- Records of osa_sys_log
-- ----------------------------
INSERT INTO `osa_sys_log` VALUES ('1', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"223.111.145.53\"}', '1563592281');
INSERT INTO `osa_sys_log` VALUES ('2', 'admin', 'ADD', 'GameMessage', '21', '{\"serverId\":\"0\",\"`type`\":\"1\",\"color\":\"#FF0000\",\"size\":\"18\",\"times\":\"5\",\"`interval`\":\"60\",\"sendTime\":\"2019-07-20 11:16:41\",\"expireTime\":\"2019-07-21 11:16:41\",\"message\":\"\\u5f00\\u670d\\u516c\\u544a\\uff1a\\u6b63\\u5f0f\\u5f00\\u670d\"}', '1563592621');
INSERT INTO `osa_sys_log` VALUES ('3', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"119.131.199.234\"}', '1563637465');
INSERT INTO `osa_sys_log` VALUES ('4', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"223.111.145.53\"}', '1563950201');
INSERT INTO `osa_sys_log` VALUES ('5', 'admin', 'LOGOUT', 'User', '1', '', '1563959923');
INSERT INTO `osa_sys_log` VALUES ('6', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"223.111.145.53\"}', '1563959937');
INSERT INTO `osa_sys_log` VALUES ('7', 'admin', 'LOGOUT', 'User', '1', '', '1563959961');
INSERT INTO `osa_sys_log` VALUES ('8', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"223.111.145.53\"}', '1563960668');
INSERT INTO `osa_sys_log` VALUES ('9', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"223.111.145.53\"}', '1563960668');
INSERT INTO `osa_sys_log` VALUES ('10', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"223.111.145.53\"}', '1563960696');
INSERT INTO `osa_sys_log` VALUES ('11', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"223.111.145.53\"}', '1563960740');
INSERT INTO `osa_sys_log` VALUES ('12', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"223.111.145.53\"}', '1563960741');
INSERT INTO `osa_sys_log` VALUES ('13', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"223.111.145.53\"}', '1563960886');
INSERT INTO `osa_sys_log` VALUES ('14', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"223.111.145.53\"}', '1563960887');
INSERT INTO `osa_sys_log` VALUES ('15', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"223.111.145.53\"}', '1563960954');
INSERT INTO `osa_sys_log` VALUES ('16', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"223.111.145.53\"}', '1563960955');
INSERT INTO `osa_sys_log` VALUES ('17', 'admin', 'LOGIN', 'User', '1', '{\"IP\":\"223.111.145.53\"}', '1564036668');

-- ----------------------------
-- Table structure for osa_user
-- ----------------------------
DROP TABLE IF EXISTS `osa_user`;
CREATE TABLE `osa_user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `real_name` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `user_desc` varchar(255) DEFAULT NULL,
  `login_time` int(11) DEFAULT NULL COMMENT '登录时间',
  `status` tinyint(4) NOT NULL DEFAULT '1',
  `login_ip` varchar(32) DEFAULT NULL,
  `user_group` int(11) NOT NULL,
  `template` varchar(32) NOT NULL DEFAULT 'default' COMMENT '主题模板',
  `shortcuts` text COMMENT '快捷菜单',
  `show_quicknote` int(11) NOT NULL DEFAULT '1' COMMENT '是否显示quicknote',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_name` (`user_name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='后台用户';

-- ----------------------------
-- Records of osa_user
-- ----------------------------
INSERT INTO `osa_user` VALUES ('1', 'admin', 'bb36078d9e853767ff8e05d4148e7795', 'SomewhereYu', 'www.52gmsy.com', 'admin@52gmsy.com', '初始的超级管理员!', '1564036668', '1', '223.111.145.53', '1', 'default', '2,7,11,13,14,18,21,24,107', '0');

-- ----------------------------
-- Table structure for osa_user_group
-- ----------------------------
DROP TABLE IF EXISTS `osa_user_group`;
CREATE TABLE `osa_user_group` (
  `group_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_name` varchar(32) DEFAULT NULL,
  `group_role` text CHARACTER SET utf8 COLLATE utf8_unicode_ci COMMENT '初始权限为1,5,17,18,22,23,24,25',
  `owner_id` int(11) DEFAULT NULL COMMENT '创建人ID',
  `group_desc` varchar(64) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COMMENT='账号组';

-- ----------------------------
-- Records of osa_user_group
-- ----------------------------
INSERT INTO `osa_user_group` VALUES ('1', '超级管理员组', '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203', '1', '万能的不是神，是程序员!');
INSERT INTO `osa_user_group` VALUES ('2', '默认账号组', '1,5,17,18,20,22,23,24,25,101', '1', '默认账号组');
INSERT INTO `osa_user_group` VALUES ('3', '测试员', '1,5,17,18,22,23,24,25,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,140', '1', '测试人员');
INSERT INTO `osa_user_group` VALUES ('4', '运营组', '1,5,17,18,22,23,24,25', '1', '运营组人员');

-- ----------------------------
-- Table structure for sample
-- ----------------------------
DROP TABLE IF EXISTS `sample`;
CREATE TABLE `sample` (
  `sample_id` int(11) NOT NULL,
  `sample_content` varchar(255) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Records of sample
-- ----------------------------
INSERT INTO `sample` VALUES ('1', '这是一个样例');
