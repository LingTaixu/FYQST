var http = require('http');
var https = require('https');
var querystring = require('querystring');

/**
 * 请求http
 * @param options
    var options = {
        host: 'buy.itunes.apple.com',
        port: 443,
        path: "/verifyReceipt/",
        method: 'POST'
    };
 * @param writeData
 * @param cb
 */
exports.requestHttp = function(options,writeData,cb){
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var str = "";
        res.on('data', function (chunk) {
            str+=chunk;
        });
        res.on('end', function () {
            cb(null,JSON.parse(str));
        });
    }); 
    req.on('error', function(e) {
        cb(e.message);
    });
    req.write(writeData,"utf8");
    req.end();
};

exports.requestHttps = function(options,writeData,cb){
    var req = https.request(options, function(res) {
        res.setEncoding('utf8');
        var str = "";
        res.on('data', function (chunk) {
            str+=chunk;
        });
        res.on('end', function () {
            cb(null,JSON.parse(str));
        });
    });
    req.on('error', function (e) { 
        cb(e.message);
    });
    req.write(writeData);
    req.end();
};