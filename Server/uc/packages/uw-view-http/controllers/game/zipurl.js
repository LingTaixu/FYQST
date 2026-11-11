/**
 * Created by Administrator on 2015/4/16.
 */

var fileHelper = require("../../src/fileHelper");
var path = require("path");
exports.config ={
    method:"get"
};
exports.handler = function(req, res){
    var zipConfig = fileHelper.getJson(path.join(__dirname,"../../config/zipUrlConfig.json"));
    var egretDeviceId = req.query.egretDeviceId;

    var retData = {code_url: zipConfig.code_url,update_url: zipConfig.update_url,password: zipConfig.password};

    if(zipConfig.customParams){
        retData.customParams = zipConfig.customParams;
    }

    if(zipConfig.white_ids.indexOf(egretDeviceId)>-1){
        retData.code_url = zipConfig.white_code_url;
        retData.update_url = zipConfig.white_update_url;
    }
    res.jsonp(retData);
};
