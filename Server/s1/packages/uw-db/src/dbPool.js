var format = require("mysql").format;

var mysql = require('mysql');
/**
 * Desc: 数据库Query的格式化。注意，自定义的只有三个参数。
 * @param sql
 * @param values
 * @param timeZone
 * @returns {*}
 */
function queryFormat (sql, values, timeZone) {
    if(sql.search(/\:(\w+)/) >= 0){
        return sql.replace(/\:(\w+)/g, function (txt, key) {
            if (Object.prototype.hasOwnProperty.call(values || {}, key)) return this.escape(values[key]);
            return txt;
        }.bind(this));
    }
    return format(sql, values, false, timeZone);
}
/*
 * Create mysql connection pool.
 */
// var recyleTimer = null;
var create = function(cnnCfg) {
    //console.error('pool create');
    var pool  = mysql.createPool({
        connectionLimit : cnnCfg.maxCnnNum || 60,
        acquireTimeout:30000,
        host: cnnCfg.host,
        port: cnnCfg.port,
        user: cnnCfg.user,
        password: cnnCfg.password,
        database: cnnCfg.database,
        queryFormat : queryFormat,
        multipleStatements: true,
        debug : cnnCfg.debug || false
    });
    //start recyle check
    // clearInterval(recyleTimer);
    // recyleTimer = setInterval(function(){
    //     var curSize = pool._freeConnections.length;
    //     console.error('pool frees ',curSize,'all',pool._allConnections.length);
    //     if(curSize>20){
    //         for(var i=20;i<curSize;i++){
    //             pool._freeConnections[i]&&pool._freeConnections[i].destroy();
    //         }
    //     }
    // },3000);//30*60000);
    return pool;
};

exports.create = create;
