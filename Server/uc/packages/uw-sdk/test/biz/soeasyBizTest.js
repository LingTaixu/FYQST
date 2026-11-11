var core4Test = require("uw-test").core4Test;
var soeasyBiz = require("../../src/biz/soeasy/soeasyBiz");
var cb = core4Test.cb4Test;
var trans = core4Test.trans;
var client = core4Test.uwClient;

function login(){
    //{"uid":44477358,"sessionId":"CxkmW4QY66xvn6tG"}
    soeasyBiz.login({uid:1111, t:1515584581, sign:'f9527a757b5791ef8d3204c77183493c'},cb);
    //e645e6ac4cf04254ad4a122376170587f3370313
}

function checkPay(){
   /* var payData = c_payInfo[7];
    var goodsId = payData[10002][0];*/
    var orderData = {"appid":"4444444",
			    	"sdkindx":"222",
			    	"uid":"1111",
			    	"feeid":"333",
			    	"feemoney":"5500",
			    	"orderid":"id121314T00",
			    	"extradata":"sn13213Y",
			    	"paytime":"2017-03-07 13:52:14",
			    	"prover": "1",
			    	"paystatus":"1",
			    	"sign":"13435f28153a4c152b64f29ea4daa858" };
    soeasyBiz.checkPay(orderData,function(err,data){
        console.log(err,data);
    });
 }
 
 function getPayData(){
 
 	var data =  [1,"1111","sn13213Y",9,121,"sky01"];
 	var ret = soeasyBiz.getPayData(data);
 	console.log("getPayData:", ret);
 };

/**********************************************************/
getPayData();

