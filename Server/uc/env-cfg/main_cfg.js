/**
 * Created by Administrator on 2015/10/30.
 */

module.exports = {
    "id":1,
    "mainHttpPort" : 9901,//主登录端口，登陆验证(唯一)(外)
    "mainCnn":{ "host" : "127.0.0.1", "port" : "3306","database":"ttf_ly_main","user":"fyqst","password":"pwd123456"},//主数据库
    "loginCnn":{ "host" : "127.0.0.1", "port" : "3306","database":"ttf_ly_login","user":"fyqst","password":"pwd123456"},//主数据库
    "log":{"basePath":"./logs/main/","levels":"ERROR"},//配置log日志
    "logHost":"127.0.0.1",
    "logPort":7000
}
