************************************************************************************
服务器环境：
1，服务器运行系统：linux
1，服务端运行环境：node.js(目前稳定版本是v0.10.32)
2，运营后台系统：windows 2003|2008
2，数据库：mysql
************************************************************************************

部署步骤

一，安装服务器环境

二，导入数据库
3.1,导入2个数据库 chuanqi_1(游戏服)和chuanqi_main(主账号)

三，配置端口
打开chuanqi_server\env-cfg目录 设置端口，标有(外)的是外网端口
main_cfg.js  //配置主登陆
view_cfg.js //配置支付
server_cfg.js  //配置服

四，启动服务器

切换到目录chuanqi_server1
4.1,启动主登陆http服务，使用命令node mainApp.js
4.2,启动支付回调http服务，使用命令node viewApp.js
4.3,启动游戏逻辑服务，切换到目录chuanqi_server,使用命令node serverApp.js

六，客户端设置
6.1，打开chuanqi_client\resource\project.json，修改下面2行即可
"httpHost" : "112.124.106.143",
"httpPort" : "5005",
这里的ip对应服务器外网ip,端口对应main_cfg.js中的mainHttpPort

七，开新服
1，拷贝源代码
2，复制空数据库，导入常规活动

备注：
1，主登陆http服务和支付回调http服务建议用域名方式，方便切换服务器

2018.6.5 更新

一.导入数据库
1.导入三个数据库分别为 chuanqi_login,chuanqi_main,chuanqi_qingbiao
2.在chuanqi_login中的uw_server_info表，增加服务器配置。
3.在chuanqi_main中的uw_game_config表，增加跨服相关配置。（老功能，未在使用，但是代码仍在，后续重做后，将废弃）
4.如果在服务器启动之前未配置2，3。服务器启动报错后，要清空chuanqi_qingbiao中uw_user和uw_pkout表


