module.exports = {
    "id":1,
    "cityServerPort" : 10001,
    "mainHttpHost":"127.0.0.1",
    "mainHttpPort":9901,
    "loginCnn":{ "host" : "127.0.0.1", "port" : "3306","database":"ttf_ly_login","user":"fyqst","password":"pwd123456"},//主数据库
    "serverCnn":{ "host" : "127.0.0.1", "port" : "3306","database":"ttf_ly_game1","user":"fyqst","password":"pwd123456"},  //游戏服数据库
    "log":{"basePath":"../logs/cityserver/","levels":"INFO"},
    "logHost":"127.0.0.1",
    "logPort":7000
}
