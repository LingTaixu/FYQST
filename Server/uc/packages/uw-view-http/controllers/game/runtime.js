/**
 * Created by Administrator on 2015/4/16.
 */

exports.config ={
    method:"get"
};
exports.handler = function(req, res,next){
    res.render("runtime",{});
};
