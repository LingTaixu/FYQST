/**
后台-账号组(ManagerGroup)
后台-账号组
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 组名 **/
    this.name = null;/*组名*/
    /** 权限 **/
    this.rights = null;/*权限*/

};
_Class.tableName = 'uw_manager_group';