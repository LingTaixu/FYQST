var express = require('express');
var app = module.exports = express();
var path = require("path");
var cfg = require("./cfg.json");
var serverMgr = require('./src/serverMgr');
//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
app.use(express.static(path.join(__dirname, "public")));
app.get('/server', function (req, res) {
    //res.send('Welcome');
    //console.log(req);

    serverMgr.handle(req.query.type,function(err){
        if(err){
            res.send(err);
        }else{
            console.log("启动成功");
            res.send();
        }
    });
})
/* istanbul ignore next */
if (!module.parent) {
    app.listen(cfg.port, cfg.host);
    console.log('Express started on port ' + cfg.port + " host " + cfg.host);
}