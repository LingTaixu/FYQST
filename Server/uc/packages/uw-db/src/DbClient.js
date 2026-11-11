var dbUtils = require("./dbUtils");
module.exports = function(pool){
    // this.query = function(sql, args, cb){
    //     var arr = Array.prototype.slice.apply(arguments);
    //     var cb = arr.pop();
    //     pool.getConnection(function(err, connection) {
    //         if(err) return cb(err);
    //         arr.push(function(err, results){
    //             connection.release();
    //             err ? cb(err) : cb(null, results);
    //         });
    //         connection.query.apply(connection, arr);
    //     });


    // };
    this.query = function(sql,args,cb){
        pool.query(sql,args, function(err, results){
             err ? cb(err) : cb(null, results);
        });
    };
    dbUtils.initDbOper(this);
};


