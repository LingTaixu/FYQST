/**
 * Created by Administrator on 14-7-9.
 */
var fs = require("fs");
var path = require("path");
var entity = require("uw-entity");
var config = {
    EntityName:"ArenaRecordEntity",
    Entity:entity["ArenaRecordEntity"],
    DaoModule:"uw-arena",
    DaoName:"arenaRecordDao"
};
var baseDir = __dirname+"/../../..";
var dirName = config.Entity.tableName.replace("uw_","");
var viewDirPath = baseDir+"/views/"+dirName;

var createList = function(){
    var strContent = fs.readFileSync(baseDir  +"/views/template/list.html").toString();
    //列
    var tableCols = "";
    var entity = new config.Entity();
    for(var key in entity){
        tableCols+=('<th data-options="field:\''+key+'\',width:80">'+key+'</th>\n');
    }
    strContent = strContent.replace("<$tableCols>",tableCols);
    strContent = strContent.replace(/<[\$]moduleName>/g,dirName);
    writeFile(viewDirPath,"list.html",strContent);
};


var createEdit = function(){
    var strContent = fs.readFileSync(baseDir  +"/views/template/edit.html").toString();
    //列
    var tableCols = "";
    var entity = new config.Entity();
    for(var key in entity){
        if(key=="id") continue;
        tableCols+='<tr>\n';
        tableCols+='<td>'+key+'</td>\n';
        tableCols+='<td><input id="input-'+key+'" class="textbox" style="width: 300px;" type="text" name="'+key+'" data-options="required:true" value = \'<%=entity["'+key+'"]%>\' /></td>\n';
        tableCols+='</tr>\n';
    }
    strContent = strContent.replace("<$tableCols>",tableCols);
    strContent = strContent.replace(/<[\$]moduleName>/g,dirName);
    writeFile(viewDirPath,"edit.html",strContent);
};

var createAdd = function(){
    var strContent = fs.readFileSync(baseDir  +"/views/template/add.html").toString();
    //列
    var tableCols = "";
    var entity = new config.Entity();
    for(var key in entity){
        if(key=="id") continue;
        var locValue = entity[key];
        if(locValue==null) locValue="";
        tableCols+='<tr>\n';
        tableCols+='<td>'+key+'</td>\n';
        tableCols+='<td><input id="input-'+key+'" class="textbox" style="width: 300px;" type="text" name="'+key+'" data-options="required:true" value = "'+locValue+'" /></td>\n';
        tableCols+='</tr>\n';
    }
    strContent = strContent.replace("<$tableCols>",tableCols);
    strContent = strContent.replace(/<[\$]moduleName>/g,dirName);
    writeFile(viewDirPath,"add.html",strContent);
};

var createShow = function(){
    var strContent = fs.readFileSync(baseDir  +"/views/template/show.html").toString();
    //列
    var tableCols = "";
    var entity = new config.Entity();
    for(var key in entity){
        if(key=="id") continue;
        tableCols+='<tr>\n';
        tableCols+='<td class="td-left">'+key+'</td>\n';
        tableCols+='<td class="td-right"><div id="div-'+key+'" ><%=entity["'+key+'"]%></div></td>\n';
        tableCols+='</tr>\n';
    }
    strContent = strContent.replace("<$tableCols>",tableCols);
    strContent = strContent.replace(/<[\$]moduleName>/g,dirName);
    writeFile(viewDirPath,"show.html",strContent);
};

var createControllers = function(){
    var controllers = ["add.js","add_post.js","del_post.js","edit.js","edit_post.js","index.js","list.js","list_data.js","show.js"];
    for (var i = 0; i < controllers.length; i++) {
        var locController = controllers[i];
        var strContent = fs.readFileSync(baseDir  +"/controllers/template/"+locController).toString();
        //列
        strContent = strContent.replace(/<[\$]DaoModule>/g,config.DaoModule);
        strContent = strContent.replace(/<[\$]Dao>/g,config.DaoName);
        strContent = strContent.replace(/<[\$]Entity>/g,config.EntityName);
        strContent = strContent.replace(/<-----\*\//g,"");
        strContent = strContent.replace(/\/\*----->/g,"");
        writeFile(baseDir  +"/controllers/"+dirName+"/",locController,strContent);
    }
};


var writeFile = function(viewDirPath,fileName,strContent){
    if (!fs.existsSync(viewDirPath)) {
        fs.mkdirSync(viewDirPath);
    }
    fs.writeFileSync(viewDirPath +"/"+fileName, strContent);
};



/***********************/


var create = function(){
    createList();
    createAdd();
    createEdit();
    createShow();
    createControllers();
};

create();