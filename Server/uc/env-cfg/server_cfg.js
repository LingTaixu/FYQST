/**
 * Created by Administrator on 2015/10/30.
*/
module.exports = {
    "id":1,//服务器id
    "serverHttpPort" : 20001,//主登录端口，登陆验证(唯一)(外)
    "mainCnn":{ "host" : "127.0.0.1", "port" : "3306","database":"ttf_ly_main","user":"fyqst","password":"pwd123456"},//主数据库
    "kefuCnn":{ "host" : "127.0.0.1", "port" : "3306","database":"ttf_ly_main","user":"fyqst","password":"pwd123456"},//主数据库
    "loginCnn":{ "host" : "127.0.0.1", "port" : "3306","database":"ttf_ly_login","user":"fyqst","password":"pwd123456"},//主数据库
    "serverCnn":{ "host" : "127.0.0.1", "port" : "3306","database":"ttf_ly_game1","user":"fyqst","password":"pwd123456"},  //游戏服数据库
    "log":{"basePath":"./logs/","levels":"ERROR"},//log日志
    "notify_url":"http://pay.chuanqi.hgame.com:24002/pay/hgame.html",
    "saveDBInterval":3,
    "stopInterval": 60,
    "adminIps":"127.0.0.1",
    "biHost":"127.0.0.1",
    "logHost":"127.0.0.1",
    "logPort":7000,
    "biSID": 20000
}
