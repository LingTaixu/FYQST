/**
 * Created by Administrator on 2015/1/20.
 */
var http = require("http");

var run = function(){
    var opt = {
        host:'192.168.1.222',
        port:'8010',
        method:'GET',
        path:'/server/?type=1',
        headers:{
        }
    };
    var body = '';
    console.log("启动中..........");
    var req = http.request(opt, function(res) {
        res.on('data',function(d){
            body += d;
        }).on('end', function(){
            if(body){
                console.error("启动失败!: " + body);
            }else{
                console.log("启动成功！");
            }
        });
    }).on('error', function(e) {
        console.error("启动失败!: " + e.message);
    });
    req.end();

};

run();
